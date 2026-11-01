-- Aliza Flowers: icazələr. Bütün faylı Supabase > SQL Editor-ə yapışdırıb bir dəfəyə Run edin.
-- Admin hesabı tapılmasa heç nə dəyişmir (xəta verib dayanır).

begin;

insert into public.profiles (id, role)
select id, 'admin' from auth.users where email = 'xanaliwork@gmail.com'
on conflict (id) do update set role = 'admin';

do $$
begin
  if not exists (select 1 from public.profiles where role = 'admin') then
    raise exception 'Admin hesabi tapilmadi: evvelce saytda bu email ile qeydiyyatdan kecin.';
  end if;
end $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Bu cədvəllərdəki bütün köhnə qaydaları silirik
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public' and tablename in ('orders','order_items','products','categories','site_settings')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.site_settings enable row level security;

-- Sifariş: hər kəs yarada bilər, yalnız sahibi və admin görə bilər, yalnız admin dəyişə bilər
create policy orders_insert on public.orders for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy orders_select on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy orders_admin_update on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy orders_admin_delete on public.orders for delete to authenticated
  using (public.is_admin());

create policy order_items_insert on public.order_items for insert to anon, authenticated
  with check (true);
create policy order_items_select on public.order_items for select to authenticated
  using (public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- Kataloq: hər kəs oxuyur, yalnız admin dəyişir
create policy products_read on public.products for select to anon, authenticated using (true);
create policy products_admin on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy categories_read on public.categories for select to anon, authenticated using (true);
create policy categories_admin on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy settings_read on public.site_settings for select to anon, authenticated using (true);
create policy settings_admin on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

commit;
