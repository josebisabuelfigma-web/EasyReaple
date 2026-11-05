import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSessionUser } from "@/lib/auth";
import { SETTING_GROUPS, SETTING_KEYS, mergeSettings } from "@/lib/settings";
import { refreshSite, removeImage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await getSessionUser(req))) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });

  const { data, error } = await getSupabaseAdmin().from("site_settings").select("data").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: mergeSettings(data?.data) });
}

export async function PUT(req: NextRequest) {
  if (!(await getSessionUser(req))) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const clean: Record<string, string> = {};
  for (const key of SETTING_KEYS) {
    if (typeof body[key] === "string") clean[key] = (body[key] as string).trim().slice(0, 2000);
  }

  // Validaciones puntuales.
  if ("whatsapp_number" in clean) {
    clean.whatsapp_number = clean.whatsapp_number.replace(/\D/g, "");
    if (clean.whatsapp_number.length < 10) {
      return NextResponse.json({ error: "El número de WhatsApp debe tener indicativo y número (solo dígitos)." }, { status: 400 });
    }
  }
  for (const key of ["instagram_url", "facebook_url", "tiktok_url", "youtube_url", "x_url"]) {
    if (clean[key] && !/^https?:\/\//i.test(clean[key])) {
      return NextResponse.json({ error: "Los enlaces de redes deben empezar por https://" }, { status: 400 });
    }
  }
  for (const key of SETTING_GROUPS.flatMap((g) => g.fields).filter((f) => f.type === "image").map((f) => f.key)) {
    if (clean[key] && !/^[a-z0-9][a-z0-9/_.-]*$/i.test(clean[key])) {
      return NextResponse.json({ error: "Ruta de imagen no válida." }, { status: 400 });
    }
  }

  const supabase = getSupabaseAdmin();
  const { data: current } = await supabase.from("site_settings").select("data").eq("id", 1).maybeSingle();
  const before = mergeSettings(current?.data);
  const merged = { ...before, ...clean };

  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, data: merged, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (before.about_image_path && before.about_image_path !== merged.about_image_path) {
    await removeImage(before.about_image_path);
  }

  refreshSite();
  return NextResponse.json({ settings: merged });
}
