import type { Metadata } from "next";
import Link from "next/link";
import { getSiteData } from "@/lib/siteData";
import { whatsappLink } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";
import TestimonialSlider from "@/components/site/TestimonialSlider";
import ProductCard from "@/components/site/ProductCard";
import { RepairCard, RichText, SectionHead } from "@/components/site/parts";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata("/");

export default async function HomePage() {
  const data = await getSiteData();
  const s = data.settings;
  const wa = whatsappLink(s.whatsapp_number);
  const phone = s.whatsapp_number.replace(/\D/g, "");
  const categoryNames = Object.fromEntries(data.categories.map((c) => [c.id, c.name]));
  const featuredServices = data.repairServices.slice(0, 6);
  const popular = data.products.filter((p) => p.featured).slice(0, 8);

  return (
    <>
      {/* PORTADA */}
      <section className="hero" id="inicio">
        <div id="particles-js"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <h1>
              {s.hero_title} <span>{s.hero_highlight}</span>
            </h1>
            <p>
              <RichText text={s.hero_text} />
            </p>
            <div className="hero-info">
              <div>
                <i className="fa-solid fa-location-dot"></i>
                {s.hero_info_1}
              </div>
              <div>
                <i className="fa-solid fa-truck-fast"></i>
                {s.hero_info_2}
              </div>
            </div>
            <div className="hero-buttons">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <i className="fa-brands fa-whatsapp"></i>
                {s.hero_button_text}
              </a>
              <Link href="/servicios" className="btn-secondary">
                Ver servicios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS DESTACADOS (prioridad 1) */}
      {featuredServices.length > 0 && (
        <section className="repair-section" id="servicios">
          <div className="container">
            <SectionHead subtitle={s.repair_subtitle} title={s.featured_services_title} description={s.repair_description} />
            <div className="repair-grid">
              {featuredServices.map((r) => (
                <RepairCard key={r.id} service={r} whatsappNumber={s.whatsapp_number} />
              ))}
            </div>
            <div className="section-more">
              <Link href="/servicios" className="btn-secondary">
                Ver todos los servicios <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* POR QUÉ ELEGIRNOS */}
      {data.services.length > 0 && (
        <section className="services" id="ventajas">
          <div className="container">
            <SectionHead subtitle={s.services_subtitle} title={s.services_title} description={s.services_description} />
            <div className="services-grid">
              {data.services.map((c) => (
                <article className="service-card reveal" key={c.id}>
                  <i className={c.icon}></i>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTOS POPULARES (prioridad 2) */}
      {popular.length > 0 && (
        <section className="products" id="populares">
          <div className="container">
            <SectionHead subtitle={s.featured_subtitle} title={s.featured_title} description={s.featured_description} />
            <div className="products-grid">
              {popular.map((p) => (
                <ProductCard key={p.id} product={p} categoryName={p.category_id ? categoryNames[p.category_id] : null} phone={phone} />
              ))}
            </div>
            <div className="section-more">
              <Link href="/tienda" className="btn-secondary">
                Ver toda la tienda <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIOS */}
      {data.testimonials.length > 0 && (
        <section className="testimonials" id="testimonios">
          <div className="container">
            <SectionHead subtitle={s.testimonials_subtitle} title={s.testimonials_title} />
            <TestimonialSlider items={data.testimonials} />
          </div>
        </section>
      )}

      {/* LLAMADO FINAL */}
      <section className="cta-band">
        <div className="container">
          <h2>{s.contact_title}</h2>
          <p>{s.contact_description}</p>
          <a href={whatsappLink(s.whatsapp_number, s.whatsapp_message)} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <i className="fa-brands fa-whatsapp"></i> Escríbenos por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
