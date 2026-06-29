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

-- Indexes
create index if not exists studios_user_id_idx on public.studios(user_id);
create index if not exists studios_slug_idx on public.studios(slug);
create index if not exists working_hours_studio_id_idx on public.working_hours(studio_id);
create index if not exists tattoo_artists_studio_id_idx on public.tattoo_artists(studio_id);
create index if not exists tattoo_artists_slug_idx on public.tattoo_artists(slug);
create index if not exists services_studio_id_idx on public.services(studio_id);
create index if not exists clients_studio_id_idx on public.clients(studio_id);
create index if not exists appointments_studio_id_idx on public.appointments(studio_id);
create index if not exists appointments_artist_id_idx on public.appointments(artist_id);
create index if not exists appointments_client_id_idx on public.appointments(client_id);
create index if not exists payments_studio_id_idx on public.payments(studio_id);
create index if not exists gallery_studio_id_idx on public.gallery(studio_id);
create index if not exists reviews_studio_id_idx on public.reviews(studio_id);

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
drop policy if exists "Users can manage own working hours" on public.working_hours;

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
  )
  and exists (
    select 1 from public.services
    where services.id = appointments.service_id
    and services.studio_id = appointments.studio_id
  )
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

drop policy if exists "Public can read booking references" on storage.objects;
drop policy if exists "Public can upload booking references" on storage.objects;

create policy "Public can read booking references"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'booking-references');

create policy "Public can upload booking references"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'booking-references');

drop policy if exists "Public can read artist media" on storage.objects;
drop policy if exists "Authenticated can upload artist media" on storage.objects;
drop policy if exists "Authenticated can delete artist media" on storage.objects;

create policy "Public can read artist media"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('artists', 'gallery'));

create policy "Authenticated can upload artist media"
on storage.objects for insert
to authenticated
with check (bucket_id in ('artists', 'gallery'));

create policy "Authenticated can delete artist media"
on storage.objects for delete
to authenticated
using (bucket_id in ('artists', 'gallery'));
