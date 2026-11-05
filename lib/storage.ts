import { getSupabaseAdmin, SITE_BUCKET } from "@/lib/supabaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

// Borra una foto del bucket (si falla no interrumpe: queda huérfana, sin daño).
export async function removeImage(path: string | null | undefined) {
  if (!path) return;
  try {
    await getSupabaseAdmin().storage.from(SITE_BUCKET).remove([path]);
  } catch {
    // ignorar
  }
}

// El sitio público guarda lo leído en caché; esto lo refresca al guardar en el panel.
export function refreshSite() {
  revalidateTag("site");
  revalidatePath("/");
}
