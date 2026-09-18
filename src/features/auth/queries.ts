import { createClient } from "../../shared/supabase/server";

export type UserRole = "dono" | "recepcionista";

/**
 * Retorna o papel do usuário autenticado, lendo de `profiles`.
 * `null` cobre tanto "não autenticado" quanto "autenticado mas sem
 * profile" (estado inconsistente que não deve travar a chamada).
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile?.role as UserRole | undefined) ?? null;
}
