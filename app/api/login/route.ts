import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  LOCK_MINUTES,
  MAX_FAILED_ATTEMPTS,
  SESSION_COOKIE,
  createSession,
  sessionCookieOptions,
  stripSpaces,
  verifyAgainstDummy,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function findUser(username: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("app_users")
    .select("id, username, password_hash, active, failed_attempts, locked_until")
    .eq("username_key", username.toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = stripSpaces(String(body?.username || ""));
    const password = String(body?.password || "");

    const user = username ? await findUser(username) : null;

    if (!user) {
      await verifyAgainstDummy(password);
      return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return NextResponse.json(
        { error: `Demasiados intentos fallidos. Intenta de nuevo en ${LOCK_MINUTES} minutos.` },
        { status: 429 }
      );
    }

    const supabase = getSupabaseAdmin();

    if (!(await verifyPassword(password, user.password_hash))) {
      const attempts = (user.failed_attempts || 0) + 1;
      const lock = attempts >= MAX_FAILED_ATTEMPTS;
      await supabase
        .from("app_users")
        .update({
          failed_attempts: lock ? 0 : attempts,
          locked_until: lock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString() : null,
        })
        .eq("id", user.id);
      return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ error: "Tu usuario está inactivo." }, { status: 403 });
    }

    if (user.failed_attempts || user.locked_until) {
      await supabase.from("app_users").update({ failed_attempts: 0, locked_until: null }).eq("id", user.id);
    }

    const token = await createSession(user.id);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "No se pudo iniciar sesión." }, { status: 500 });
  }
}
