import { cache } from "react";
import { getSupabasePublic, publicImageUrl } from "@/lib/supabaseAdmin";
import { mergeSettings, type SiteSettings } from "@/lib/settings";

export type PublicProduct = {
  id: string;
  name: string;
  description: string;
  category_id: string | null;
  brand_id: string | null;
  image: string | null;
  badge: string | null;
  sold_out: boolean;
  featured: boolean;
};

export type SiteData = {
  settings: SiteSettings;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  products: PublicProduct[];
  services: { id: string; icon: string; title: string; text: string }[];
  repairServices: { id: string; icon: string; title: string; text: string; image: string | null }[];
  equipment: { id: string; title: string; text: string; image: string | null }[];
  gallery: { id: string; title: string; caption: string; image: string | null }[];
  testimonials: { id: string; name: string; city: string; rating: number; text: string }[];
};

type ListResult = { data: any[] | null; error: { message: string } | null };

// cache(): el Inicio, el menú y el pie de página piden los datos en la misma
// visita y así se leen de Supabase una sola vez.
export const getSiteData = cache(async (): Promise<SiteData> => {
  const empty: SiteData = {
    settings: mergeSettings(null),
    categories: [],
    brands: [],
    products: [],
    services: [],
    repairServices: [],
    equipment: [],
    gallery: [],
    testimonials: [],
  };

  // Sin variables de entorno (por ejemplo al compilar en local) se muestra
  // el sitio con los textos por defecto.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return empty;

  const db = getSupabasePublic();

  // Solo filas visibles, en el orden que se definió en el panel.
  const list = (table: string, columns: string): Promise<ListResult> =>
    Promise.resolve(
      db
        .from(table)
        .select(columns)
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }) as unknown as PromiseLike<ListResult>
    );

  const [settings, categories, brands, products, services, repairServices, equipment, gallery, testimonials] = await Promise.all([
    db.from("site_settings").select("data").eq("id", 1).maybeSingle(),
    list("categories", "id, name"),
    list("brands", "id, name"),
    list("products", "id, name, description, category_id, brand_id, image_path, badge, sold_out, featured"),
    list("services", "id, icon, title, text"),
    list("repair_services", "id, icon, title, text, image_path"),
    list("equipment", "id, title, text, image_path"),
    list("gallery_items", "id, title, caption, image_path"),
    list("testimonials", "id, name, city, rating, text"),
  ]);

  const failed = [settings, categories, brands, products, services, repairServices, equipment, gallery, testimonials].find(
    (r) => r.error
  );
  if (failed?.error) throw new Error(`No se pudo leer el contenido del sitio: ${failed.error.message}`);

  return {
    settings: mergeSettings((settings.data as any)?.data),
    categories: categories.data || [],
    brands: brands.data || [],
    products: (products.data || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category_id: p.category_id,
      brand_id: p.brand_id,
      image: publicImageUrl(p.image_path),
      badge: p.badge,
      sold_out: p.sold_out,
      featured: !!p.featured,
    })),
    services: services.data || [],
    repairServices: (repairServices.data || []).map((r) => ({
      id: r.id,
      icon: r.icon,
      title: r.title,
      text: r.text,
      image: publicImageUrl(r.image_path),
    })),
    equipment: (equipment.data || []).map((e) => ({
      id: e.id,
      title: e.title,
      text: e.text,
      image: publicImageUrl(e.image_path),
    })),
    gallery: (gallery.data || []).map((g) => ({
      id: g.id,
      title: g.title,
      caption: g.caption,
      image: publicImageUrl(g.image_path),
    })),
    testimonials: testimonials.data || [],
  };
});
