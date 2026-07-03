-- Tattoo Studio SaaS - Supabase schema
-- Execute this file in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- Tables
create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  logo_url text,
  description text,
  address text,
  city text,
  state text,
  instagram text,
  whatsapp text,
  website text,
  created_at timestamptz not null default now()
);

create table if not exists public.working_hours (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  open_time time,
  close_time time,
  is_open boolean not null default true
);

create table if not exists public.tattoo_artists (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  name text not null,
  slug text not null,
  photo_url text,
  specialty text,
  bio text,
  instagram text,
  whatsapp text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (studio_id, slug)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  name text not null,
  description text,
  starting_price numeric,
  avg_duration_minutes int,
  category text,
  is_active boolean not null default true
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  instagram text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  artist_id uuid references public.tattoo_artists(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  date date not null,
  time time not null,
  status text not null default 'pending',
  description text,
  signal_paid numeric not null default 0,
  total_price numeric,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  amount numeric not null,
  type text check (type in ('signal', 'final', 'extra')),
  method text check (method in ('pix', 'cash', 'card')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  artist_id uuid references public.tattoo_artists(id) on delete set null,
  url text not null,
  type text not null default 'photo',
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  client_name text,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointment_reminders (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  channel text not null default 'whatsapp' check (channel in ('whatsapp')),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'cancelled')),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.client_deliveries (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  token uuid not null default gen_random_uuid() unique,
  title text not null default 'Fotos da sua tatuagem',
  message text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.client_delivery_photos (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.client_deliveries(id) on delete cascade,
  studio_id uuid not null references public.studios(id) on delete cascade,
  url text not null,
  file_name text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists studios_user_id_idx on public.studios(user_id);
create index if not exists studios_slug_idx on public.studios(slug);
create index if not exists working_hours_studio_id_idx on public.working_hours(studio_id);
create unique index if not exists working_hours_studio_day_unique_idx on public.working_hours(studio_id, day_of_week);
create index if not exists tattoo_artists_studio_id_idx on public.tattoo_artists(studio_id);
create index if not exists tattoo_artists_slug_idx on public.tattoo_artists(slug);
create index if not exists services_studio_id_idx on public.services(studio_id);
create index if not exists clients_studio_id_idx on public.clients(studio_id);
create index if not exists appointments_studio_id_idx on public.appointments(studio_id);
create index if not exists appointments_artist_id_idx on public.appointments(artist_id);
create index if not exists appointments_client_id_idx on public.appointments(client_id);
create unique index if not exists appointments_active_slot_unique_idx
on public.appointments(studio_id, artist_id, date, time)
where artist_id is not null and status in ('pending', 'confirmed');
create index if not exists payments_studio_id_idx on public.payments(studio_id);
create index if not exists gallery_studio_id_idx on public.gallery(studio_id);
create index if not exists reviews_studio_id_idx on public.reviews(studio_id);
create index if not exists appointment_reminders_studio_id_idx on public.appointment_reminders(studio_id);
create index if not exists appointment_reminders_due_idx on public.appointment_reminders(status, scheduled_for);
create index if not exists client_deliveries_studio_id_idx on public.client_deliveries(studio_id);
create index if not exists client_deliveries_client_id_idx on public.client_deliveries(client_id);
create index if not exists client_deliveries_token_idx on public.client_deliveries(token);
create index if not exists client_delivery_photos_delivery_id_idx on public.client_delivery_photos(delivery_id);
create index if not exists client_delivery_photos_studio_id_idx on public.client_delivery_photos(studio_id);

-- Slug guardrails
do $$
begin
  alter table public.studios
  add constraint studios_slug_format_check
  check (slug ~ '^[a-z0-9-]+$') not valid;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter table public.studios
  add constraint studios_slug_reserved_check
  check (
    slug not in (
      'admin',
      'api',
      'login',
      'cadastro',
      'dashboard',
      'onboarding',
      'configuracoes',
      'agenda',
      'clientes',
      'tatuadores',
      'servicos',
      'financeiro',
      'galeria',
      'auth',
      'public',
      'static',
      'assets',
      'images',
      'favicon',
      'entrega',
      'entregas'
    )
  ) not valid;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter table public.tattoo_artists
  add constraint tattoo_artists_slug_format_check
  check (slug ~ '^[a-z0-9-]+$') not valid;
exception when duplicate_object then
  null;
end $$;

-- Product guardrails
do $$
begin
  alter table public.appointments
  add constraint appointments_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'completed')) not valid;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter table public.appointments
  add constraint appointments_signal_paid_non_negative_check
  check (signal_paid >= 0) not valid;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter table public.appointments
  add constraint appointments_total_price_non_negative_check
  check (total_price is null or total_price >= 0) not valid;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter table public.payments
  add constraint payments_amount_positive_check
  check (amount > 0) not valid;
exception when duplicate_object then
  null;
end $$;

-- Public availability helper
create or replace function public.get_booked_appointment_times(
  p_studio_id uuid,
  p_artist_id uuid,
  p_date date
)
returns table(booked_time time)
language sql
stable
security definer
set search_path = public
as $$
  select appointments.time as booked_time
  from public.appointments
  where appointments.studio_id = p_studio_id
    and appointments.artist_id = p_artist_id
    and appointments.date = p_date
    and appointments.status in ('pending', 'confirmed')
    and exists (
      select 1
      from public.tattoo_artists
      where tattoo_artists.id = p_artist_id
        and tattoo_artists.studio_id = p_studio_id
        and tattoo_artists.is_active = true
    );
$$;

revoke all on function public.get_booked_appointment_times(uuid, uuid, date) from public;
grant execute on function public.get_booked_appointment_times(uuid, uuid, date) to anon, authenticated;

create or replace function public.update_public_appointment_notes(
  p_appointment_id uuid,
  p_notes text
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.appointments
  set notes = p_notes
  where id = p_appointment_id
    and created_at > now() - interval '30 minutes';
$$;

revoke all on function public.update_public_appointment_notes(uuid, text) from public;
grant execute on function public.update_public_appointment_notes(uuid, text) to anon, authenticated;

-- Row Level Security
alter table public.studios enable row level security;
alter table public.working_hours enable row level security;
alter table public.tattoo_artists enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.gallery enable row level security;
alter table public.reviews enable row level security;
alter table public.appointment_reminders enable row level security;
alter table public.client_deliveries enable row level security;
alter table public.client_delivery_photos enable row level security;

-- Helpers: a row belongs to the signed-in user when its studio belongs to auth.uid().

-- Studios policies
drop policy if exists "Public can read studios" on public.studios;
drop policy if exists "Users can insert own studios" on public.studios;
drop policy if exists "Users can update own studios" on public.studios;
drop policy if exists "Users can delete own studios" on public.studios;

create policy "Public can read studios"
on public.studios for select
using (true);

create policy "Users can insert own studios"
on public.studios for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own studios"
on public.studios for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own studios"
on public.studios for delete
to authenticated
using (user_id = auth.uid());

-- Working hours policies
drop policy if exists "Public can read working hours" on public.working_hours;
drop policy if exists "Users can manage own working hours" on public.working_hours;

create policy "Public can read working hours"
on public.working_hours for select
to anon, authenticated
using (true);

create policy "Users can manage own working hours"
on public.working_hours for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = working_hours.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = working_hours.studio_id
    and studios.user_id = auth.uid()
  )
);

-- Tattoo artists policies
drop policy if exists "Public can read tattoo artists" on public.tattoo_artists;
drop policy if exists "Users can manage own tattoo artists" on public.tattoo_artists;

create policy "Public can read tattoo artists"
on public.tattoo_artists for select
using (true);

create policy "Users can manage own tattoo artists"
on public.tattoo_artists for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = tattoo_artists.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = tattoo_artists.studio_id
    and studios.user_id = auth.uid()
  )
);

-- Services policies
drop policy if exists "Public can read services" on public.services;
drop policy if exists "Users can manage own services" on public.services;

create policy "Public can read services"
on public.services for select
using (true);

create policy "Users can manage own services"
on public.services for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = services.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = services.studio_id
    and studios.user_id = auth.uid()
  )
);

-- Clients policies
drop policy if exists "Users can manage own clients" on public.clients;

create policy "Users can manage own clients"
on public.clients for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = clients.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = clients.studio_id
    and studios.user_id = auth.uid()
  )
);

drop policy if exists "Public can create clients" on public.clients;

create policy "Public can create clients"
on public.clients for insert
to anon, authenticated
with check (
  exists (
    select 1 from public.studios
    where studios.id = clients.studio_id
  )
);

-- Appointments policies
drop policy if exists "Users can manage own appointments" on public.appointments;

create policy "Users can manage own appointments"
on public.appointments for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = appointments.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = appointments.studio_id
    and studios.user_id = auth.uid()
  )
);

drop policy if exists "Public can create appointments" on public.appointments;

create policy "Public can create appointments"
on public.appointments for insert
to anon, authenticated
with check (
  exists (
    select 1 from public.studios
    where studios.id = appointments.studio_id
  )
  and exists (
    select 1 from public.tattoo_artists
    where tattoo_artists.id = appointments.artist_id
    and tattoo_artists.studio_id = appointments.studio_id
    and tattoo_artists.is_active = true
  )
  and exists (
    select 1 from public.services
    where services.id = appointments.service_id
    and services.studio_id = appointments.studio_id
    and services.is_active = true
  )
  and appointments.status = 'pending'
  and appointments.date > current_date
);

-- Payments policies
drop policy if exists "Users can manage own payments" on public.payments;

create policy "Users can manage own payments"
on public.payments for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = payments.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = payments.studio_id
    and studios.user_id = auth.uid()
  )
);

-- Gallery policies
drop policy if exists "Public can read gallery" on public.gallery;
drop policy if exists "Users can manage own gallery" on public.gallery;

create policy "Public can read gallery"
on public.gallery for select
using (true);

create policy "Users can manage own gallery"
on public.gallery for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = gallery.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = gallery.studio_id
    and studios.user_id = auth.uid()
  )
);

-- Reviews policies
drop policy if exists "Public can read reviews" on public.reviews;
drop policy if exists "Users can manage own reviews" on public.reviews;

create policy "Public can read reviews"
on public.reviews for select
using (true);

create policy "Users can manage own reviews"
on public.reviews for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = reviews.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = reviews.studio_id
    and studios.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own appointment reminders" on public.appointment_reminders;

create policy "Users can manage own appointment reminders"
on public.appointment_reminders for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = appointment_reminders.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = appointment_reminders.studio_id
    and studios.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own client deliveries" on public.client_deliveries;
drop policy if exists "Users can manage own client delivery photos" on public.client_delivery_photos;

create policy "Users can manage own client deliveries"
on public.client_deliveries for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = client_deliveries.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = client_deliveries.studio_id
    and studios.user_id = auth.uid()
  )
);

create policy "Users can manage own client delivery photos"
on public.client_delivery_photos for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = client_delivery_photos.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = client_delivery_photos.studio_id
    and studios.user_id = auth.uid()
  )
);

create or replace function public.get_client_delivery_by_token(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', client_deliveries.id,
    'title', client_deliveries.title,
    'message', client_deliveries.message,
    'studio', jsonb_build_object(
      'name', studios.name,
      'logo_url', studios.logo_url,
      'whatsapp', studios.whatsapp
    ),
    'client', jsonb_build_object(
      'name', clients.name
    ),
    'photos', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', client_delivery_photos.id,
          'url', client_delivery_photos.url,
          'file_name', client_delivery_photos.file_name
        )
        order by client_delivery_photos.created_at asc
      ) filter (where client_delivery_photos.id is not null),
      '[]'::jsonb
    )
  )
  from public.client_deliveries
  join public.studios on studios.id = client_deliveries.studio_id
  join public.clients on clients.id = client_deliveries.client_id
  left join public.client_delivery_photos on client_delivery_photos.delivery_id = client_deliveries.id
  where client_deliveries.token = p_token
    and (client_deliveries.expires_at is null or client_deliveries.expires_at > now())
  group by client_deliveries.id, studios.id, clients.id;
$$;

revoke all on function public.get_client_delivery_by_token(uuid) from public;
grant execute on function public.get_client_delivery_by_token(uuid) to anon, authenticated;

-- Public booking reference photos
insert into storage.buckets (id, name, public)
values ('booking-references', 'booking-references', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('artists', 'artists', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('client-deliveries', 'client-deliveries', true)
on conflict (id) do nothing;

-- Storage ownership helpers
create or replace function public.storage_path_part(object_name text, part_index int)
returns text
language sql
stable
security definer
set search_path = public, storage
as $$
  select (storage.foldername(object_name))[part_index];
$$;

create or replace function public.user_owns_storage_studio(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select exists (
    select 1
    from public.studios
    where studios.id::text = public.storage_path_part(object_name, 1)
      and studios.user_id = auth.uid()
  );
$$;

create or replace function public.valid_public_booking_reference_path(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select exists (
    select 1
    from public.studios
    where studios.id::text = public.storage_path_part(object_name, 1)
  )
  and coalesce(public.storage_path_part(object_name, 2), '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
$$;

revoke all on function public.storage_path_part(text, int) from public;
revoke all on function public.user_owns_storage_studio(text) from public;
revoke all on function public.valid_public_booking_reference_path(text) from public;
grant execute on function public.storage_path_part(text, int) to anon, authenticated;
grant execute on function public.user_owns_storage_studio(text) to anon, authenticated;
grant execute on function public.valid_public_booking_reference_path(text) to anon, authenticated;

drop policy if exists "Public can read booking references" on storage.objects;
drop policy if exists "Public can upload booking references" on storage.objects;
drop policy if exists "Authenticated can delete booking references" on storage.objects;

create policy "Public can read booking references"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'booking-references');

create policy "Public can upload booking references"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'booking-references'
  and public.valid_public_booking_reference_path(name)
);

create policy "Authenticated can delete booking references"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'booking-references'
  and public.user_owns_storage_studio(name)
);

drop policy if exists "Public can read artist media" on storage.objects;
drop policy if exists "Authenticated can upload artist media" on storage.objects;
drop policy if exists "Authenticated can delete artist media" on storage.objects;
drop policy if exists "Public can read studio logos" on storage.objects;
drop policy if exists "Authenticated can upload studio logos" on storage.objects;
drop policy if exists "Authenticated can delete studio logos" on storage.objects;
drop policy if exists "Public can read client deliveries" on storage.objects;
drop policy if exists "Authenticated can upload client deliveries" on storage.objects;
drop policy if exists "Authenticated can delete client deliveries" on storage.objects;

create policy "Public can read artist media"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('artists', 'gallery'));

create policy "Authenticated can upload artist media"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('artists', 'gallery')
  and public.user_owns_storage_studio(name)
);

create policy "Authenticated can delete artist media"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('artists', 'gallery')
  and public.user_owns_storage_studio(name)
);

create policy "Public can read studio logos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'logos');

create policy "Authenticated can upload studio logos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'logos'
  and public.user_owns_storage_studio(name)
);

create policy "Authenticated can delete studio logos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'logos'
  and public.user_owns_storage_studio(name)
);

create policy "Public can read client deliveries"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'client-deliveries');

create policy "Authenticated can upload client deliveries"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'client-deliveries'
  and public.user_owns_storage_studio(name)
);

create policy "Authenticated can delete client deliveries"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'client-deliveries'
  and public.user_owns_storage_studio(name)
);
