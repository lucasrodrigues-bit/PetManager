import { createClient } from "../../shared/supabase/server";
import { getCurrentUserRole } from "../auth/queries";

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  precoUnitario: number;
  saldoEstoque: number;
  estoqueMinimo: number;
  estoqueBaixo: boolean;
}

interface GetProdutosFiltro {
  busca?: string;
  categoria?: string;
}

/**
 * Lista produtos com busca (nome) e filtro por categoria (FILT-01,
 * FILT-02), calculando `estoqueBaixo`. Restrito ao papel `dono`
 * (EST-04) — quem não é dono recebe lista vazia, nunca dado real
 * (defesa em profundidade: RLS já bloqueia no banco, isso aqui evita
 * até a tentativa de leitura).
 */
export async function getProdutos(filtro: GetProdutosFiltro = {}): Promise<Produto[]> {
  const role = await getCurrentUserRole();
  if (role !== "dono") {
    return [];
  }

  const supabase = await createClient();
  let query = supabase
    .from("produtos")
    .select("id, nome, categoria, preco_unitario, saldo_estoque, estoque_minimo")
    .order("nome");

  if (filtro.busca) {
    query = query.ilike("nome", `%${filtro.busca}%`);
  }
  if (filtro.categoria) {
    query = query.eq("categoria", filtro.categoria);
  }

  const { data } = await query;

  return (data ?? []).map((row) => ({
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    precoUnitario: Number(row.preco_unitario),
    saldoEstoque: row.saldo_estoque,
    estoqueMinimo: row.estoque_minimo,
    estoqueBaixo: row.saldo_estoque <= row.estoque_minimo,
  }));
}
