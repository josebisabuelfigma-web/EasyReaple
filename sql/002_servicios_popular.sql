-- Migración 002: servicios de reparación, productos "populares" y borrado de
-- categorías/marcas con productos.
-- Pégalo completo en Supabase: SQL Editor > New query > Run. Se puede correr más de una vez.

-- 1) Servicios de reparación (página /servicios), con foto propia.
create table if not exists repair_services (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  text text not null default '',
  icon text not null default 'fa-solid fa-screwdriver-wrench',
  image_path text,
  sort_order int not null default 0,
  active boolean not null default true
);
alter table repair_services enable row level security;

-- 2) Producto popular: se muestra en el Inicio.
alter table products add column if not exists featured boolean not null default false;
update products set featured = true, badge = null where lower(badge) = 'popular';

-- 3) Al borrar una categoría o marca, sus productos NO se borran ni bloquean:
--    quedan "sin categoría" / "compatibles con todas las marcas".
alter table products drop constraint if exists products_category_id_fkey;
alter table products add constraint products_category_id_fkey
  foreign key (category_id) references categories(id) on delete set null;
alter table products drop constraint if exists products_brand_id_fkey;
alter table products add constraint products_brand_id_fkey
  foreign key (brand_id) references brands(id) on delete set null;

-- 4) Servicios iniciales (solo si la tabla está vacía). Edítalos desde el panel.
insert into repair_services (title, text, icon, sort_order)
select * from (values
  ('Cambio de pantalla', 'Reemplazo de pantallas para iPhone y Android con repuestos de calidad. Probamos todo antes de entregarlo.', 'fa-solid fa-mobile-screen-button', 1),
  ('Cambio de batería', 'Si tu equipo se apaga, dura poco o se calienta, le devolvemos la autonomía con una batería nueva.', 'fa-solid fa-battery-full', 2),
  ('Puerto de carga', 'Reparación o cambio del puerto cuando no carga, carga lento o el cable queda flojo.', 'fa-solid fa-plug', 3),
  ('Microsoldadura', 'Diagnóstico y reparación a nivel de tarjeta: cortos, no enciende, sin imagen, sin señal.', 'fa-solid fa-microchip', 4),
  ('Software y desbloqueos', 'Actualización, restauración, programación y recuperación de equipos Apple y Android.', 'fa-solid fa-unlock-keyhole', 5),
  ('Diagnóstico de tu equipo', 'Revisamos tu dispositivo, te explicamos la falla y te cotizamos antes de reparar.', 'fa-solid fa-screwdriver-wrench', 6)
) as v(title, text, icon, sort_order)
where not exists (select 1 from repair_services);
