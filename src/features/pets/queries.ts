import { createClient } from "../../shared/supabase/server";

export interface Tutor {
  id: number;
  nome: string;
  telefone: string;
}

/** Lista tutores, com busca opcional por nome OU telefone (FILT-01/02). */
export async function getTutores(busca?: string): Promise<Tutor[]> {
  const supabase = await createClient();
  let query = supabase.from("tutores").select("id, nome, telefone").order("nome");

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,telefone.ilike.%${busca}%`);
  }

  const { data } = await query;
  return data ?? [];
}

export type Porte = "pequeno" | "medio" | "grande";

export interface Pet {
  id: number;
  tutorId: number;
  nome: string;
  raca: string;
  porte: Porte;
}

/** Lista pets ativos, com busca opcional por nome (FILT-01/02). */
export async function getPets(busca?: string): Promise<Pet[]> {
  const supabase = await createClient();
  let query = supabase
    .from("pets")
    .select("id, tutor_id, nome, raca, porte")
    .eq("ativo", true)
    .order("nome");

  if (busca) {
    query = query.ilike("nome", `%${busca}%`);
  }

  const { data } = await query;
  return (data ?? []).map((row) => ({
    id: row.id,
    tutorId: row.tutor_id,
    nome: row.nome,
    raca: row.raca,
    porte: row.porte as Porte,
  }));
}
