// Estructura común de todas las páginas públicas: pantalla de carga, menú,
// pie de página, botón flotante de WhatsApp y datos estructurados de Google.
import "@/styles/reset.css";
import "@/styles/variables.css";
import "@/styles/global.css";
import "@/styles/header.css";
import "@/styles/hero.css";
import "@/styles/services.css";
import "@/styles/products.css";
import "@/styles/gallery.css";
import "@/styles/contact.css";
import "@/styles/footer.css";
import "@/styles/animations.css";
import "@/styles/responsive.css";
import "@/styles/site-extra.css";
import "@/styles/pages.css";

import { getSiteData } from "@/lib/siteData";
import { whatsappLink } from "@/lib/settings";
import { localBusinessJsonLd, websiteJsonLd } from "@/lib/seo";
import { SearchProvider } from "@/components/site/SearchContext";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageEffects from "@/components/site/PageEffects";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import { JsonLd } from "@/components/site/parts";

// Las páginas se generan una vez y se refrescan al instante cuando el panel
// guarda (revalidateTag("site")). La hora es solo un respaldo.
export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const data = await getSiteData();
  const s = data.settings;
  const footerServices = s.footer_services.split("\n").map((x) => x.trim()).filter(Boolean);

  return (
    <SearchProvider>
      <JsonLd data={localBusinessJsonLd(s, data)} />
      <JsonLd data={websiteJsonLd()} />

      <div className="page-loader" id="pageLoader">
        <img src="/logo.png" alt="EasyReaple" className="loader-logo" />
        <div className="loader-bar">
          <span></span>
        </div>
      </div>

      <Header whatsappHref={whatsappLink(s.whatsapp_number)} />
      <main>{children}</main>
      <SiteFooter s={s} services={footerServices} />
      <WhatsAppFloat href={whatsappLink(s.whatsapp_number, s.whatsapp_message)} />
      <PageEffects />
    </SearchProvider>
  );
}
