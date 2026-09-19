"use server";

import { createClient } from "../../shared/supabase/server";

interface SalvarHorarioInput {
  diaSemana: number; // 0 (domingo) a 6 (sábado)
  horaAbertura: string; // "HH:MM"
  horaFechamento: string; // "HH:MM"
}

interface SalvarHorarioResult {
  error?: string;
}

/**
 * Cadastra ou edita o horário de um dia da semana (upsert manual por
 * `dia_semana` — a tabela não tem constraint de unicidade nessa
 * coluna, então fazemos select-then-insert/update aqui em vez de
 * depender de `ON CONFLICT`).
 *
 * A validação de fechamento > abertura também existe como CHECK no
 * banco (defesa em profundidade) — aqui ela só evita a viagem
 * desnecessária ao banco e dá uma mensagem amigável.
 */
export async function salvarHorario({
  diaSemana,
  horaAbertura,
  horaFechamento,
}: SalvarHorarioInput): Promise<SalvarHorarioResult> {
  if (horaFechamento <= horaAbertura) {
    return { error: "O horário de fechamento deve ser depois do horário de abertura." };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("horarios_funcionamento")
    .select("id")
    .eq("dia_semana", diaSemana)
    .maybeSingle();

  const payload = {
    dia_semana: diaSemana,
    hora_abertura: horaAbertura,
    hora_fechamento: horaFechamento,
  };

  const { error } = existente
    ? await supabase.from("horarios_funcionamento").update(payload).eq("id", existente.id)
    : await supabase.from("horarios_funcionamento").insert(payload);

  if (error) {
    return { error: "Não foi possível salvar o horário. Tente novamente." };
  }

  return {};
}
