-- Execute this script in Supabase SQL Editor for an existing project.
-- It aligns the product editor, image storage, and admin permissions with the application.

alter table public.products
  add column if not exists wholesale_price numeric(12,2),
  add column if not exists wholesale_min_quantity integer not null default 0,
  add column if not exists is_wholesale_enabled boolean not null default false,
  add column if not exists is_recommended boolean not null default false;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write"
on public.products
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "product_images_admin_write" on public.product_images;
create policy "product_images_admin_write"
on public.product_images
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "product_images_storage_select_all" on storage.objects;
create policy "product_images_storage_select_all"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "product_images_storage_admin_insert" on storage.objects;
create policy "product_images_storage_admin_insert"
on storage.objects for insert
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_storage_admin_update" on storage.objects;
create policy "product_images_storage_admin_update"
on storage.objects for update
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_storage_admin_delete" on storage.objects;
create policy "product_images_storage_admin_delete"
on storage.objects for delete
using (bucket_id = 'product-images' and public.is_admin());
