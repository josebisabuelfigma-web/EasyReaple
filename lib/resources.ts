// Configuración de las listas editables desde el panel (productos, categorías...).
// La usan tanto el servidor (lista blanca de columnas y validación) como el
// formulario del panel, así agregar un campo es tocar un solo lugar.

import { ICON_OPTIONS } from "@/lib/settings";

export type ResourceField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "image" | "select" | "relation";
  required?: boolean;
  help?: string;
  max?: number;
  options?: { value: string; label: string }[];
  // type "relation": lista de otro recurso, y el texto de la opción vacía.
  relation?: string;
  emptyLabel?: string;
};

export type ResourceConfig = {
  table: string;
  title: string; // plural, para el menú
  singular: string;
  intro?: string;
  // Texto principal y secundario de cada fila de la lista.
  titleKey: string;
  subtitleKey?: string;
  imageKey?: string;
  fields: ResourceField[];
  // Si borrar una fila debe avisar de que hay datos que dependen de ella.
  deleteHint?: string;
};

const activeField: ResourceField = {
  key: "active",
  label: "Visible en el sitio",
  type: "checkbox",
  help: "Si lo desmarcas, se oculta del sitio sin borrarlo.",
};

const orderField: ResourceField = {
  key: "sort_order",
  label: "Orden",
  type: "number",
  help: "Los números más bajos salen primero.",
};

export const RESOURCES: Record<string, ResourceConfig> = {
  products: {
    table: "products",
    title: "Productos",
    singular: "producto",
    intro: "Los productos del catálogo. Marca «Agotado» para que se vea pero sin botón de cotizar.",
    titleKey: "name",
    subtitleKey: "description",
    imageKey: "image_path",
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true, max: 120 },
      { key: "description", label: "Descripción", type: "textarea", max: 400 },
      { key: "image_path", label: "Foto", type: "image" },
      { key: "category_id", label: "Categoría", type: "relation", relation: "categories", emptyLabel: "Sin categoría" },
      {
        key: "brand_id",
        label: "Marca",
        type: "relation",
        relation: "brands",
        emptyLabel: "Compatible con todas las marcas",
      },
      { key: "badge", label: "Etiqueta (opcional)", type: "text", max: 20, help: "Ej: Popular, Nuevo, Oferta." },
      { key: "sold_out", label: "Agotado", type: "checkbox" },
      orderField,
      activeField,
    ],
  },
  categories: {
    table: "categories",
    title: "Categorías",
    singular: "categoría",
    intro: "Los botones de filtro del catálogo (Pantallas, Baterías...).",
    titleKey: "name",
    fields: [{ key: "name", label: "Nombre", type: "text", required: true, max: 60 }, orderField, activeField],
    deleteHint: "No se puede borrar una categoría que tenga productos: muévelos antes o desmarca «Visible».",
  },
  brands: {
    table: "brands",
    title: "Marcas",
    singular: "marca",
    intro: "Filtro por marca del catálogo (Apple, Android...).",
    titleKey: "name",
    fields: [{ key: "name", label: "Nombre", type: "text", required: true, max: 60 }, orderField, activeField],
    deleteHint: "No se puede borrar una marca que tenga productos: muévelos antes o desmarca «Visible».",
  },
  services: {
    table: "services",
    title: "Servicios",
    singular: "servicio",
    intro: "Tarjetas de «¿Por qué elegirnos?».",
    titleKey: "title",
    subtitleKey: "text",
    fields: [
      { key: "title", label: "Título", type: "text", required: true, max: 80 },
      { key: "text", label: "Texto", type: "textarea", max: 300 },
      { key: "icon", label: "Ícono", type: "select", options: ICON_OPTIONS },
      orderField,
      activeField,
    ],
  },
  equipment: {
    table: "equipment",
    title: "Equipos",
    singular: "equipo",
    intro: "Tarjetas de «Nuestra tecnología».",
    titleKey: "title",
    subtitleKey: "text",
    imageKey: "image_path",
    fields: [
      { key: "title", label: "Título", type: "text", required: true, max: 80 },
      { key: "text", label: "Texto", type: "textarea", max: 300 },
      { key: "image_path", label: "Foto", type: "image" },
      orderField,
      activeField,
    ],
  },
  gallery: {
    table: "gallery_items",
    title: "Galería",
    singular: "foto",
    intro: "Fotos de reparaciones realizadas.",
    titleKey: "title",
    subtitleKey: "caption",
    imageKey: "image_path",
    fields: [
      { key: "title", label: "Equipo", type: "text", required: true, max: 80, help: "Ej: iPhone 13 Pro" },
      { key: "caption", label: "Trabajo realizado", type: "text", max: 120, help: "Ej: Cambio de pantalla" },
      { key: "image_path", label: "Foto", type: "image", required: true },
      orderField,
      activeField,
    ],
  },
  testimonials: {
    table: "testimonials",
    title: "Testimonios",
    singular: "testimonio",
    intro: "Opiniones de clientes que se muestran en el carrusel.",
    titleKey: "name",
    subtitleKey: "text",
    fields: [
      { key: "name", label: "Nombre del cliente", type: "text", required: true, max: 60 },
      { key: "city", label: "Ciudad", type: "text", max: 60 },
      {
        key: "rating",
        label: "Estrellas",
        type: "select",
        options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? "estrella" : "estrellas"}` })),
      },
      { key: "text", label: "Opinión", type: "textarea", required: true, max: 400 },
      orderField,
      activeField,
    ],
  },
};

// Slugs de la URL del panel -> clave del recurso.
export const RESOURCE_SLUGS: Record<string, string> = {
  productos: "products",
  categorias: "categories",
  marcas: "brands",
  servicios: "services",
  equipos: "equipment",
  galeria: "gallery",
  testimonios: "testimonials",
};

// Valida y limpia el cuerpo recibido: solo columnas conocidas y con tipo correcto.
export function sanitize(cfg: ResourceConfig, body: any): { values?: Record<string, any>; error?: string } {
  const values: Record<string, any> = {};
  for (const f of cfg.fields) {
    if (!(f.key in (body || {}))) continue;
    const raw = body[f.key];

    if (f.type === "checkbox") {
      values[f.key] = !!raw;
    } else if (f.type === "number") {
      const n = Number(raw);
      values[f.key] = Number.isFinite(n) ? Math.trunc(n) : 0;
    } else if (f.type === "relation") {
      values[f.key] = typeof raw === "string" && /^[0-9a-f-]{36}$/i.test(raw) ? raw : null;
    } else if (f.type === "select") {
      const v = String(raw ?? "");
      if (!f.options!.some((o) => o.value === v)) return { error: `Valor no válido en «${f.label}».` };
      values[f.key] = f.key === "rating" ? Number(v) : v;
    } else if (f.type === "image") {
      // Ruta dentro del bucket; nada de saltos de carpeta ni URLs externas.
      const v = typeof raw === "string" ? raw.trim() : "";
      if (v && !/^[a-z0-9][a-z0-9/_.-]*$/i.test(v)) return { error: "Ruta de imagen no válida." };
      values[f.key] = v || null;
    } else {
      const v = String(raw ?? "").trim();
      if (f.required && !v) return { error: `Falta «${f.label}».` };
      if (f.max && v.length > f.max) return { error: `«${f.label}» admite máximo ${f.max} caracteres.` };
      values[f.key] = f.key === "badge" ? v || null : v;
    }

    if (f.required && f.type === "image" && !values[f.key]) return { error: `Falta «${f.label}».` };
  }
  return { values };
}
