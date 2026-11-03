-- Aliza Flowers: promokodları admin paneldən idarə etmək və telefon nömrəsi yoxlaması.
-- Bütün faylı Supabase > SQL Editor-də bir dəfəyə Run edin, SONRA saytı deploy edin.

begin;

drop policy if exists promo_codes_admin on public.promo_codes;
create policy promo_codes_admin on public.promo_codes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.create_order(
  p_name text,
  p_phone text,
  p_address text,
  p_date text,
  p_time text,
  p_receive_type text,
  p_note text,
  p_items jsonb,
  p_promo text,
  p_expected_total numeric
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_date date;
  v_address text;
  v_note text := left(coalesce(trim(p_note), ''), 500);
  v_item_count int;
  v_valid_count int;
  v_subtotal numeric;
  v_discount numeric := 0;
  v_total numeric;
  v_promo public.promo_codes%rowtype;
begin
  if length(coalesce(trim(p_name), '')) not between 2 and 100 then
    raise exception 'invalid_name';
  end if;
  -- Yalnız Azərbaycan mobil nömrələri: 050, 051, 010, 055, 099, 070, 077
  if regexp_replace(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '^(994|0)', '') !~ '^(50|51|10|55|99|70|77)[0-9]{7}$' then
    raise exception 'invalid_phone';
  end if;
  if p_receive_type not in ('delivery', 'pickup') then
    raise exception 'invalid_receive_type';
  end if;
  v_address := case when p_receive_type = 'pickup' then 'Mağazadan təhvil' else left(trim(coalesce(p_address, '')), 300) end;
  if length(v_address) < 3 then
    raise exception 'invalid_address';
  end if;
  begin
    v_date := p_date::date;
  exception when others then
    raise exception 'invalid_date';
  end;
  if v_date < (now() at time zone 'Asia/Baku')::date or coalesce(p_time, '') !~ '^\d{2}:\d{2}$' then
    raise exception 'invalid_date';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'empty_cart';
  end if;

  create temporary table order_lines on commit drop as
    select (e->>'product_id')::uuid as product_id, sum((e->>'quantity')::int)::int as quantity
    from jsonb_array_elements(p_items) e
    group by 1;

  if exists (select 1 from order_lines l where l.product_id is null or l.quantity not between 1 and 100) then
    raise exception 'invalid_item';
  end if;

  -- Qiymət yalnız bazadan götürülür, brauzerdən gələn qiymətə baxılmır
  select count(*), count(p.id), sum(p.price * l.quantity)
    into v_item_count, v_valid_count, v_subtotal
  from order_lines l
  left join public.products p on p.id = l.product_id and p.active is true and p.price is not null;

  if v_valid_count <> v_item_count then
    raise exception 'product_unavailable';
  end if;

  if nullif(trim(coalesce(p_promo, '')), '') is not null then
    select * into v_promo from public.promo_codes c
    where c.code = upper(trim(p_promo)) and c.active and (c.expires_at is null or c.expires_at > now());
    if not found then
      raise exception 'invalid_promo';
    end if;
    v_discount := case
      when v_promo.discount_percent is not null then round(v_subtotal * v_promo.discount_percent / 100, 2)
      else least(v_subtotal, v_promo.discount_fixed)
    end;
    v_note := trim(v_note || ' [Promokod: ' || v_promo.code || ']');
  end if;

  v_total := greatest(0, v_subtotal - v_discount);

  -- Müştəri köhnə qiyməti görürsə, sifariş yaradılmır: əvvəlcə yeni məbləği görməlidir
  if p_expected_total is null or abs(v_total - p_expected_total) > 0.011 then
    raise exception 'price_changed';
  end if;

  insert into public.orders (
    id, customer_name, customer_phone, customer_address, delivery_date, delivery_time,
    delivery_method, user_id, receive_type, note, total_amount, delivery_fee, status
  ) values (
    v_order_id, trim(p_name), trim(p_phone), v_address, v_date::text, p_time,
    case when p_receive_type = 'pickup' then 'Özüm Götürürəm' else 'Standard' end,
    auth.uid(), p_receive_type, v_note, v_total, 0, 'pending'
  );

  insert into public.order_items (order_id, product_id, name, price, quantity, image_url)
  select v_order_id, p.id, p.name, p.price, l.quantity, p.image_url
  from order_lines l
  join public.products p on p.id = l.product_id;

  return jsonb_build_object('id', v_order_id, 'total', v_total);
end;
$$;

commit;
