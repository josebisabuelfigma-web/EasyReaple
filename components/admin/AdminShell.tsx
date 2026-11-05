"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/admin", label: "Resumen", icon: "fa-solid fa-gauge" },
  { href: "/admin/servicios", label: "Servicios", icon: "fa-solid fa-screwdriver-wrench" },
  { href: "/admin/productos", label: "Productos", icon: "fa-solid fa-box-open" },
  { href: "/admin/categorias", label: "Categorías", icon: "fa-solid fa-tags" },
  { href: "/admin/marcas", label: "Marcas", icon: "fa-solid fa-copyright" },
  { href: "/admin/galeria", label: "Galería", icon: "fa-solid fa-images" },
  { href: "/admin/testimonios", label: "Testimonios", icon: "fa-solid fa-comment-dots" },
  { href: "/admin/ventajas", label: "Ventajas", icon: "fa-solid fa-shield-halved" },
  { href: "/admin/equipos", label: "Equipos", icon: "fa-solid fa-microscope" },
  { href: "/admin/ajustes", label: "Textos, contacto y redes", icon: "fa-solid fa-sliders" },
  { href: "/admin/cuenta", label: "Mi cuenta", icon: "fa-solid fa-user-gear" },
];

export default function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="a-shell">
      <div className="a-topbar">
        <button aria-label="Abrir menú" onClick={() => setOpen(true)}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <img src="/logo.png" alt="" />
        <strong>Panel EasyReaple</strong>
      </div>

      <div className={`a-backdrop${open ? " open" : ""}`} onClick={() => setOpen(false)} />

      <aside className={`a-sidebar${open ? " open" : ""}`}>
        <div className="a-brand">
          <img src="/logo.png" alt="" />
          Panel EasyReaple
        </div>

        <nav className="a-nav">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={active ? "active" : ""}>
                <i className={n.icon}></i>
                {n.label}
              </Link>
            );
          })}
          <hr />
          <a href="/" target="_blank" rel="noopener noreferrer">
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
            Ver el sitio
          </a>
        </nav>

        <div className="a-side-foot">
          <div className="a-user">
            Sesión de <strong>{username}</strong>
          </div>
          <button className="a-btn ghost-light small" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="a-main">{children}</main>
    </div>
  );
}
