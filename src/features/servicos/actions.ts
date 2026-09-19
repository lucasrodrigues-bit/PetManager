"use server";

import { createClient } from "../../shared/supabase/server";

interface CriarServicoInput {
  nome: string;
  precoInterno: number;
}

interface CriarServicoResult {
  error?: string;
  id?: number;
}

/**
 * Cadastra um serviço com preço interno (SERV-01). O preço nunca é
 * exibido na tela de agendamento (SERV-02) — essa regra vive nas
 * queries (`getServicosParaAgendamento` x `getServicosComPreco`, T16),
 * não aqui.
 */
export async function criarServico({ nome, precoInterno }: CriarServicoInput): Promise<CriarServicoResult> {
  if (!Number.isFinite(precoInterno) || precoInterno < 0) {
    return { error: "O preço deve ser um número válido e não pode ser negativo." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicos")
    .insert({ nome, preco_interno: precoInterno })
    .select("id")
    .single();

  if (error) {
    return { error: "Não foi possível salvar o serviço. Tente novamente." };
  }

  return { id: data.id };
}
