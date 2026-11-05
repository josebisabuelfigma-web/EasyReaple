// Páginas públicas del sitio. Esta lista alimenta el menú, el pie de página y
// el sitemap. Para agregar una página nueva (por ejemplo «Seguimiento» de
// reparaciones) basta con crear su carpeta en app/(site)/ y sumarla aquí.

export type SitePage = {
  path: string;
  label: string;
  menu: boolean;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly";
};

export const SITE_PAGES: SitePage[] = [
  { path: "/", label: "Inicio", menu: true, priority: 1, changeFrequency: "weekly" },
  { path: "/servicios", label: "Servicios", menu: true, priority: 0.9, changeFrequency: "weekly" },
  { path: "/tienda", label: "Tienda", menu: true, priority: 0.8, changeFrequency: "daily" },
  { path: "/nosotros", label: "Nosotros", menu: true, priority: 0.7, changeFrequency: "monthly" },
];
