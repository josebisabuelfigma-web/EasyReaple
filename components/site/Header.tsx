"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearch } from "./SearchContext";
import { SITE_PAGES } from "@/lib/pages";

const LINKS = SITE_PAGES.filter((p) => p.menu);

export default function Header({ whatsappHref }: { whatsappHref: string }) {
  const { search, setSearch } = useSearch();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Al cambiar de página se cierran el menú y el buscador.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // El buscador busca productos: al enviarlo se abre la Tienda con el texto.
  function submit() {
    setMenuOpen(false);
    setSearchOpen(false);
    if (search.trim() && pathname !== "/tienda") router.push("/tienda");
    else if (search.trim()) document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  }

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  const searchBox = (
    <div className="search-box">
      <input
        type="text"
        className="search-input"
        placeholder="Buscar productos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button className="search-btn" aria-label="Buscar" onClick={submit}>
        <i className="fa-solid fa-magnifying-glass"></i>
      </button>
    </div>
  );

  return (
    <>
      <div className={`menu-overlay${menuOpen ? " active" : ""}`} onClick={() => setMenuOpen(false)}></div>

      <header className={`header${scrolled ? " scrolled" : ""}`}>
        <div className="container header-container">
          <Link href="/" className="logo" aria-label="EasyReaple, ir al inicio">
            <img src="/logo.png" alt="Logo EasyReaple" />
          </Link>

          <nav className={`navbar${menuOpen ? " active" : ""}`} aria-label="Principal">
            <ul className="nav-menu">
              {LINKS.map((l) => (
                <li key={l.path}>
                  <Link href={l.path} className={isActive(l.path) ? "active" : ""} aria-current={isActive(l.path) ? "page" : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {searchBox}

          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <i className="fa-brands fa-whatsapp"></i>
            WhatsApp
          </a>

          <button
            className={`search-toggle${searchOpen ? " active" : ""}`}
            aria-label="Buscar"
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>

          <button
            className={`menu-toggle${menuOpen ? " active" : ""}`}
            aria-label="Abrir menú"
            onClick={() => {
              setMenuOpen((v) => !v);
              setSearchOpen(false);
            }}
          >
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}></i>
          </button>
        </div>

        <div className={`mobile-search-bar${searchOpen ? " active" : ""}`}>{searchBox}</div>
      </header>
    </>
  );
}
