import { createClient } from "../../shared/supabase/server";

export interface AgendamentoDoDia {
  id: number;
  petId: number;
  petNome: string;
  dataHora: string;
  status: "agendado" | "concluido" | "cancelado";
  servicoNomes: string[];
}

interface RowPet {
  nome: string;
}

interface RowAgendamentoServico {
  servicos: { nome: string } | null;
}

interface AgendamentoRow {
  id: number;
  pet_id: number;
  data_hora: string;
  status: "agendado" | "concluido" | "cancelado";
  pets: RowPet | null;
  agendamento_servicos: RowAgendamentoServico[] | null;
}

/**
 * Retorna todos os agendamentos de um dia (AGD-02), incluindo
 * cancelados — a exibição visual diferenciada (cor/estilo) é
 * responsabilidade do componente de calendário (T32), não desta
 * query.
 */
export async function getAgendamentosPorDia(data: string): Promise<AgendamentoDoDia[]> {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("agendamentos")
    .select(
      "id, pet_id, data_hora, status, pets ( nome ), agendamento_servicos ( servicos ( nome ) )",
    )
    .gte("data_hora", `${data}T00:00:00`)
    .lte("data_hora", `${data}T23:59:59.999`)
    .order("data_hora");

  return ((rows ?? []) as unknown as AgendamentoRow[]).map((row) => ({
    id: row.id,
    petId: row.pet_id,
    petNome: row.pets?.nome ?? "Pet removido",
    dataHora: row.data_hora,
    status: row.status,
    servicoNomes: (row.agendamento_servicos ?? [])
      .map((s) => s.servicos?.nome)
      .filter((nome): nome is string => Boolean(nome)),
  }));
}
