import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso em Client Components.
 * A sessão é sincronizada via cookies (o mesmo mecanismo usado pelo
 * cliente server-side em `shared/supabase/server.ts`), então não há
 * estado duplicado entre os dois.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
