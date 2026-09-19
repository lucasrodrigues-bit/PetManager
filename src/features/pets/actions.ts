"use server";

import { parsePhoneNumberFromString } from "libphonenumber-js";
import { createClient } from "../../shared/supabase/server";

interface CriarTutorInput {
  nome: string;
  telefone: string;
}

interface CriarTutorResult {
  error?: string;
  id?: number;
}

const NOME_MAX_LENGTH = 255;

/**
 * Cadastra um tutor, validando telefone BR (com DDD) via
 * `libphonenumber-js` (CAD-02) e limitando o nome a 255 caracteres
 * (CAD-04). O telefone é salvo já normalizado em formato E.164
 * (`+55DDXXXXXXXXX`), consistente independente de como foi digitado.
 */
export async function criarTutor({ nome, telefone }: CriarTutorInput): Promise<CriarTutorResult> {
  if (nome.length > NOME_MAX_LENGTH) {
    return { error: `O nome não pode ter mais de ${NOME_MAX_LENGTH} caracteres.` };
  }

  const phone = parsePhoneNumberFromString(telefone, "BR");
  if (!phone || !phone.isValid()) {
    return {
      error: "Informe um telefone válido no formato brasileiro, com DDD (ex.: (79) 99999-9999).",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tutores")
    .insert({ nome, telefone: phone.number })
    .select("id")
    .single();

  if (error) {
    return { error: "Não foi possível salvar o tutor. Tente novamente." };
  }

  return { id: data.id };
}
