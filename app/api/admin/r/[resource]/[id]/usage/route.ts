import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSessionUser } from "@/lib/auth";
import { RESOURCES } from "@/lib/resources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

// Cuántas filas de otra tabla dependen de esta (para avisar antes de borrar).
export async function GET(req: NextRequest, { params }: { params: { resource: string; id: string } }) {
  if (!(await getSessionUser(req))) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });
  const cfg = RESOURCES[params.resource];
  if (!cfg || !UUID.test(params.id)) return NextResponse.json({ error: "Recurso desconocido." }, { status: 404 });
  if (!cfg.usedBy) return NextResponse.json({ count: 0 });

  const { count, error } = await getSupabaseAdmin()
    .from(cfg.usedBy.table)
    .select("id", { count: "exact", head: true })
    .eq(cfg.usedBy.column, params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ count: count ?? 0 });
}
