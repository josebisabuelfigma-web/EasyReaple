import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSessionUser } from "@/lib/auth";
import { RESOURCES, sanitize } from "@/lib/resources";
import { refreshSite, removeImage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

export async function PUT(req: NextRequest, { params }: { params: { resource: string; id: string } }) {
  if (!(await getSessionUser(req))) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });
  const cfg = RESOURCES[params.resource];
  if (!cfg || !UUID.test(params.id)) return NextResponse.json({ error: "Recurso desconocido." }, { status: 404 });

  const { values, error: invalid } = sanitize(cfg, await req.json().catch(() => ({})));
  if (invalid || !values) return NextResponse.json({ error: invalid }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const imageKey = cfg.imageKey;

  let previousImage: string | null = null;
  if (imageKey && imageKey in values) {
    const { data: before } = await supabase.from(cfg.table).select(imageKey).eq("id", params.id).maybeSingle();
    previousImage = (before as any)?.[imageKey] ?? null;
  }

  const { data, error } = await supabase.from(cfg.table).update(values).eq("id", params.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (imageKey && previousImage && previousImage !== values[imageKey]) await removeImage(previousImage);

  refreshSite();
  return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { resource: string; id: string } }) {
  if (!(await getSessionUser(req))) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });
  const cfg = RESOURCES[params.resource];
  if (!cfg || !UUID.test(params.id)) return NextResponse.json({ error: "Recurso desconocido." }, { status: 404 });

  const supabase = getSupabaseAdmin();
  const imageKey = cfg.imageKey;

  let image: string | null = null;
  if (imageKey) {
    const { data: row } = await supabase.from(cfg.table).select(imageKey).eq("id", params.id).maybeSingle();
    image = (row as any)?.[imageKey] ?? null;
  }

  const { error } = await supabase.from(cfg.table).delete().eq("id", params.id);
  if (error) {
    // 23503 = otra tabla depende de esta fila (productos de una categoría o marca).
    const message =
      error.code === "23503"
        ? `No se puede borrar: todavía hay productos que usan esta ${cfg.singular}. Cámbialos de ${cfg.singular} primero, o desmarca «Visible».`
        : error.message;
    return NextResponse.json({ error: message }, { status: error.code === "23503" ? 409 : 500 });
  }

  await removeImage(image);
  refreshSite();
  return NextResponse.json({ ok: true });
}
