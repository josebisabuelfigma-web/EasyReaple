// Migra el contenido del sitio estático actual (EasyReaple) a Supabase.
//
// Uso (después de crear las tablas y el bucket "site", y de llenar .env.local):
//   node --env-file=.env.local scripts/seed.mjs [ruta-del-sitio-viejo]
//
// Por defecto lee C:\Proyectos\EasyReaple. Si ya hay productos cargados, no
// hace nada (para no duplicar). Es de un solo uso.

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const OLD_SITE = process.argv[2] || "C:\\Proyectos\\EasyReaple";
const BUCKET = "site";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

function check(label, { error }) {
  if (error) {
    console.error(`✗ ${label}: ${error.message}`);
    process.exit(1);
  }
}

async function uploadImage(relativePath, folder) {
  const file = path.join(OLD_SITE, relativePath);
  if (!fs.existsSync(file)) {
    console.warn(`  (imagen no encontrada, se omite) ${relativePath}`);
    return null;
  }
  const buffer = await sharp(file)
    .rotate()
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const name = path
    .basename(relativePath, path.extname(relativePath))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
  const dest = `${folder}/${Date.now()}-${name}.webp`;
  const { error } = await db.storage.from(BUCKET).upload(dest, buffer, { contentType: "image/webp" });
  check(`subir ${relativePath}`, { error });
  return dest;
}

const { count } = await db.from("products").select("id", { count: "exact", head: true });
if (count > 0) {
  console.log("Ya hay productos cargados; no se hace nada.");
  process.exit(0);
}

// Datos del sitio viejo (assets/js/data.js define window.EasyReaple).
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(OLD_SITE, "assets/js/data.js"), "utf8"), sandbox);
const old = sandbox.window.EasyReaple;

// Categorías y marcas
const categoryIds = {};
let order = 0;
for (const [slug, name] of Object.entries(old.categories)) {
  if (slug === "todos") continue;
  const { data, error } = await db.from("categories").insert({ name, sort_order: ++order }).select("id").single();
  check(`categoría ${name}`, { error });
  categoryIds[slug] = data.id;
}
const brandIds = {};
order = 0;
for (const [slug, name] of Object.entries(old.brands)) {
  if (slug === "todas") continue;
  const { data, error } = await db.from("brands").insert({ name, sort_order: ++order }).select("id").single();
  check(`marca ${name}`, { error });
  brandIds[slug] = data.id;
}
console.log(`✓ ${Object.keys(categoryIds).length} categorías y ${Object.keys(brandIds).length} marcas`);

// Productos (con sus fotos)
order = 0;
for (const p of old.products) {
  const image_path = p.image ? await uploadImage(p.image, "products") : null;
  const { error } = await db.from("products").insert({
    name: p.name,
    description: p.description,
    category_id: categoryIds[p.category] ?? null,
    brand_id: brandIds[p.brand] ?? null, // "ambas" = sin marca = compatible con todas
    image_path,
    badge: p.badge || null,
    sort_order: ++order,
  });
  check(`producto ${p.name}`, { error });
}
console.log(`✓ ${old.products.length} productos`);

// Servicios («¿Por qué elegirnos?»)
const services = [
  ["fa-brands fa-apple", "Especialista Apple y Android", "Reparación y programación de dispositivos iPhone, iPad y equipos Android."],
  ["fa-solid fa-microchip", "Repuestos de Calidad", "Pantallas, baterías, cámaras, flex, conectores y componentes seleccionados."],
  ["fa-solid fa-shield-halved", "Trabajo Garantizado", "Cada servicio se entrega probado y con garantía según el tipo de reparación."],
  ["fa-solid fa-truck-fast", "Atención Nacional", "Recibo equipos desde cualquier ciudad de Colombia mediante envíos seguros."],
];
for (const [i, [icon, title, text]] of services.entries()) {
  check(`servicio ${title}`, await db.from("services").insert({ icon, title, text, sort_order: i + 1 }));
}
console.log(`✓ ${services.length} servicios`);

// Equipos («Nuestra tecnología»)
const equipment = [
  ["Microscopio de precisión", "Para microsoldadura y diagnóstico de fallas a nivel de componente en placa.", "assets/img/equipos/microscopio.webp"],
  ["Estación de soldadura", "Soldadura profesional para reparaciones delicadas de tarjeta.", "assets/img/equipos/estacionsoldadura.webp"],
  ["Separadora de pantallas", "Retiro y reemplazo de pantallas sin dañar el resto del equipo.", "assets/img/equipos/separadorpantallas.webp"],
  ["Estación de aire caliente", "Desmontaje seguro de componentes soldados en la placa.", "assets/img/equipos/estacionairecaliente.webp"],
  ["Software de diagnóstico", "Herramientas especializadas para calibración y programación de equipos.", "assets/img/equipos/softwarediagnostico.webp"],
  ["Herramientas de precisión", "Kit antiestático para proteger los componentes internos de tu equipo.", "assets/img/equipos/herramientasprecision.jpg"],
];
for (const [i, [title, text, img]] of equipment.entries()) {
  const image_path = await uploadImage(img, "equipment");
  check(`equipo ${title}`, await db.from("equipment").insert({ title, text, image_path, sort_order: i + 1 }));
}
console.log(`✓ ${equipment.length} equipos`);

// Testimonios: eran de ejemplo, así que quedan OCULTOS hasta que los reemplaces por reales.
for (const [i, t] of old.testimonials.entries()) {
  check(
    `testimonio ${t.name}`,
    await db.from("testimonials").insert({ name: t.name, city: t.city, rating: t.rating, text: t.text, sort_order: i + 1, active: false })
  );
}
console.log(`✓ ${old.testimonials.length} testimonios de ejemplo (ocultos)`);

// Foto de «Nosotros»
const about = await uploadImage("assets/img/profile/soyyo.png", "about");
if (about) {
  const { data: current } = await db.from("site_settings").select("data").eq("id", 1).maybeSingle();
  check(
    "foto de Nosotros",
    await db.from("site_settings").upsert({ id: 1, data: { ...(current?.data || {}), about_image_path: about } })
  );
  console.log("✓ foto de Nosotros");
}

console.log("\nListo. La galería queda vacía: súbela desde el panel (Galería) con fotos reales.");
