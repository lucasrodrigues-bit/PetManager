import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Rotas acessíveis exclusivamente ao papel `dono` (AUTH-03). */
const ROTAS_RESTRITAS_A_DONO = ["/estoque", "/vendas/produto", "/relatorios"];

function rotaRestritaADono(pathname: string): boolean {
  return ROTAS_RESTRITAS_A_DONO.some((rota) => pathname.startsWith(rota));
}

export async function middleware(request: NextRequest) {
  if (!rotaRestritaADono(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "dono") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/estoque/:path*", "/vendas/produto/:path*", "/relatorios/:path*"],
};
