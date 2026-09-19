import { createClient } from "../../shared/supabase/server";

export interface Horario {
  diaSemana: number;
  horaAbertura: string; // "HH:MM"
  horaFechamento: string; // "HH:MM"
}

/** Lista os horários já cadastrados (um por dia da semana, quando existir). */
export async function getHorarios(): Promise<Horario[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("horarios_funcionamento")
    .select("dia_semana, hora_abertura, hora_fechamento")
    .order("dia_semana");

  return (data ?? []).map((row) => ({
    diaSemana: row.dia_semana,
    horaAbertura: String(row.hora_abertura).slice(0, 5),
    horaFechamento: String(row.hora_fechamento).slice(0, 5),
  }));
}
