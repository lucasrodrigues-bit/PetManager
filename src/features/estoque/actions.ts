"use server";

import { createClient } from "../../shared/supabase/server";

interface CriarProdutoInput {
  nome: string;
  categoria: string;
  precoUnitario: number;
  estoqueMinimo: number;
  saldoInicial?: number;
}

interface CriarProdutoResult {
  error?: string;
  id?: number;
}

/** Cadastra um produto (EST-01). Acesso restrito a `dono` via RLS. */
export async function criarProduto({
  nome,
  categoria,
  precoUnitario,
  estoqueMinimo,
  saldoInicial = 0,
}: CriarProdutoInput): Promise<CriarProdutoResult> {
  if (!Number.isFinite(precoUnitario) || precoUnitario < 0) {
    return { error: "O preço deve ser um número válido e não pode ser negativo." };
  }
  if (!Number.isFinite(estoqueMinimo) || estoqueMinimo < 0) {
    return { error: "O estoque mínimo deve ser um número válido e não pode ser negativo." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .insert({
      nome,
      categoria,
      preco_unitario: precoUnitario,
      estoque_minimo: estoqueMinimo,
      saldo_estoque: saldoInicial,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Não foi possível salvar o produto. Tente novamente." };
  }

  return { id: data.id };
}

interface RegistrarEntradaResult {
  error?: string;
}

/**
 * Soma `quantidade` ao saldo do produto e registra a movimentação
 * (EST-01). Select-then-update, não atômico — mesmo risco de
 * concorrência já aceito em outras partes do projeto (ex.: agenda),
 * baixo impacto real com 1-2 usuários internos por petshop.
 */
export async function registrarEntrada(
  produtoId: number,
  quantidade: number,
): Promise<RegistrarEntradaResult> {
  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    return { error: "Informe uma quantidade válida (maior que zero)." };
  }

  const supabase = await createClient();

  const { data: produto, error: fetchError } = await supabase
    .from("produtos")
    .select("saldo_estoque")
    .eq("id", produtoId)
    .single();

  if (fetchError || !produto) {
    return { error: "Produto não encontrado." };
  }

  const { error: updateError } = await supabase
    .from("produtos")
    .update({ saldo_estoque: produto.saldo_estoque + quantidade })
    .eq("id", produtoId);

  if (updateError) {
    return { error: "Não foi possível registrar a entrada. Tente novamente." };
  }

  await supabase.from("movimentacoes_estoque").insert({
    produto_id: produtoId,
    tipo: "entrada",
    quantidade,
  });

  return {};
}
