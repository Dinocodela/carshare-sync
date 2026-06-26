drop view if exists public.client_visible_earnings;

create view public.client_visible_earnings as
select
  e.id,
  e.host_id,
  e.car_id,
  e.booking_id,
  e.amount,
  e.commission,
  e.net_amount,
  e.earning_type,
  e.payment_status,
  e.payment_date,
  e.earning_period_start,
  e.earning_period_end,
  e.created_at,
  e.updated_at,
  e.gross_earnings,
  e.client_profit_percentage,
  e.host_profit_percentage,
  e.payment_source,
  e.date_paid,
  e.trip_id,
  e.trip_idd,
  case
    when nullif(btrim(e.guest_name), '') is null then null
    else upper(
      concat(
        left((regexp_split_to_array(btrim(e.guest_name), '\s+'))[1], 1),
        case
          when array_length(regexp_split_to_array(btrim(e.guest_name), '\s+'), 1) > 1 then
            left((regexp_split_to_array(btrim(e.guest_name), '\s+'))[array_length(regexp_split_to_array(btrim(e.guest_name), '\s+'), 1)], 1)
          else ''
        end
      )
    )
  end as guest_initials,
  e.pickup_address,
  e.return_address,
  e.delivery_address
from public.host_earnings e
where
  e.car_id in (
    select c.id
    from public.cars c
    where c.client_id = auth.uid()
  )
  or e.car_id in (
    select ca.car_id
    from public.car_access ca
    where ca.user_id = auth.uid()
  );

grant select on public.client_visible_earnings to authenticated;