import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSessionUser, stripSpaces, validateEmail, validateUsername } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });
  return NextResponse.json({ username: user.username, email: user.email });
}

// Cambia el usuario y el correo de recuperación.
export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const username = stripSpaces(String(body?.username || ""));
    const email = String(body?.email || "").trim().toLowerCase();

    const invalidUser = validateUsername(username);
    if (invalidUser) return NextResponse.json({ error: invalidUser }, { status: 400 });
    const invalidEmail = validateEmail(email);
    if (invalidEmail) return NextResponse.json({ error: invalidEmail }, { status: 400 });

    const { error } = await getSupabaseAdmin().from("app_users").update({ username, email }).eq("id", user.id);
    if (error) {
      const message = error.code === "23505" ? "Ese nombre de usuario ya está en uso." : error.message;
      return NextResponse.json({ error: message }, { status: error.code === "23505" ? 409 : 500 });
    }
    return NextResponse.json({ ok: true, username, email });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error inesperado." }, { status: 500 });
  }
}
