# EasyReaple Web

# 🔑 ¿OLVIDASTE LA CONTRASEÑA DEL PANEL?

> ## ⚠️ Hay dos formas de recuperarla
>
> ## 1️⃣ Con el correo (la normal)
> 1. Entra a **`/olvide-clave`** (en el login: «¿Olvidaste tu contraseña?»).
> 2. Escribe tu **usuario** o tu **correo** registrado.
> 3. Te llega un enlace por correo, **válido 60 minutos y de un solo uso**.
> 4. Elige la contraseña nueva (mínimo 8 caracteres). Se cierran todas las sesiones abiertas.
>
> Necesita que **Brevo** esté configurado en `.env.local` / Vercel (`SMTP_*` y `MAIL_FROM_*`) y que el usuario tenga un correo guardado.
>
> ## 2️⃣ Sin correo (de emergencia, desde tu computador)
> ```
> node --env-file=.env.local scripts/create-admin.mjs
> ```
> Escribe el **mismo usuario** y una contraseña nueva: reemplaza la clave y desbloquea la cuenta. Solo el hash llega a la base de datos.
>
> **Tras 5 intentos fallidos la cuenta se bloquea 15 minutos.**

Sitio de EasyReaple (servicio técnico Apple y Android, Neiva) con panel de administración.
Next.js 14 + Supabase + Netlify. Todo el contenido (productos, categorías, galería, textos,
WhatsApp y redes) se edita desde `/admin`, sin tocar código.

## Puesta en marcha

1. **Supabase**
   - SQL Editor → pega y ejecuta [`sql/schema.sql`](./sql/schema.sql).
   - Storage → **New bucket** llamado `site`, marcado como **Public bucket**.
   - Settings → API: copia el *Project URL* y la *service_role key*.
2. **Brevo** (correo para recuperar la contraseña): cuenta gratis con el correo del proyecto,
   verifica ese correo como remitente y genera una SMTP key (SMTP & API → SMTP).
3. **Variables de entorno**: copia `.env.example` a `.env.local` y complétalo
   (en Netlify se cargan en Site configuration → Environment Variables).
4. **Local**: `npm install` y `npm run dev` → http://localhost:3000
5. **Migrar el contenido del sitio anterior** (una sola vez):
   `node --env-file=.env.local scripts/seed.mjs`
   Carga categorías, marcas, productos con fotos, servicios, equipos y la foto de «Nosotros».
   Los testimonios viejos eran de ejemplo: quedan **ocultos** hasta que los reemplaces.
6. **Crear el administrador** (una sola vez, en tu computador):
   `node --env-file=.env.local scripts/create-admin.mjs`
   Te pide usuario, correo y contraseña por consola; a la base de datos solo llega el hash.
   Luego entra a `/login`. Puedes cambiar usuario, correo y clave en **Mi cuenta**.
   Si olvidas la clave, vuelve a correr el script con el mismo usuario y la reemplaza.

## Panel (`/admin`)

| Menú | Qué administra |
|---|---|
| Productos | nombre, descripción, foto, categoría, marca, etiqueta, **agotado**, orden, visible |
| Categorías / Marcas | filtros del catálogo |
| Galería | fotos de reparaciones |
| Testimonios | opiniones del carrusel |
| Servicios / Equipos | tarjetas de «¿Por qué elegirnos?» y «Nuestra tecnología» |
| Textos, contacto y redes | WhatsApp, horario, dirección, redes sociales, títulos, SEO |
| Mi cuenta | usuario, correo de recuperación y contraseña |

Al guardar, el sitio se refresca al instante (`revalidateTag`). Las fotos se reducen y se
convierten a WebP automáticamente al subirlas.

## Notas

- Un producto sin marca es «compatible con todas las marcas».
- Un producto agotado se ve con la etiqueta *Agotado* y sin botón de cotizar.
- Copia de seguridad: el plan gratis de Supabase no hace copias automáticas; exporta las tablas
  manualmente (Table Editor → Export) de vez en cuando.

