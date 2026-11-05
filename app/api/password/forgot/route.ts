import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { RESET_COOLDOWN_SECONDS, RESET_TTL_MINUTES, createPasswordResetToken, stripSpaces } from "@/lib/auth";
import { passwordResetEmailHtml, sendMail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Respuesta única: desde afuera no se puede saber qué usuarios o correos existen.
const GENERIC = {
  ok: true,
  message:
    "Si los datos corresponden a un usuario con correo registrado, te enviamos un enlace para elegir una contraseña nueva. Revisa también la carpeta de spam.",
};

// Acepta el usuario o el correo registrado.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = stripSpaces(String(body?.identifier || "")).toLowerCase();
    if (!identifier) return NextResponse.json(GENERIC);

    const supabase = getSupabaseAdmin();
    const column = identifier.includes("@") ? "email" : "username_key";
    const { data: user, error } = await supabase
      .from("app_users")
      .select("id, username, active, email")
      .eq(column, identifier)
      .maybeSingle();
    if (error) throw new Error(error.message);

    if (!user || !user.active || !user.email) return NextResponse.json(GENERIC);

    const { data: last } = await supabase
      .from("password_resets")
      .select("created_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (last && Date.now() - new Date(last.created_at).getTime() < RESET_COOLDOWN_SECONDS * 1000) {
      return NextResponse.json(GENERIC);
    }

    const token = await createPasswordResetToken(user.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    try {
      await sendMail({
        to: user.email,
        subject: "Restablecer tu contraseña de EasyReaple",
        html: passwordResetEmailHtml({
          username: user.username,
          resetUrl: `${appUrl}/restablecer/${token}`,
          minutes: RESET_TTL_MINUTES,
        }),
      });
    } catch (mailErr: any) {
      console.error("Fallo el correo de restablecer contraseña:", mailErr.message);
    }

    return NextResponse.json(GENERIC);
  } catch (err: any) {
    console.error("Error en /api/password/forgot:", err.message);
    return NextResponse.json(GENERIC);
  }
}
