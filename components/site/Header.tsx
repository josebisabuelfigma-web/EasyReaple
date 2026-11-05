"use client";

import { useEffect, useState } from "react";
import { useSearch } from "./SearchContext";

const LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#galeria", label: "Galería" },
  { href: "#sobremi", label: "Nosotros" },
  { href: "#tecnologia", label: "Tecnología" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header({ whatsappHref }: { whatsappHref: string }) {
  const { search, setSearch } = useSearch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  function goToCatalog() {
    setMenuOpen(false);
    setSearchOpen(false);
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  }

  function submit() {
    if (search.trim()) goToCatalog();
  }

  const searchBox = (
    <div className="search-box">
      <input
        type="text"
        className="search-input"
        placeholder="Buscar..."
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
          <a href="#inicio" className="logo">
            <img src="/logo.png" alt="Logo EasyReaple" />
          </a>

          <nav className={`navbar${menuOpen ? " active" : ""}`}>
            <ul className="nav-menu">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setMenuOpen(false)}>
                    {l.label}
                  </a>
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
