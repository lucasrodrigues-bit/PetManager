"use server";

import { createClient } from "../../shared/supabase/server";
import { getHorarios } from "../horario-funcionamento/queries";

interface CriarAgendamentoInput {
  petId: number;
  servicoIds: number[];
  dataHora: string; // ISO 8601
}

interface CriarAgendamentoResult {
  error?: string;
  id?: number;
}

function extrairDiaEHora(dataHoraIso: string): { diaSemana: number; hora: string } {
  const data = new Date(dataHoraIso);
  return { diaSemana: data.getDay(), hora: data.toTimeString().slice(0, 5) };
}

/**
 * Cria um agendamento com status inicial "agendado" (default do
 * banco), validando que o horário está dentro do expediente
 * cadastrado (AGD-01). Sem trava de concorrência de propósito — dois
 * agendamentos simultâneos no mesmo horário são ambos aceitos (risco
 * aceito na spec, AD já documentado no MVP original).
 */
export async function criarAgendamento({
  petId,
  servicoIds,
  dataHora,
}: CriarAgendamentoInput): Promise<CriarAgendamentoResult> {
  if (servicoIds.length === 0) {
    return { error: "Selecione ao menos um serviço." };
  }

  const { diaSemana, hora } = extrairDiaEHora(dataHora);
  const horarios = await getHorarios();
  const horarioDoDia = horarios.find((h) => h.diaSemana === diaSemana);

  if (!horarioDoDia || hora < horarioDoDia.horaAbertura || hora >= horarioDoDia.horaFechamento) {
    return { error: "Esse horário está fora do expediente cadastrado para esse dia." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: agendamento, error } = await supabase
    .from("agendamentos")
    .insert({ pet_id: petId, data_hora: dataHora, criado_por: user?.id ?? null })
    .select("id")
    .single();

  if (error || !agendamento) {
    return { error: "Não foi possível criar o agendamento. Tente novamente." };
  }

  const { error: servicosError } = await supabase
    .from("agendamento_servicos")
    .insert(servicoIds.map((servicoId) => ({ agendamento_id: agendamento.id, servico_id: servicoId })));

  if (servicosError) {
    return { error: "Agendamento criado, mas não foi possível vincular os serviços. Tente novamente." };
  }

  return { id: agendamento.id };
}
