import type { PublicProduct } from "@/lib/siteData";

// Tarjeta de producto. La usan la Tienda y los «Productos populares» del Inicio.
export default function ProductCard({
  product: p,
  categoryName,
  phone,
}: {
  product: PublicProduct;
  categoryName?: string | null;
  phone: string;
}) {
  const label = p.sold_out ? null : p.badge || (p.featured ? "Popular" : null);
  return (
    <article className={`product-card active${p.sold_out ? " sold-out" : ""}`}>
      {p.sold_out ? <span className="product-badge badge-soldout">Agotado</span> : label && <span className="product-badge">{label}</span>}
      <div className={`product-thumb${p.image ? " has-image" : ""}`}>
        {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <i className="fa-solid fa-mobile-screen"></i>}
      </div>
      <div className="product-body">
        {categoryName && <span className="product-category">{categoryName}</span>}
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
  );
}
