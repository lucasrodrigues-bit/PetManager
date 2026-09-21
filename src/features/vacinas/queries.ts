import { createClient } from "../../shared/supabase/server";

export interface Vacina {
  id: number;
  petId: number;
  nome: string;
  dataAplicacao: string;
  dataRetornoPrevista: string;
}

/**
 * Histórico completo de vacinas de um pet (VAC-02), ordenado por data
 * de aplicação (mais recente primeiro). Sem limite de retenção — todo
 * histórico fica sempre disponível.
 */
export async function getVacinasPorPet(petId: number): Promise<Vacina[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("vacinas")
    .select("id, pet_id, nome, data_aplicacao, data_retorno_prevista")
    .eq("pet_id", petId)
    .order("data_aplicacao", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    petId: row.pet_id,
    nome: row.nome,
    dataAplicacao: row.data_aplicacao,
    dataRetornoPrevista: row.data_retorno_prevista,
  }));
}
