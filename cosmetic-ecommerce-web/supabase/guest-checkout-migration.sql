-- Execute once in the Supabase SQL Editor to allow checkout without an account.
-- Guest contact details are stored with the delivery address and order.

alter table public.addresses alter column user_id drop not null;
alter table public.orders alter column user_id drop not null;
alter table public.products alter column wholesale_min_quantity set default 6;
update public.products set wholesale_min_quantity = 6 where wholesale_min_quantity < 6;

create or replace function public.create_order_with_items(
  p_user_id uuid, p_address jsonb, p_items jsonb,
  p_payment_method text default null, p_notes text default null
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_address_id uuid; v_order_id uuid; v_subtotal numeric(12,2) := 0;
  v_item jsonb; v_product_id uuid; v_product_price numeric(12,2);
  v_product_wholesale_price numeric(12,2); v_product_wholesale_enabled boolean;
  v_product_stock integer; v_product_name text; v_product_thumbnail text;
  v_qty integer; v_total_quantity integer := 0; v_all_products_meet_wholesale_minimum boolean := false; v_unit_price numeric(12,2);
begin
  if p_user_id is not null and auth.uid() <> p_user_id then
    raise exception 'Utilisateur non autorise pour cette commande';
  end if;
  if jsonb_array_length(p_items) = 0 then raise exception 'Panier vide'; end if;
  if nullif(trim(coalesce(p_address->>'full_name', '')), '') is null
    or nullif(trim(coalesce(p_address->>'phone', '')), '') is null
    or nullif(trim(coalesce(p_address->>'city', '')), '') is null
    or nullif(trim(coalesce(p_address->>'address_line1', '')), '') is null then
    raise exception 'Les coordonnees de livraison sont obligatoires';
  end if;

  select coalesce(sum(coalesce((item->>'quantity')::int, 1)), 0)
  into v_total_quantity from jsonb_array_elements(p_items) as item;
  if v_total_quantity <= 0 then raise exception 'Quantite de commande invalide'; end if;
  select coalesce(bool_and(coalesce((item->>'quantity')::int, 0) >= 6), false)
  into v_all_products_meet_wholesale_minimum from jsonb_array_elements(p_items) as item;

  insert into public.addresses (user_id, label, full_name, phone, country, city, district, address_line1, is_default)
  values (p_user_id, coalesce(p_address->>'label', 'Livraison'), p_address->>'full_name',
    p_address->>'phone', coalesce(p_address->>'country', 'CI'), p_address->>'city',
    nullif(p_address->>'district', ''), p_address->>'address_line1', false)
  returning id into v_address_id;

  insert into public.orders (user_id, address_id, status, subtotal, shipping_fee, discount_amount,
    total_amount, payment_method, payment_status, notes)
  values (p_user_id, v_address_id, 'pending_payment', 0, 0, 0, 0, p_payment_method, 'unpaid', p_notes)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select p.id, p.price, p.wholesale_price, p.is_wholesale_enabled, p.stock, p.name,
      (select pi.image_url from public.product_images pi where pi.product_id = p.id
       order by pi.sort_order asc, pi.created_at asc limit 1)
    into v_product_id, v_product_price, v_product_wholesale_price, v_product_wholesale_enabled,
      v_product_stock, v_product_name, v_product_thumbnail
    from public.products p where p.id = (v_item->>'product_id')::uuid and p.is_active = true;
    if not found then raise exception 'Produit introuvable'; end if;
    v_qty := coalesce((v_item->>'quantity')::int, 1);
    if v_qty <= 0 then raise exception 'Quantite de commande invalide'; end if;
    if v_product_stock < v_qty then raise exception 'Stock insuffisant pour le produit %', v_product_name; end if;
    v_unit_price := case when v_total_quantity >= 50 and v_all_products_meet_wholesale_minimum and v_product_wholesale_enabled
      and v_product_wholesale_price is not null then v_product_wholesale_price else v_product_price end;
    insert into public.order_items (order_id, product_id, product_name, product_image, unit_price, quantity, line_total)
    values (v_order_id, v_product_id, v_product_name, v_product_thumbnail, v_unit_price, v_qty, v_unit_price * v_qty);
    v_subtotal := v_subtotal + (v_unit_price * v_qty);
    update public.products set stock = stock - v_qty where id = v_product_id;
  end loop;

  update public.orders set subtotal = v_subtotal, total_amount = v_subtotal where id = v_order_id;
  if p_user_id is not null then delete from public.cart_items where user_id = p_user_id; end if;
  return v_order_id;
end;
$$;

grant execute on function public.create_order_with_items(uuid, jsonb, jsonb, text, text) to anon, authenticated;
