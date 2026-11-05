import { NextRequest, NextResponse } from "next/server";

// Solo el panel (/admin) y sus APIs (/api/admin) exigen sesión. El sitio
// público, el login y la recuperación de contraseña son abiertos.
const SESSION_COOKIE = "er_session";

async function sha256Hex(message: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// La cookie guarda un token aleatorio; la sesión vive en app_sessions. Se
// consulta por REST porque el middleware corre en el runtime Edge.
async function hasValidSession(token: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  try {
    const res = await fetch(
      `${url}/rest/v1/app_sessions?select=expires_at,app_users!inner(active)&token_hash=eq.${await sha256Hex(token)}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return false;
    const row = (await res.json())?.[0];
    return !!row && new Date(row.expires_at) >= new Date() && !!row.app_users?.active;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (token && (await hasValidSession(token))) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Tu sesión terminó. Inicia sesión de nuevo." }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
