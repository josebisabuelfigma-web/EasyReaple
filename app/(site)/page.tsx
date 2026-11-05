import type { Metadata } from "next";
import { getSiteData } from "@/lib/siteData";
import { formatPhone, safeUrl, whatsappLink, type SiteSettings } from "@/lib/settings";
import { SearchProvider } from "@/components/site/SearchContext";
import Header from "@/components/site/Header";
import Catalog from "@/components/site/Catalog";
import TestimonialSlider from "@/components/site/TestimonialSlider";
import PageEffects from "@/components/site/PageEffects";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import { publicImageUrl } from "@/lib/supabaseAdmin";

// El sitio se genera una vez y se refresca al instante cuando el panel guarda
// (revalidateTag("site")). La hora es solo un respaldo.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteData();
  return {
    title: settings.seo_title,
    description: settings.seo_description,
    authors: [{ name: "EasyReaple" }],
    openGraph: {
      title: settings.seo_title,
      description: settings.seo_description,
      type: "website",
      locale: "es_CO",
      images: ["/logo.png"],
    },
  };
}

// Convierte **texto** en negrita; el resto se muestra tal cual.
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
    </>
  );
}

const SOCIALS = [
  { key: "instagram_url", icon: "fa-brands fa-instagram", label: "Instagram" },
  { key: "facebook_url", icon: "fa-brands fa-facebook", label: "Facebook" },
  { key: "tiktok_url", icon: "fa-brands fa-tiktok", label: "TikTok" },
  { key: "youtube_url", icon: "fa-brands fa-youtube", label: "YouTube" },
  { key: "x_url", icon: "fa-brands fa-x-twitter", label: "X" },
];

function SocialLinks({ s, className }: { s: SiteSettings; className: string }) {
  return (
    <div className={className}>
      {SOCIALS.map((n) => {
        const href = safeUrl(s[n.key]);
        return href ? (
          <a key={n.key} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${n.label} de EasyReaple`}>
            <i className={n.icon}></i>
          </a>
        ) : null;
      })}
      <a href={whatsappLink(s.whatsapp_number)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de EasyReaple">
        <i className="fa-brands fa-whatsapp"></i>
      </a>
    </div>
  );
}

function SectionHead({ subtitle, title, description }: { subtitle: string; title: string; description?: string }) {
  return (
    <>
      <span className="section-subtitle">{subtitle}</span>
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </>
  );
}

export default async function HomePage() {
  const data = await getSiteData();
  const s = data.settings;
  const wa = whatsappLink(s.whatsapp_number);
  const waHello = whatsappLink(s.whatsapp_number, s.whatsapp_message);
  const aboutImage = publicImageUrl(s.about_image_path);
  const footerServices = s.footer_services.split("\n").map((x) => x.trim()).filter(Boolean);
  const year = new Date().getFullYear();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "EasyReaple",
    description: s.seo_description,
    telephone: formatPhone(s.whatsapp_number),
    address: { "@type": "PostalAddress", addressLocality: s.city_short, addressCountry: "CO" },
    openingHours: s.schedule_long,
    image: "/logo.png",
  };

  return (
    <SearchProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="page-loader" id="pageLoader">
        <img src="/logo.png" alt="EasyReaple" className="loader-logo" />
        <div className="loader-bar">
          <span></span>
        </div>
      </div>

      <Header whatsappHref={wa} />

      <main>
        {/* INICIO */}
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
                <a href="#servicios" className="btn-secondary">
                  Ver servicios
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* POR QUÉ ELEGIRNOS */}
        {data.services.length > 0 && (
          <section className="services" id="servicios">
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

        {/* NOSOTROS */}
        <section className="about" id="sobremi">
          <div className="container about-container">
            <div className="about-content reveal">
              <span className="section-subtitle">{s.about_subtitle}</span>
              <h2 className="section-title">{s.about_title}</h2>
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
                <img src={aboutImage} alt="Equipo técnico de EasyReaple" />
              </div>
            )}
          </div>
        </section>

        {/* TECNOLOGÍA */}
        {data.equipment.length > 0 && (
          <section className="equipment" id="tecnologia">
            <div className="container">
              <SectionHead
                subtitle={s.equipment_subtitle}
                title={s.equipment_title}
                description={s.equipment_description}
              />
              <div className="services-grid">
                {data.equipment.map((e) => (
                  <article className="equipment-card reveal" key={e.id}>
                    <div className="equipment-thumb">
                      {e.image && <img src={e.image} alt={e.title} loading="lazy" />}
                    </div>
                    <div className="equipment-body">
                      <h3>{e.title}</h3>
                      <p>{e.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CATÁLOGO */}
        <section className="products" id="catalogo">
          <div className="container">
            <SectionHead subtitle={s.catalog_subtitle} title={s.catalog_title} description={s.catalog_description} />
            <Catalog
              categories={data.categories}
              brands={data.brands}
              products={data.products}
              whatsappNumber={s.whatsapp_number}
            />
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
                    {g.image ? <img src={g.image} alt={`${g.title} — ${g.caption}`} loading="lazy" /> : <i className="fa-solid fa-mobile-screen-button"></i>}
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

        {/* TESTIMONIOS */}
        {data.testimonials.length > 0 && (
          <section className="testimonials" id="testimonios">
            <div className="container">
              <SectionHead subtitle={s.testimonials_subtitle} title={s.testimonials_title} />
              <TestimonialSlider items={data.testimonials} />
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
                  <h4>Ubicación</h4>
                  <p>{s.address}</p>
                </div>
                <div className="contact-info-item">
                  <i className="fa-brands fa-whatsapp"></i>
                  <h4>WhatsApp</h4>
                  <p>{formatPhone(s.whatsapp_number)}</p>
                </div>
                <div className="contact-info-item">
                  <i className="fa-solid fa-clock"></i>
                  <h4>Horario</h4>
                  <p>{s.schedule_long}</p>
                </div>
                <div className="contact-info-item">
                  <i className="fa-solid fa-truck-fast"></i>
                  <h4>Envíos</h4>
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
      </main>

      <footer>
        <div className="container footer-container">
          <div className="footer-col footer-about">
            <img src="/logo.png" alt="Logo EasyReaple" className="footer-logo" />
            <p>{s.footer_text}</p>
            <SocialLinks s={s} className="footer-social" />
          </div>

          <div className="footer-col footer-nav-col">
            <h4>Navegación</h4>
            <ul>
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#servicios">Servicios</a></li>
              <li><a href="#catalogo">Catálogo</a></li>
              <li><a href="#galeria">Galería</a></li>
              <li><a href="#sobremi">Nosotros</a></li>
              <li><a href="#tecnologia">Tecnología</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </div>

          <div className="footer-col footer-services-col">
            <h4>Servicios</h4>
            <ul>
              {footerServices.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li><i className="fa-solid fa-location-dot"></i>{s.city_short}</li>
              <li><i className="fa-brands fa-whatsapp"></i>{formatPhone(s.whatsapp_number)}</li>
              <li><i className="fa-solid fa-clock"></i>{s.schedule_short}</li>
              {s.public_email && (
                <li><i className="fa-solid fa-envelope"></i>{s.public_email}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} EasyReaple. Todos los derechos reservados.</p>
          <p className="footer-credit">
            Desarrollado por <strong>NOVA STUDIO</strong>
            <a
              href="https://wa.me/573193034610?text=Hola%20NOVA%20STUDIO%2C%20vi%20el%20sitio%20web%20de%20EasyReaple%20y%20me%20gustar%C3%ADa%20saber%20m%C3%A1s%20sobre%20sus%20servicios%20de%20desarrollo%20web."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar a NOVA STUDIO por WhatsApp"
            >
              <i className="fa-brands fa-whatsapp"></i> Contáctanos
            </a>
          </p>
        </div>
      </footer>

      <WhatsAppFloat href={waHello} />
      <PageEffects />
    </SearchProvider>
  );
}
