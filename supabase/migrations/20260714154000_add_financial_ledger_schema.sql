-- Align the existing production schema with the financial ledger used by the app.
-- All DDL is additive or replaceable; no existing rows are deleted or rewritten.

alter table public.appointments
  add column if not exists client_source text not null default 'artist_client';

create index if not exists appointments_client_source_idx
  on public.appointments(client_source);

do $$
begin
  alter table public.appointments
    add constraint appointments_client_source_check
    check (client_source in ('artist_client', 'studio_referral')) not valid;
exception when duplicate_object then
  null;
end $$;

create table if not exists public.artist_commission_rules (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  artist_id uuid not null references public.tattoo_artists(id) on delete cascade,
  is_active boolean not null default true,
  percentage numeric not null,
  cap_enabled boolean not null default false,
  monthly_cap numeric,
  starts_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists artist_commission_rules_studio_id_idx
  on public.artist_commission_rules(studio_id);
create index if not exists artist_commission_rules_artist_id_idx
  on public.artist_commission_rules(artist_id);

do $$
begin
  alter table public.artist_commission_rules
    add constraint artist_commission_rules_percentage_non_negative_check
    check (percentage >= 0) not valid;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter table public.artist_commission_rules
    add constraint artist_commission_rules_monthly_cap_non_negative_check
    check (monthly_cap is null or monthly_cap >= 0) not valid;
exception when duplicate_object then
  null;
end $$;

create table if not exists public.payment_commissions (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  artist_id uuid references public.tattoo_artists(id) on delete set null,
  rule_id uuid references public.artist_commission_rules(id) on delete set null,
  client_source text not null default 'artist_client',
  base_amount numeric not null default 0,
  percentage numeric not null default 0,
  raw_commission_amount numeric not null default 0,
  commission_amount numeric not null default 0,
  cap_consumed_amount numeric not null default 0,
  cap_applied boolean not null default false,
  created_at timestamptz not null default now(),
  unique (payment_id)
);

create index if not exists payment_commissions_studio_id_idx
  on public.payment_commissions(studio_id);
create index if not exists payment_commissions_artist_id_idx
  on public.payment_commissions(artist_id);
create index if not exists payment_commissions_payment_id_idx
  on public.payment_commissions(payment_id);

do $$
begin
  alter table public.payment_commissions
    add constraint payment_commissions_client_source_check
    check (client_source in ('artist_client', 'studio_referral')) not valid;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter table public.payment_commissions
    add constraint payment_commissions_amounts_non_negative_check
    check (
      base_amount >= 0
      and percentage >= 0
      and raw_commission_amount >= 0
      and commission_amount >= 0
      and cap_consumed_amount >= 0
    ) not valid;
exception when duplicate_object then
  null;
end $$;

alter table public.artist_commission_rules enable row level security;
alter table public.payment_commissions enable row level security;

drop policy if exists "Users can manage own artist commission rules" on public.artist_commission_rules;
create policy "Users can manage own artist commission rules"
on public.artist_commission_rules for all
to authenticated
using (
  exists (
    select 1
    from public.studios
    where studios.id = artist_commission_rules.studio_id
      and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.studios
    where studios.id = artist_commission_rules.studio_id
      and studios.user_id = auth.uid()
  )
);

drop policy if exists "Artists can read own commission rules" on public.artist_commission_rules;
create policy "Artists can read own commission rules"
on public.artist_commission_rules for select
to authenticated
using (artist_id = public.current_user_artist_id(studio_id));

drop policy if exists "Users can manage own payment commissions" on public.payment_commissions;
create policy "Users can manage own payment commissions"
on public.payment_commissions for all
to authenticated
using (
  exists (
    select 1
    from public.studios
    where studios.id = payment_commissions.studio_id
      and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.studios
    where studios.id = payment_commissions.studio_id
      and studios.user_id = auth.uid()
  )
);

drop policy if exists "Artists can read own payment commissions" on public.payment_commissions;
create policy "Artists can read own payment commissions"
on public.payment_commissions for select
to authenticated
using (artist_id = public.current_user_artist_id(studio_id));
