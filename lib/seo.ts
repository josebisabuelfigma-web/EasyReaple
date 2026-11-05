// SEO / posicionamiento en Google. Vive en el código (no es editable desde el
// panel) para que nadie lo rompa sin querer. Los datos de contacto que salen en
// los datos estructurados sí se leen de los ajustes del panel.

import type { Metadata } from "next";
import { safeUrl, type SiteSettings } from "@/lib/settings";
import type { SiteData } from "@/lib/siteData";

export const SITE_NAME = "EasyReaple";
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

// Neiva, Huila (centro de la ciudad). Ayuda a Google Maps y a la búsqueda local.
const GEO = { latitude: 2.9273, longitude: -75.2819 };

// Horario en formato que entiende Google (el texto visible se edita en el panel).
const OPENING_HOURS = "Mo-Sa 09:00-19:00";

export const PAGE_SEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  "/": {
    title: "Reparación de celulares iPhone y Android en Neiva | EasyReaple",
    description:
      "Servicio técnico especializado en iPhone y Android en Neiva, Huila: cambio de pantalla, batería, puerto de carga y microsoldadura con garantía. Repuestos, accesorios y equipos. Envíos a todo Colombia.",
    keywords: [
      "reparación de celulares Neiva",
      "servicio técnico iPhone Neiva",
      "cambio de pantalla celular Neiva",
      "reparación Android Neiva",
      "repuestos celulares Neiva",
      "EasyReaple",
    ],
  },
  "/servicios": {
    title: "Servicios de reparación de iPhone y Android en Neiva | EasyReaple",
    description:
      "Cambio de pantalla, batería y puerto de carga, microsoldadura, software y desbloqueos para iPhone y Android en Neiva. Diagnóstico honesto y garantía. Cotiza por WhatsApp.",
    keywords: [
      "cambio de pantalla iPhone Neiva",
      "cambio de batería celular Neiva",
      "microsoldadura celulares Neiva",
      "reparar puerto de carga",
      "desbloqueo de celulares Neiva",
    ],
  },
  "/tienda": {
    title: "Tienda: repuestos, accesorios y celulares reacondicionados | EasyReaple",
    description:
      "Pantallas, baterías, cargadores, cables, fundas y equipos reacondicionados para iPhone y Android. Cotiza por WhatsApp y recibe en todo Colombia desde Neiva.",
    keywords: [
      "repuestos iPhone Colombia",
      "pantallas Samsung Neiva",
      "baterías celulares",
      "celulares reacondicionados Neiva",
      "accesorios celulares Neiva",
    ],
  },
  "/nosotros": {
    title: "Nosotros y contacto: técnicos de celulares en Neiva | EasyReaple",
    description:
      "Conoce al equipo y la tecnología de EasyReaple, servicio técnico de iPhone y Android en Neiva, Huila. Dirección, horario y WhatsApp.",
    keywords: ["servicio técnico celulares Neiva", "técnico iPhone Neiva", "EasyReaple contacto", "taller de celulares Neiva"],
  },
};

export function pageMetadata(path: string): Metadata {
  const seo = PAGE_SEO[path] ?? PAGE_SEO["/"];
  const url = `${SITE_URL}${path}`;
  return {
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "es_CO",
      images: [{ url: `${SITE_URL}/logo.png`, alt: SITE_NAME }],
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: [`${SITE_URL}/logo.png`] },
  };
}

const SOCIAL_KEYS = ["instagram_url", "facebook_url", "tiktok_url", "youtube_url", "x_url"];

// Negocio local (aparece en Google y en Maps con teléfono, horario y servicios).
export function localBusinessJsonLd(s: SiteSettings, data: SiteData) {
  return {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "@id": `${SITE_URL}/#negocio`,
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    logo: `${SITE_URL}/logo.png`,
    description: PAGE_SEO["/"].description,
    telephone: `+${s.whatsapp_number.replace(/\D/g, "")}`,
    email: s.public_email || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Neiva",
      addressRegion: "Huila",
      addressCountry: "CO",
    },
    geo: { "@type": "GeoCoordinates", ...GEO },
    openingHours: OPENING_HOURS,
    areaServed: [
      { "@type": "City", name: "Neiva" },
      { "@type": "Country", name: "Colombia" },
    ],
    sameAs: SOCIAL_KEYS.map((k) => safeUrl(s[k])).filter(Boolean),
    knowsAbout: ["Reparación de iPhone", "Reparación de celulares Android", "Microsoldadura", "Repuestos de celulares"],
    hasOfferCatalog: data.repairServices.length
      ? {
          "@type": "OfferCatalog",
          name: "Servicios de reparación",
          itemListElement: data.repairServices.map((r) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: r.title, description: r.text },
          })),
        }
      : undefined,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#web`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "es-CO",
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function servicesJsonLd(data: SiteData) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Servicios de reparación de celulares en Neiva",
    itemListElement: data.repairServices.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: r.title,
        description: r.text,
        provider: { "@id": `${SITE_URL}/#negocio` },
        areaServed: "Neiva, Huila, Colombia",
        image: r.image || undefined,
      },
    })),
  };
}

