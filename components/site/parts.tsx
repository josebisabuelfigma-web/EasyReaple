// Piezas visuales compartidas por las páginas del sitio (sin estado).
import Link from "next/link";
import BackButton from "./BackButton";
import { safeUrl, whatsappLink, type SiteSettings } from "@/lib/settings";

// Convierte **texto** en negrita; el resto se muestra tal cual.
export function RichText({ text }: { text: string }) {
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

export function SocialLinks({ s, className }: { s: SiteSettings; className: string }) {
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

export function SectionHead({ subtitle, title, description }: { subtitle?: string; title: string; description?: string }) {
  return (
    <>
      {subtitle && <span className="section-subtitle">{subtitle}</span>}
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </>
  );
}

// Encabezado de las páginas internas (el h1 de cada página).
export function PageHero({
  subtitle,
  title,
  description,
  crumb,
}: {
  subtitle?: string;
  title: string;
  description?: string;
  crumb: string;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="page-nav">
          <BackButton />
          <nav className="breadcrumb" aria-label="Ruta">
            <Link href="/">Inicio</Link>
            <i className="fa-solid fa-chevron-right"></i>
            <span aria-current="page">{crumb}</span>
          </nav>
        </div>
        {subtitle && <span className="section-subtitle">{subtitle}</span>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="section-description">{description}</p>}
      </div>
    </section>
  );
}

type RepairService = { id: string; icon: string; title: string; text: string; image: string | null };

export function RepairCard({ service: r, whatsappNumber }: { service: RepairService; whatsappNumber: string }) {
  const href = whatsappLink(whatsappNumber, `Hola, quiero cotizar: ${r.title}`);
  return (
    <article className="repair-card reveal">
      <div className={`repair-media${r.image ? " has-image" : ""}`}>
        {r.image ? <img src={r.image} alt={`${r.title} en Neiva`} loading="lazy" /> : <i className={r.icon}></i>}
      </div>
      <div className="repair-body">
        <h3>{r.title}</h3>
        <p>{r.text}</p>
        <a className="repair-cta" href={href} target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-whatsapp"></i> Cotizar
        </a>
      </div>
    </article>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
