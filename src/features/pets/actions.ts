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

type Porte = "pequeno" | "medio" | "grande";

interface CriarPetInput {
  tutorId: number;
  nome: string;
  raca: string;
  porte: Porte;
}

interface CriarPetResult {
  error?: string;
  id?: number;
}

/**
 * Cadastra um pet vinculado a um tutor já existente. A FK
 * `pets.tutor_id -> tutores.id` já garante isso no banco (código de
 * erro Postgres `23503`) — aqui só traduzimos pra uma mensagem
 * amigável em vez de vazar o erro cru do banco.
 */
export async function criarPet({ tutorId, nome, raca, porte }: CriarPetInput): Promise<CriarPetResult> {
  if (nome.length > NOME_MAX_LENGTH) {
    return { error: `O nome não pode ter mais de ${NOME_MAX_LENGTH} caracteres.` };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pets")
    .insert({ tutor_id: tutorId, nome, raca, porte })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23503") {
      return { error: "Tutor não encontrado. Selecione um tutor já cadastrado." };
    }
    return { error: "Não foi possível salvar o pet. Tente novamente." };
  }

  return { id: data.id };
}


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
