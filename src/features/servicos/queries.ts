import { createClient } from "../../shared/supabase/server";

export interface ServicoParaAgendamento {
  id: number;
  nome: string;
}

export interface ServicoComPreco {
  id: number;
  nome: string;
  precoInterno: number;
}

/**
 * Usada na tela de agendamento (SERV-02) — nunca inclui o preço.
 * Duas camadas de proteção: o `select()` já não pede a coluna, e o
 * `map()` reforça isso descartando qualquer campo extra que um select
 * futuro (ex.: um `select("*")` por engano) venha a trazer.
 */
export async function getServicosParaAgendamento(): Promise<ServicoParaAgendamento[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("servicos").select("id, nome").order("nome");

  return (data ?? []).map((row) => ({ id: row.id, nome: row.nome }));
}

/** Uso restrito ao papel `dono` (cadastro de serviços, relatórios). */
export async function getServicosComPreco(): Promise<ServicoComPreco[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("servicos")
    .select("id, nome, preco_interno")
    .order("nome");

  return (data ?? []).map((row) => ({
    id: row.id,
    nome: row.nome,
    precoInterno: Number(row.preco_interno),
  }));
}
