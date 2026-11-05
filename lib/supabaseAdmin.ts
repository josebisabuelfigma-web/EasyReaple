import { createClient } from "@supabase/supabase-js";

// Solo se usa en el servidor. La Service Role Key tiene acceso total y
// NUNCA debe llegar al navegador.
function build(tags?: string[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan las variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) =>
        fetch(input, tags ? { ...init, next: { tags } } : { ...init, cache: "no-store" }),
    },
  });
}

// Panel y login: siempre datos frescos.
export function getSupabaseAdmin() {
  return build();
}

// Sitio público: las lecturas se guardan en caché con la etiqueta "site" y
// se invalidan cuando el panel guarda un cambio (revalidateTag("site")).
export function getSupabasePublic() {
  return build(["site"]);
}

export const SITE_BUCKET = "site";

export function publicImageUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${SITE_BUCKET}/${path}`;
}
