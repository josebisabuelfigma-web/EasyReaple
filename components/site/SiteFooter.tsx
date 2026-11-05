import Link from "next/link";
import { formatPhone, type SiteSettings } from "@/lib/settings";
import { SITE_PAGES } from "@/lib/pages";
import { SocialLinks } from "./parts";

export default function SiteFooter({ s, services }: { s: SiteSettings; services: string[] }) {
  const year = new Date().getFullYear();
  return (
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
            {SITE_PAGES.filter((p) => p.menu).map((p) => (
              <li key={p.path}>
                <Link href={p.path}>{p.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/nosotros#contacto">Contacto</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col footer-services-col">
          <h4>Servicios</h4>
          <ul>
            {services.map((x) => (
              <li key={x}>
                <Link href="/servicios">{x}</Link>
              </li>
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
  );
}
