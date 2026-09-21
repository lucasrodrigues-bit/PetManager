"use server";

import { createClient } from "../../shared/supabase/server";

interface RegistrarVacinaInput {
  petId: number;
  nome: string;
  dataAplicacao: string; // "YYYY-MM-DD"
  dataRetornoPrevista: string; // "YYYY-MM-DD"
}

interface RegistrarVacinaResult {
  error?: string;
  id?: number;
}

/**
 * Registra uma vacina aplicada (VAC-01). A checagem de retorno >=
 * aplicação já existe como CHECK no banco (migration `0002`) — aqui
 * só reforça antes, pra mensagem amigável e evitar round-trip
 * desnecessário (mesmo padrão de `salvarHorario`, T9).
 */
export async function registrarVacina({
  petId,
  nome,
  dataAplicacao,
  dataRetornoPrevista,
}: RegistrarVacinaInput): Promise<RegistrarVacinaResult> {
  if (dataRetornoPrevista < dataAplicacao) {
    return { error: "A data de retorno não pode ser anterior à data de aplicação." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vacinas")
    .insert({
      pet_id: petId,
      nome,
      data_aplicacao: dataAplicacao,
      data_retorno_prevista: dataRetornoPrevista,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Não foi possível registrar a vacina. Tente novamente." };
  }

  return { id: data.id };
}
