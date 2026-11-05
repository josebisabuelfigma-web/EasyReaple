import type { Metadata } from "next";
import { getSiteData } from "@/lib/siteData";
import { formatPhone, whatsappLink } from "@/lib/settings";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { publicImageUrl } from "@/lib/supabaseAdmin";
import { JsonLd, PageHero, SectionHead, SocialLinks } from "@/components/site/parts";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata("/nosotros");

export default async function NosotrosPage() {
  const data = await getSiteData();
  const s = data.settings;
  const aboutImage = publicImageUrl(s.about_image_path);
  const waHello = whatsappLink(s.whatsapp_number, s.whatsapp_message);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Nosotros", path: "/nosotros" }])} />

      <PageHero crumb="Nosotros" subtitle={s.about_subtitle} title={s.about_title} />

      {/* QUIÉNES SOMOS */}
      <section className="about page-body" id="sobremi">
        <div className="container about-container">
          <div className="about-content reveal">
            <p>{s.about_text}</p>
            <div className="about-stats">
              {[1, 2, 3].map((n) =>
                s[`stat${n}_value`] ? (
                  <div key={n}>
                    <strong>{s[`stat${n}_value`]}</strong>
                    <span>{s[`stat${n}_label`]}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>
          {aboutImage && (
            <div className="about-image reveal">
              <img src={aboutImage} alt="Equipo técnico de EasyReaple en Neiva" />
            </div>
          )}
        </div>
      </section>

      {/* GALERÍA */}
      {data.gallery.length > 0 && (
        <section className="gallery" id="galeria">
          <div className="container">
            <SectionHead subtitle={s.gallery_subtitle} title={s.gallery_title} description={s.gallery_description} />
            <div className="gallery-grid">
              {data.gallery.map((g) => (
                <div className={`gallery-item reveal${g.image ? " has-image" : ""}`} key={g.id}>
                  {g.image ? (
                    <img src={g.image} alt={`${g.title} — ${g.caption}`} loading="lazy" />
                  ) : (
                    <i className="fa-solid fa-mobile-screen-button"></i>
                  )}
                  <div className="gallery-caption">
                    <strong>{g.title}</strong>
                    <span>{g.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACTO */}
      <section className="contact" id="contacto">
        <div className="container">
          <SectionHead subtitle={s.contact_subtitle} title={s.contact_title} description={s.contact_description} />
          <div className="contact-info reveal">
            <div className="contact-info-grid">
              <div className="contact-info-item">
                <i className="fa-solid fa-location-dot"></i>
                <h3>Ubicación</h3>
                <p>{s.address}</p>
              </div>
              <div className="contact-info-item">
                <i className="fa-brands fa-whatsapp"></i>
                <h3>WhatsApp</h3>
                <p>{formatPhone(s.whatsapp_number)}</p>
              </div>
              <div className="contact-info-item">
                <i className="fa-solid fa-clock"></i>
                <h3>Horario</h3>
                <p>{s.schedule_long}</p>
              </div>
              <div className="contact-info-item">
                <i className="fa-solid fa-truck-fast"></i>
                <h3>Envíos</h3>
                <p>{s.shipping_text}</p>
              </div>
            </div>

            <a href={waHello} target="_blank" rel="noopener noreferrer" className="btn-primary contact-cta">
              <i className="fa-brands fa-whatsapp"></i> Escríbenos por WhatsApp
            </a>

            <SocialLinks s={s} className="contact-social" />
          </div>
        </div>
      </section>
    </>
  );
}
