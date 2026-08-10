create extension if not exists "pgcrypto";

-- =========================================================
-- Helper: updated_at trigger
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- PROFILES
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
update public.profiles
set role = 'admin'
where id = 'd18e634e-1642-4205-adf4-09a87cd3a8e9';

select id
from auth.users
where email = 'yvannti@gmail.com';

-- =========================================================
-- STORAGE: PRODUCT IMAGES
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_storage_select_all" on storage.objects;
create policy "product_images_storage_select_all"
on storage.objects
for select
using (bucket_id = 'product-images');

drop policy if exists "product_images_storage_admin_insert" on storage.objects;
create policy "product_images_storage_admin_insert"
on storage.objects
for insert
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "product_images_storage_admin_update" on storage.objects;
create policy "product_images_storage_admin_update"
on storage.objects
for update
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "product_images_storage_admin_delete" on storage.objects;
create policy "product_images_storage_admin_delete"
on storage.objects
for delete
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'homepage-images',
  'homepage-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "homepage_images_storage_select_all" on storage.objects;
create policy "homepage_images_storage_select_all"
on storage.objects
for select
using (bucket_id = 'homepage-images');

drop policy if exists "homepage_images_storage_admin_insert" on storage.objects;
create policy "homepage_images_storage_admin_insert"
on storage.objects
for insert
with check (
  bucket_id = 'homepage-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "homepage_images_storage_admin_update" on storage.objects;
create policy "homepage_images_storage_admin_update"
on storage.objects
for update
using (
  bucket_id = 'homepage-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  bucket_id = 'homepage-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "homepage_images_storage_admin_delete" on storage.objects;
create policy "homepage_images_storage_admin_delete"
on storage.objects
for delete
using (
  bucket_id = 'homepage-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
-- =========================================================
-- CATEGORIES
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- PRODUCTS
-- =========================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  price numeric(12,2) not null check (price >= 0),
  wholesale_price numeric(12,2) default null check (wholesale_price is null or wholesale_price >= 0),
  wholesale_min_quantity integer not null default 0 check (wholesale_min_quantity >= 0),
  is_wholesale_enabled boolean not null default false,
  compare_at_price numeric(12,2),
  sku text unique,
  stock integer not null default 0 check (stock >= 0),
  brand text,
  ingredient_list text,
  skin_type text,
  size text,
  shade text,
  is_featured boolean not null default false,
  is_recommended boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- PRODUCT IMAGES
-- =========================================================
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- ADDRESSES
-- =========================================================
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  country text not null default 'CI',
  city text not null,
  address_line1 text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.addresses
add column if not exists district text,
add column if not exists postal_code text,
add column if not exists address_line2 text;

-- =========================================================
-- CART ITEMS
-- =========================================================
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- =========================================================
-- ORDERS
-- =========================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  address_id uuid references public.addresses(id) on delete set null,
  status text not null default 'pending_payment' check (status in ('pending_payment','pending','paid','processing','shipped','delivered','cancelled','refunded')),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  payment_method text,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','refunded')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- ORDER ITEMS
-- =========================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  product_image text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

-- =========================================================
-- PAYMENTS
-- =========================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_reference text unique,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'XOF',
  status text not null default 'pending' check (status in ('pending','success','failed','refunded')),
  paid_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- REVIEWS
-- =========================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

-- =========================================================
-- WISHLIST
-- =========================================================
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- =========================================================
-- HOMEPAGE SETTINGS
-- =========================================================
create table if not exists public.homepage_settings (
  id text primary key default 'main',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_settings_singleton check (id = 'main')
);

create or replace function public.create_order_with_items(
  p_user_id uuid,
  p_address jsonb,
  p_items jsonb,
  p_payment_method text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_address_id uuid;
  v_order_id uuid;
  v_subtotal numeric(12,2) := 0;
  v_shipping_fee numeric(12,2) := 0;
  v_discount_amount numeric(12,2) := 0;
  v_total_amount numeric(12,2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_product_price numeric(12,2);
  v_product_wholesale_price numeric(12,2);
  v_product_wholesale_enabled boolean;
  v_product_stock integer;
  v_product_name text;
  v_product_thumbnail text;
  v_qty integer;
  v_total_quantity integer := 0;
  v_unit_price numeric(12,2);
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Utilisateur non autorise pour cette commande';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Panier vide';
  end if;

  select coalesce(sum(coalesce((item->>'quantity')::int, 1)), 0)
  into v_total_quantity
  from jsonb_array_elements(p_items) as item;

  if v_total_quantity <= 0 then
    raise exception 'Quantite de commande invalide';
  end if;

  insert into public.profiles (id, full_name, role)
  values (p_user_id, coalesce(nullif(p_address->>'full_name', ''), 'Client'), 'customer')
  on conflict (id) do nothing;

  insert into public.addresses (
    user_id, label, full_name, phone, country, city, district,
    postal_code, address_line1, address_line2, is_default
  )
  values (
    p_user_id,
    coalesce(p_address->>'label', 'Livraison'),
    p_address->>'full_name',
    p_address->>'phone',
    coalesce(p_address->>'country', 'CI'),
    p_address->>'city',
    nullif(p_address->>'district', ''),
    nullif(p_address->>'postal_code', ''),
    p_address->>'address_line1',
    nullif(p_address->>'address_line2', ''),
    false
  )
  returning id into v_address_id;

  insert into public.orders (
    user_id,
    address_id,
    status,
    subtotal,
    shipping_fee,
    discount_amount,
    total_amount,
    payment_method,
    payment_status,
    notes
  )
  values (
    p_user_id,
    v_address_id,
    'pending_payment',
    0,
    0,
    0,
    0,
    p_payment_method,
    'unpaid',
    p_notes
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select
      p.id,
      p.price,
      p.wholesale_price,
      p.is_wholesale_enabled,
      p.stock,
      p.name,
      (
        select pi.image_url
        from public.product_images pi
        where pi.product_id = p.id
        order by pi.sort_order asc, pi.created_at asc
        limit 1
      ) as thumbnail
    into v_product_id, v_product_price, v_product_wholesale_price, v_product_wholesale_enabled, v_product_stock, v_product_name, v_product_thumbnail
    from public.products p
    where p.id = (v_item->>'product_id')::uuid
      and p.is_active = true;

    if not found then
      raise exception 'Produit introuvable';
    end if;

    v_qty := coalesce((v_item->>'quantity')::int, 1);

    if v_product_stock < v_qty then
      raise exception 'Stock insuffisant pour le produit %', v_product_name;
    end if;

    v_unit_price := case
      when v_total_quantity >= 50
        and v_product_wholesale_enabled = true
        and v_product_wholesale_price is not null
      then v_product_wholesale_price
      else v_product_price
    end;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_image,
      unit_price,
      quantity,
      line_total
    )
    values (
      v_order_id,
      v_product_id,
      v_product_name,
      v_product_thumbnail,
      v_unit_price,
      v_qty,
      v_unit_price * v_qty
    );

    v_subtotal := v_subtotal + (v_unit_price * v_qty);

    update public.products
    set stock = stock - v_qty
    where id = v_product_id;
  end loop;

  v_shipping_fee := 0;
  v_discount_amount := 0;
  v_total_amount := v_subtotal + v_shipping_fee - v_discount_amount;

  update public.orders
  set subtotal = v_subtotal,
      shipping_fee = v_shipping_fee,
      discount_amount = v_discount_amount,
      total_amount = v_total_amount
  where id = v_order_id;

  delete from public.cart_items
  where user_id = p_user_id;

  return v_order_id;
end;
$$;

grant execute on function public.create_order_with_items(uuid, jsonb, jsonb, text, text) to authenticated;

-- =========================================================
-- INDEXES
-- =========================================================
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_products_is_featured on public.products(is_featured);
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_addresses_user_id on public.addresses(user_id);
create index if not exists idx_cart_items_user_id on public.cart_items(user_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_wishlist_user_id on public.wishlist(user_id);

-- =========================================================
-- TRIGGERS updated_at
-- =========================================================
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

drop trigger if exists trg_homepage_settings_updated_at on public.homepage_settings;
create trigger trg_homepage_settings_updated_at
before update on public.homepage_settings
for each row execute function public.set_updated_at();

-- =========================================================
-- PROFILE AUTO-CREATION ON SIGNUP
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- ORDER NUMBER GENERATION
-- =========================================================
create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
begin
  return 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(gen_random_uuid()::text, 1, 8));
end;
$$;

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := public.generate_order_number();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_set_order_number on public.orders;
create trigger trg_orders_set_order_number
before insert on public.orders
for each row execute function public.set_order_number();

-- =========================================================
-- RLS
-- =========================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist enable row level security;
alter table public.homepage_settings enable row level security;

-- =========================================================
-- POLICIES: PROFILES
-- =========================================================
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- =========================================================
-- POLICIES: CATEGORIES
-- =========================================================
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all"
on public.categories
for select
using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
on public.categories
for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- =========================================================
-- POLICIES: PRODUCTS
-- =========================================================
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all"
on public.products
for select
using (is_active = true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write"
on public.products
for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- =========================================================
-- POLICIES: PRODUCT IMAGES
-- =========================================================
drop policy if exists "product_images_select_all" on public.product_images;
create policy "product_images_select_all"
on public.product_images
for select
using (true);

drop policy if exists "product_images_admin_write" on public.product_images;
create policy "product_images_admin_write"
on public.product_images
for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- =========================================================
-- POLICIES: ADDRESSES
-- =========================================================
drop policy if exists "addresses_own" on public.addresses;
create policy "addresses_own"
on public.addresses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- POLICIES: CART
-- =========================================================
drop policy if exists "cart_own" on public.cart_items;
create policy "cart_own"
on public.cart_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- POLICIES: ORDERS
-- =========================================================
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders
for select
using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders
for insert
with check (auth.uid() = user_id);

drop policy if exists "orders_update_own_or_admin" on public.orders;
create policy "orders_update_own_or_admin"
on public.orders
for update
using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- =========================================================
-- POLICIES: ORDER ITEMS
-- =========================================================
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "order_items_admin_write" on public.order_items;
create policy "order_items_admin_write"
on public.order_items
for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- =========================================================
-- POLICIES: PAYMENTS
-- =========================================================
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
on public.payments
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = payments.order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "payments_admin_write" on public.payments;
create policy "payments_admin_write"
on public.payments
for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- =========================================================
-- POLICIES: REVIEWS
-- =========================================================
drop policy if exists "reviews_select_approved" on public.reviews;
create policy "reviews_select_approved"
on public.reviews
for select
using (is_approved = true or auth.uid() = user_id);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
on public.reviews
for insert
with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own_or_admin" on public.reviews;
create policy "reviews_update_own_or_admin"
on public.reviews
for update
using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- =========================================================
-- POLICIES: WISHLIST
-- =========================================================
drop policy if exists "wishlist_own" on public.wishlist;
create policy "wishlist_own"
on public.wishlist
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- POLICIES: HOMEPAGE SETTINGS
-- =========================================================
drop policy if exists "homepage_settings_select_all" on public.homepage_settings;
create policy "homepage_settings_select_all"
on public.homepage_settings
for select
using (true);

drop policy if exists "homepage_settings_admin_write" on public.homepage_settings;
create policy "homepage_settings_admin_write"
on public.homepage_settings
for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- =========================================================
-- PRODUCT ENGAGEMENT STATS
-- =========================================================
create or replace view public.product_engagement_stats as
select
  p.id as product_id,
  coalesce((
    select count(*)::integer
    from public.wishlist w
    where w.product_id = p.id
  ), 0) as wishlist_count,
  coalesce((
    select sum(oi.quantity)::integer
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.product_id = p.id
      and o.status in ('paid','processing','shipped','delivered')
  ), 0) as order_count,
  coalesce((
    select count(*)::integer
    from public.reviews r
    where r.product_id = p.id
      and r.is_approved = true
  ), 0) as review_count,
  (
    select round(avg(r.rating)::numeric, 2)
    from public.reviews r
    where r.product_id = p.id
      and r.is_approved = true
  ) as average_rating
from public.products p
where p.is_active = true;

grant select on public.product_engagement_stats to anon, authenticated;

-- =========================================================
-- STOREFRONT VIEW
-- =========================================================
create or replace view public.storefront_products as
select
  p.id,
  p.category_id,
  c.name as category_name,
  p.name,
  p.slug,
  p.description,
  p.short_description,
  p.price,
  p.wholesale_price,
  p.wholesale_min_quantity,
  p.is_wholesale_enabled,
  p.compare_at_price,
  p.stock,
  p.brand,
  p.skin_type,
  p.size,
  p.shade,
  p.is_featured,
  p.is_active,
  (
    select pi.image_url
    from public.product_images pi
    where pi.product_id = p.id
    order by pi.sort_order asc, pi.created_at asc
    limit 1
  ) as thumbnail
from public.products p
join public.categories c on c.id = p.category_id;

alter table public.addresses
add column if not exists district text,
add column if not exists postal_code text,
add column if not exists address_line2 text;

alter table public.orders
add column if not exists payment_status text default 'unpaid',
add column if not exists payment_provider text,
add column if not exists payment_reference text;

alter table public.orders
drop constraint if exists orders_status_check;

alter table public.orders
add constraint orders_status_check
check (status in ('pending_payment','pending','paid','processing','shipped','delivered','cancelled','refunded'));

alter table public.orders
drop constraint if exists orders_payment_status_check;

alter table public.orders
add constraint orders_payment_status_check
check (payment_status in ('unpaid','pending','paid','failed','refunded'));
