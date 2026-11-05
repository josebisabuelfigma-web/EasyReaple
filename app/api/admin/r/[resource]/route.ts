import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSessionUser } from "@/lib/auth";
import { RESOURCES, sanitize } from "@/lib/resources";
import { refreshSite } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { resource: string } }) {
  if (!(await getSessionUser(req))) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });
  const cfg = RESOURCES[params.resource];
  if (!cfg) return NextResponse.json({ error: "Recurso desconocido." }, { status: 404 });

  const { data, error } = await getSupabaseAdmin()
    .from(cfg.table)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest, { params }: { params: { resource: string } }) {
  if (!(await getSessionUser(req))) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });
  const cfg = RESOURCES[params.resource];
  if (!cfg) return NextResponse.json({ error: "Recurso desconocido." }, { status: 404 });

  const { values, error: invalid } = sanitize(cfg, await req.json().catch(() => ({})));
  if (invalid || !values) return NextResponse.json({ error: invalid }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // Sin orden indicado, queda al final de la lista.
  if (!("sort_order" in values) || values.sort_order === 0) {
    const { data: last } = await supabase
      .from(cfg.table)
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    values.sort_order = (last?.sort_order ?? 0) + 1;
  }

  const { data, error } = await supabase.from(cfg.table).insert(values).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  refreshSite();
  return NextResponse.json({ item: data });
}
