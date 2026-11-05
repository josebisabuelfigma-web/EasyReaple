// Ajustes editables del sitio. Se guardan como un JSON en site_settings.
// Esta lista es la "lista blanca": solo estas claves se aceptan al guardar.

export type SettingField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "image";
  help?: string;
  placeholder?: string;
};

export type SettingGroup = {
  id: string;
  title: string;
  description?: string;
  fields: SettingField[];
};

export const SETTING_GROUPS: SettingGroup[] = [
  {
    id: "contacto",
    title: "Contacto y WhatsApp",
    description: "Se usa en los botones de WhatsApp, el botón flotante, la sección de contacto y el pie de página.",
    fields: [
      {
        key: "whatsapp_number",
        label: "Número de WhatsApp",
        type: "text",
        help: "Solo números, con indicativo de país y sin + ni espacios. Ejemplo: 573044070897",
        placeholder: "573044070897",
      },
      {
        key: "whatsapp_message",
        label: "Mensaje inicial de WhatsApp",
        type: "text",
        help: "Lo que aparece escrito cuando la persona abre el chat desde el botón flotante.",
      },
      { key: "address", label: "Ubicación (sección contacto)", type: "text" },
      { key: "city_short", label: "Ciudad (inicio y pie de página)", type: "text" },
      { key: "schedule_long", label: "Horario (sección contacto)", type: "text" },
      { key: "schedule_short", label: "Horario corto (pie de página)", type: "text" },
      { key: "shipping_text", label: "Envíos (sección contacto)", type: "text" },
      { key: "public_email", label: "Correo público (opcional)", type: "text", help: "Si lo llenas, aparece en el pie de página." },
    ],
  },
  {
    id: "redes",
    title: "Redes sociales",
    description: "Escribe el enlace completo (https://...). Solo se muestran las redes que tengan enlace. WhatsApp siempre aparece.",
    fields: [
      { key: "instagram_url", label: "Instagram", type: "text", placeholder: "https://instagram.com/tu_usuario" },
      { key: "facebook_url", label: "Facebook", type: "text", placeholder: "https://facebook.com/tu_pagina" },
      { key: "tiktok_url", label: "TikTok", type: "text", placeholder: "https://tiktok.com/@tu_usuario" },
      { key: "youtube_url", label: "YouTube", type: "text", placeholder: "https://youtube.com/@tu_canal" },
      { key: "x_url", label: "X (Twitter)", type: "text", placeholder: "https://x.com/tu_usuario" },
    ],
  },
  {
    id: "inicio",
    title: "Inicio (portada)",
    fields: [
      { key: "hero_title", label: "Título (parte normal)", type: "text" },
      { key: "hero_highlight", label: "Título (parte resaltada en azul)", type: "text" },
      {
        key: "hero_text",
        label: "Texto de presentación",
        type: "textarea",
        help: "Para poner algo en negrita, enciérralo entre dos asteriscos: **Apple (iOS)**",
      },
      { key: "hero_info_1", label: "Dato rápido 1", type: "text" },
      { key: "hero_info_2", label: "Dato rápido 2", type: "text" },
      { key: "hero_button_text", label: "Texto del botón de WhatsApp", type: "text" },
    ],
  },
  {
    id: "servicios",
    title: "Sección «¿Por qué elegirnos?»",
    description: "Las tarjetas se administran en el menú Servicios.",
    fields: [
      { key: "services_subtitle", label: "Etiqueta pequeña", type: "text" },
      { key: "services_title", label: "Título", type: "text" },
      { key: "services_description", label: "Descripción", type: "textarea" },
    ],
  },
  {
    id: "nosotros",
    title: "Sección «Nosotros»",
    fields: [
      { key: "about_subtitle", label: "Etiqueta pequeña", type: "text" },
      { key: "about_title", label: "Título", type: "text" },
      { key: "about_text", label: "Texto", type: "textarea" },
      { key: "about_image_path", label: "Foto", type: "image" },
      { key: "stat1_value", label: "Cifra 1 (ej. +500)", type: "text" },
      { key: "stat1_label", label: "Texto de la cifra 1", type: "text" },
      { key: "stat2_value", label: "Cifra 2", type: "text" },
      { key: "stat2_label", label: "Texto de la cifra 2", type: "text" },
      { key: "stat3_value", label: "Cifra 3", type: "text" },
      { key: "stat3_label", label: "Texto de la cifra 3", type: "text" },
    ],
  },
  {
    id: "tecnologia",
    title: "Sección «Nuestra tecnología»",
    description: "Las tarjetas se administran en el menú Equipos.",
    fields: [
      { key: "equipment_subtitle", label: "Etiqueta pequeña", type: "text" },
      { key: "equipment_title", label: "Título", type: "text" },
      { key: "equipment_description", label: "Descripción", type: "textarea" },
    ],
  },
  {
    id: "catalogo",
    title: "Sección «Catálogo»",
    description: "Los productos se administran en el menú Productos.",
    fields: [
      { key: "catalog_subtitle", label: "Etiqueta pequeña", type: "text" },
      { key: "catalog_title", label: "Título", type: "text" },
      { key: "catalog_description", label: "Descripción", type: "textarea" },
    ],
  },
  {
    id: "galeria",
    title: "Sección «Galería»",
    description: "Las fotos se administran en el menú Galería.",
    fields: [
      { key: "gallery_subtitle", label: "Etiqueta pequeña", type: "text" },
      { key: "gallery_title", label: "Título", type: "text" },
      { key: "gallery_description", label: "Descripción", type: "textarea" },
    ],
  },
  {
    id: "testimonios",
    title: "Sección «Testimonios»",
    description: "Los testimonios se administran en el menú Testimonios.",
    fields: [
      { key: "testimonials_subtitle", label: "Etiqueta pequeña", type: "text" },
      { key: "testimonials_title", label: "Título", type: "text" },
    ],
  },
  {
    id: "contacto-seccion",
    title: "Sección «Contacto» y pie de página",
    fields: [
      { key: "contact_subtitle", label: "Etiqueta pequeña", type: "text" },
      { key: "contact_title", label: "Título", type: "text" },
      { key: "contact_description", label: "Descripción", type: "textarea" },
      { key: "footer_text", label: "Texto del pie de página", type: "textarea" },
      {
        key: "footer_services",
        label: "Lista de servicios del pie de página",
        type: "textarea",
        help: "Uno por línea.",
      },
    ],
  },
  {
    id: "seo",
    title: "Google y redes (SEO)",
    fields: [
      { key: "seo_title", label: "Título de la pestaña y de Google", type: "text" },
      { key: "seo_description", label: "Descripción para Google", type: "textarea" },
    ],
  },
];

export type SiteSettings = Record<string, string>;

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_number: "573044070897",
  whatsapp_message: "Hola, quiero información",
  address: "Neiva, Huila — Colombia",
  city_short: "Neiva, Huila",
  schedule_long: "Lunes a sábado: 9:00 am – 7:00 pm",
  schedule_short: "Lun - Sáb: 9am - 7pm",
  shipping_text: "A nivel nacional",
  public_email: "",

  instagram_url: "",
  facebook_url: "",
  tiktok_url: "",
  youtube_url: "",
  x_url: "",

  hero_title: "Hola, bienvenidos a",
  hero_highlight: "EasyReaple",
  hero_text:
    "Especialistas en reparación y programación de dispositivos **Apple (iOS)** y **Android**. Nuestro objetivo es ofrecer un servicio técnico profesional, transparente y con atención personalizada para cada cliente.",
  hero_info_1: "Neiva, Huila",
  hero_info_2: "Recibimos envíos a nivel nacional",
  hero_button_text: "Cotizar ahora",

  services_subtitle: "¿POR QUÉ ELEGIRNOS?",
  services_title: "Un servicio técnico pensado para darte tranquilidad.",
  services_description:
    "Trabajo cada reparación con responsabilidad, repuestos de calidad y diagnóstico transparente para que tengas la seguridad de dejar tu equipo en buenas manos.",

  about_subtitle: "SOBRE NOSOTROS",
  about_title: "Pasión por la tecnología, compromiso contigo",
  about_text:
    "En EasyReaple trabajamos cada equipo como si fuera propio. Nos especializamos en la reparación y programación de dispositivos Apple y Android, combinando repuestos de calidad, diagnóstico honesto y atención cercana para que sepas exactamente qué le pasa a tu equipo y cómo lo solucionamos.",
  about_image_path: "",
  stat1_value: "+500",
  stat1_label: "Equipos reparados",
  stat2_value: "+3",
  stat2_label: "Años de experiencia",
  stat3_value: "100%",
  stat3_label: "Clientes satisfechos",

  equipment_subtitle: "NUESTRA TECNOLOGÍA",
  equipment_title: "Trabajamos con los equipos adecuados",
  equipment_description:
    "Invertimos en herramientas profesionales para que cada diagnóstico y cada reparación sean precisos, seguros y confiables.",

  catalog_subtitle: "NUESTRO CATÁLOGO",
  catalog_title: "Todo lo que tu dispositivo necesita",
  catalog_description:
    "Repuestos, accesorios y equipos reacondicionados con la calidad que tu dispositivo merece. Usa los filtros o el buscador del menú para encontrar justo lo que buscas.",

  gallery_subtitle: "NUESTRO TRABAJO",
  gallery_title: "Reparaciones que hablan por sí solas",
  gallery_description: "Una muestra de los equipos que hemos reparado.",

  testimonials_subtitle: "TESTIMONIOS",
  testimonials_title: "La confianza de nuestros clientes",

  contact_subtitle: "CONTACTO",
  contact_title: "Hablemos de tu equipo",
  contact_description: "Escríbenos y te responderemos lo antes posible por WhatsApp.",
  footer_text:
    "Servicio técnico especializado en dispositivos Apple y Android en Neiva, Huila. Reparación, repuestos y venta de equipos con garantía.",
  footer_services: "Reparación Apple\nReparación Android\nVenta de repuestos\nEquipos reacondicionados",

  seo_title: "EasyReaple | Servicio Técnico Especializado Apple y Android",
  seo_description:
    "Servicio técnico especializado en dispositivos Apple (iOS) y Android. Venta de equipos, repuestos, accesorios y soporte técnico profesional.",
};

export const SETTING_KEYS = SETTING_GROUPS.flatMap((g) => g.fields.map((f) => f.key));

export function mergeSettings(stored: unknown): SiteSettings {
  const out: SiteSettings = { ...DEFAULT_SETTINGS };
  if (stored && typeof stored === "object") {
    for (const key of SETTING_KEYS) {
      const v = (stored as Record<string, unknown>)[key];
      if (typeof v === "string") out[key] = v;
    }
  }
  return out;
}

// "573044070897" -> "+57 304 407 0897"
export function formatPhone(digits: string) {
  const d = digits.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("57")) {
    return `+57 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  }
  return d ? `+${d}` : "";
}

export function whatsappLink(number: string, message?: string) {
  const d = number.replace(/\D/g, "");
  const base = `https://wa.me/${d}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Solo enlaces http(s); evita javascript: y similares.
export function safeUrl(value: string) {
  const v = (value || "").trim();
  return /^https?:\/\//i.test(v) ? v : "";
}

export const ICON_OPTIONS = [
  { value: "fa-brands fa-apple", label: "Apple" },
  { value: "fa-brands fa-android", label: "Android" },
  { value: "fa-solid fa-microchip", label: "Chip / repuestos" },
  { value: "fa-solid fa-shield-halved", label: "Escudo / garantía" },
  { value: "fa-solid fa-truck-fast", label: "Camión / envíos" },
  { value: "fa-solid fa-screwdriver-wrench", label: "Herramientas" },
  { value: "fa-solid fa-mobile-screen-button", label: "Celular" },
  { value: "fa-solid fa-battery-full", label: "Batería" },
  { value: "fa-solid fa-clock", label: "Reloj / rapidez" },
  { value: "fa-solid fa-hand-holding-dollar", label: "Precio justo" },
  { value: "fa-solid fa-headset", label: "Atención" },
  { value: "fa-solid fa-star", label: "Estrella" },
  { value: "fa-solid fa-thumbs-up", label: "Me gusta" },
  { value: "fa-solid fa-lock", label: "Seguridad" },
];
