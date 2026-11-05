// Versión segura para el navegador (no importa nada del servidor).
export function imageUrl(path: string | null | undefined) {
  if (!path) return "";
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site/${path}`;
}
