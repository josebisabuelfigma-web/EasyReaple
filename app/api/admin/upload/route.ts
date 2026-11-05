import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import sharp from "sharp";
import { getSupabaseAdmin, SITE_BUCKET } from "@/lib/supabaseAdmin";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const FOLDERS = new Set(["products", "equipment", "gallery", "about", "services"]);

// Recibe una foto, la reduce (máx. 1400 px) y la convierte a WebP para que el
// sitio cargue rápido y el almacenamiento rinda. Devuelve la ruta guardada.
export async function POST(req: NextRequest) {
  try {
    if (!(await getSessionUser(req))) {
      return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "products");

    if (!(file instanceof File)) return NextResponse.json({ error: "No llegó ninguna imagen." }, { status: 400 });
    if (!FOLDERS.has(folder)) return NextResponse.json({ error: "Carpeta no válida." }, { status: 400 });
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Solo se aceptan imágenes JPG, PNG o WebP." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen pesa más de 8 MB. Elige una más liviana." }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());
    let output: Buffer;
    try {
      output = await sharp(input)
        .rotate()
        .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      return NextResponse.json({ error: "No se pudo leer la imagen. Prueba con otra." }, { status: 400 });
    }

    const path = `${folder}/${Date.now()}-${randomBytes(4).toString("hex")}.webp`;
    const { error } = await getSupabaseAdmin()
      .storage.from(SITE_BUCKET)
      .upload(path, output, { contentType: "image/webp", cacheControl: "31536000" });
    if (error) return NextResponse.json({ error: `No se pudo guardar la imagen: ${error.message}` }, { status: 500 });

    return NextResponse.json({
      path,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${SITE_BUCKET}/${path}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error inesperado." }, { status: 500 });
  }
}
