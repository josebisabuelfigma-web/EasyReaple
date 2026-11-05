-- Ejecuta este script completo en Supabase: SQL Editor > New query > pega esto > Run
-- Es seguro correrlo más de una vez.

create extension if not exists pgcrypto;

-- =====================================================================
-- Acceso al panel de administración
-- =====================================================================
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  username text not null,
  username_key text generated always as (lower(username)) stored,
  email text,
  password_hash text not null,
  active boolean not null default true,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  constraint app_users_username_no_spaces check (username !~ '\s')
);
create unique index if not exists app_users_username_key_idx on app_users (username_key);

create table if not exists app_sessions (
  token_hash text primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists app_sessions_user_idx on app_sessions (user_id);

create table if not exists password_resets (
  token_hash text primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists password_resets_user_idx on password_resets (user_id);

-- =====================================================================
-- Contenido del sitio
-- =====================================================================

-- Textos, contacto y redes: una sola fila (id = 1) con un JSON.
create table if not exists site_settings (
  id smallint primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);
insert into site_settings (id) values (1) on conflict (id) do nothing;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  sort_order int not null default 0,
  active boolean not null default true
);

-- brand_id vacío = compatible con todas las marcas.
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  description text not null default '',
  category_id uuid references categories(id) on delete restrict,
  brand_id uuid references brands(id) on delete restrict,
  image_path text,
  badge text,
  sold_out boolean not null default false,
  sort_order int not null default 0,
  active boolean not null default true
);
create index if not exists products_category_idx on products (category_id);

-- Tarjetas de "¿Por qué elegirnos?"
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  icon text not null default 'fa-solid fa-star',
  title text not null,
  text text not null default '',
  sort_order int not null default 0,
  active boolean not null default true
);

-- Tarjetas de "Nuestra tecnología"
create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  text text not null default '',
  image_path text,
  sort_order int not null default 0,
  active boolean not null default true
);

-- Fotos de reparaciones
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  caption text not null default '',
  image_path text,
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  city text not null default '',
  rating int not null default 5 check (rating between 1 and 5),
  text text not null,
  sort_order int not null default 0,
  active boolean not null default true
);

-- Solo el servidor (service role key) accede a las tablas: RLS activo y sin
-- políticas = nadie puede leer ni escribir desde el navegador.
alter table app_users enable row level security;
alter table app_sessions enable row level security;
alter table password_resets enable row level security;
alter table site_settings enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table products enable row level security;
alter table services enable row level security;
alter table equipment enable row level security;
alter table gallery_items enable row level security;
alter table testimonials enable row level security;

-- Storage: crea un bucket PÚBLICO llamado "site"
-- (Storage > New bucket > nombre: site > Public bucket: SÍ).
-- Guarda las fotos del catálogo, galería y equipos.
