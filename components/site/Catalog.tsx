"use client";

import { useMemo, useState } from "react";
import { useSearch } from "./SearchContext";
import type { PublicProduct } from "@/lib/siteData";

type Props = {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  products: PublicProduct[];
  whatsappNumber: string;
};

export default function Catalog({ categories, brands, products, whatsappNumber }: Props) {
  const { search } = useSearch();
  const [category, setCategory] = useState("todos");
  const [brand, setBrand] = useState("todas");

  const categoryNames = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const okCategory = category === "todos" || p.category_id === category;
      // Sin marca = compatible con todas.
      const okBrand = brand === "todas" || !p.brand_id || p.brand_id === brand;
      const okSearch = !term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
      return okCategory && okBrand && okSearch;
    });
  }, [products, category, brand, search]);

  const phone = whatsappNumber.replace(/\D/g, "");

  return (
    <>
      {brands.length > 0 && (
        <div className="products-filters">
          <button className={`filter-btn${brand === "todas" ? " active" : ""}`} onClick={() => setBrand("todas")}>
            Todas las marcas
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              className={`filter-btn${brand === b.id ? " active" : ""}`}
              onClick={() => setBrand(b.id)}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <div className="products-filters">
          <button className={`filter-btn${category === "todos" ? " active" : ""}`} onClick={() => setCategory("todos")}>
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`filter-btn${category === c.id ? " active" : ""}`}
              onClick={() => setCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="products-grid">
        {filtered.map((p) => (
          <article key={p.id} className={`product-card active${p.sold_out ? " sold-out" : ""}`}>
            {p.sold_out ? (
              <span className="product-badge badge-soldout">Agotado</span>
            ) : (
              p.badge && <span className="product-badge">{p.badge}</span>
            )}
            <div className={`product-thumb${p.image ? " has-image" : ""}`}>
              {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <i className="fa-solid fa-mobile-screen"></i>}
            </div>
            <div className="product-body">
              {p.category_id && categoryNames[p.category_id] && (
                <span className="product-category">{categoryNames[p.category_id]}</span>
              )}
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div className="product-footer">
                {p.sold_out ? (
                  <span className="product-soldout">
                    <i className="fa-solid fa-ban"></i> Agotado
                  </span>
                ) : (
                  <a
                    className="product-cta"
                    href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hola, quiero cotizar: ${p.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa-brands fa-whatsapp"></i> Cotizar
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="products-empty">
          {products.length === 0
            ? "Pronto publicaremos nuestro catálogo."
            : "No encontramos productos que coincidan con tu búsqueda."}
        </p>
      )}
    </>
  );
}
