import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

async function count(table: string, filter?: (q: any) => any) {
  let q = getSupabaseAdmin().from(table).select("id", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: n } = await q;
  return n ?? 0;
}

export default async function AdminHome() {
  const [products, soldOut, categories, gallery, testimonials] = await Promise.all([
    count("products"),
    count("products", (q) => q.eq("sold_out", true)),
    count("categories"),
    count("gallery_items"),
    count("testimonials"),
  ]);

  const stats = [
    { href: "/admin/productos", icon: "fa-solid fa-box-open", value: products, label: "Productos" },
    { href: "/admin/productos", icon: "fa-solid fa-ban", value: soldOut, label: "Agotados" },
    { href: "/admin/categorias", icon: "fa-solid fa-tags", value: categories, label: "Categorías" },
    { href: "/admin/galeria", icon: "fa-solid fa-images", value: gallery, label: "Fotos en galería" },
    { href: "/admin/testimonios", icon: "fa-solid fa-comment-dots", value: testimonials, label: "Testimonios" },
  ];

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Resumen</h1>
          <p>Desde aquí administras todo el contenido del sitio. Cada cambio que guardes se ve de inmediato, sin tocar código.</p>
        </div>
      </div>

      <div className="a-grid-stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="a-stat">
            <i className={s.icon}></i>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="a-card">
        <h2>Atajos</h2>
        <p className="a-sub">Lo que más se usa.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="a-btn primary" href="/admin/productos">Gestionar productos</Link>
          <Link className="a-btn" href="/admin/ajustes">Cambiar WhatsApp, horario y redes</Link>
          <Link className="a-btn" href="/admin/cuenta">Cambiar mi contraseña</Link>
        </div>
      </div>
    </>
  );
}
