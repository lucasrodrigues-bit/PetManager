"use server";

import { createClient } from "../../shared/supabase/server";

const MENSAGEM_ERRO_GENERICA = "E-mail ou senha inválidos";

interface SignInResult {
  error?: string;
}

/**
 * Autentica via Supabase Auth (e-mail/senha). Em caso de falha, retorna
 * sempre a mesma mensagem genérica — nunca indica se o problema foi o
 * e-mail ou a senha (AUTH-02).
 */
export async function signIn(email: string, password: string): Promise<SignInResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: MENSAGEM_ERRO_GENERICA };
  }

  return {};
}
