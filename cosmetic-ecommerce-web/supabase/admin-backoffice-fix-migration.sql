-- Apply this migration to an existing Supabase project after schema.sql.
-- It restores admin order access and prevents client-side role escalation.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role
    and current_user not in ('postgres', 'service_role') then
    raise exception 'Le role ne peut pas etre modifie depuis le client.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
before update of role on public.profiles
for each row
execute function public.prevent_profile_role_change();

drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
on public.profiles
for select
using (public.is_admin());

drop policy if exists "addresses_admin_select" on public.addresses;
create policy "addresses_admin_select"
on public.addresses
for select
using (public.is_admin());

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders
for select
using (
  auth.uid() = user_id
  or public.is_admin()
);
