-- Tattoo Studio SaaS - RLS policies
-- Execute no Supabase SQL Editor quando precisar reaplicar seguranca.

alter table public.studios enable row level security;
alter table public.working_hours enable row level security;
alter table public.tattoo_artists enable row level security;
alter table public.artist_access_invites enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.gallery enable row level security;
alter table public.reviews enable row level security;
alter table public.appointment_reminders enable row level security;
alter table public.client_deliveries enable row level security;
alter table public.client_delivery_photos enable row level security;

-- Studios
drop policy if exists "Public can read studios" on public.studios;
drop policy if exists "Users can insert own studios" on public.studios;
drop policy if exists "Users can update own studios" on public.studios;
drop policy if exists "Users can delete own studios" on public.studios;

create policy "Public can read studios"
on public.studios for select
to anon, authenticated
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

-- Public read tables. Owner manages by studio ownership.
drop policy if exists "Public can read working hours" on public.working_hours;
drop policy if exists "Users can manage own working hours" on public.working_hours;
drop policy if exists "Public can read tattoo artists" on public.tattoo_artists;
drop policy if exists "Users can manage own tattoo artists" on public.tattoo_artists;
drop policy if exists "Public can read services" on public.services;
drop policy if exists "Users can manage own services" on public.services;
drop policy if exists "Public can read gallery" on public.gallery;
drop policy if exists "Users can manage own gallery" on public.gallery;
drop policy if exists "Public can read reviews" on public.reviews;
drop policy if exists "Users can manage own reviews" on public.reviews;

create policy "Public can read working hours"
on public.working_hours for select
to anon, authenticated
using (true);

create policy "Users can manage own working hours"
on public.working_hours for all
to authenticated
using (exists (select 1 from public.studios where studios.id = working_hours.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = working_hours.studio_id and studios.user_id = auth.uid()));

create policy "Public can read tattoo artists"
on public.tattoo_artists for select
to anon, authenticated
using (true);

create policy "Users can manage own tattoo artists"
on public.tattoo_artists for all
to authenticated
using (exists (select 1 from public.studios where studios.id = tattoo_artists.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = tattoo_artists.studio_id and studios.user_id = auth.uid()));

drop policy if exists "Users can manage own artist invites" on public.artist_access_invites;

create policy "Users can manage own artist invites"
on public.artist_access_invites for all
to authenticated
using (exists (select 1 from public.studios where studios.id = artist_access_invites.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = artist_access_invites.studio_id and studios.user_id = auth.uid()));

create policy "Public can read services"
on public.services for select
to anon, authenticated
using (true);

create policy "Users can manage own services"
on public.services for all
to authenticated
using (exists (select 1 from public.studios where studios.id = services.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = services.studio_id and studios.user_id = auth.uid()));

create policy "Public can read gallery"
on public.gallery for select
to anon, authenticated
using (true);

create policy "Users can manage own gallery"
on public.gallery for all
to authenticated
using (exists (select 1 from public.studios where studios.id = gallery.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = gallery.studio_id and studios.user_id = auth.uid()));

create policy "Public can read reviews"
on public.reviews for select
to anon, authenticated
using (true);

create policy "Users can manage own reviews"
on public.reviews for all
to authenticated
using (exists (select 1 from public.studios where studios.id = reviews.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = reviews.studio_id and studios.user_id = auth.uid()));

-- Private operational tables
drop policy if exists "Users can manage own clients" on public.clients;
drop policy if exists "Public can create clients" on public.clients;
drop policy if exists "Users can manage own appointments" on public.appointments;
drop policy if exists "Public can create appointments" on public.appointments;
drop policy if exists "Users can manage own payments" on public.payments;
drop policy if exists "Users can manage own appointment reminders" on public.appointment_reminders;
drop policy if exists "Users can manage own client deliveries" on public.client_deliveries;
drop policy if exists "Users can manage own client delivery photos" on public.client_delivery_photos;

create policy "Users can manage own clients"
on public.clients for all
to authenticated
using (exists (select 1 from public.studios where studios.id = clients.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = clients.studio_id and studios.user_id = auth.uid()));

create policy "Public can create clients"
on public.clients for insert
to anon, authenticated
with check (exists (select 1 from public.studios where studios.id = clients.studio_id));

create policy "Users can manage own appointments"
on public.appointments for all
to authenticated
using (exists (select 1 from public.studios where studios.id = appointments.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = appointments.studio_id and studios.user_id = auth.uid()));

create policy "Public can create appointments"
on public.appointments for insert
to anon, authenticated
with check (
  status = 'pending'
  and date > current_date
  and exists (select 1 from public.studios where studios.id = appointments.studio_id)
  and exists (
    select 1
    from public.tattoo_artists
    where tattoo_artists.id = appointments.artist_id
      and tattoo_artists.studio_id = appointments.studio_id
      and tattoo_artists.is_active = true
  )
  and exists (
    select 1
    from public.services
    where services.id = appointments.service_id
      and services.studio_id = appointments.studio_id
      and services.is_active = true
  )
);

create policy "Users can manage own payments"
on public.payments for all
to authenticated
using (exists (select 1 from public.studios where studios.id = payments.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = payments.studio_id and studios.user_id = auth.uid()));

create policy "Users can manage own appointment reminders"
on public.appointment_reminders for all
to authenticated
using (exists (select 1 from public.studios where studios.id = appointment_reminders.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = appointment_reminders.studio_id and studios.user_id = auth.uid()));

create policy "Users can manage own client deliveries"
on public.client_deliveries for all
to authenticated
using (exists (select 1 from public.studios where studios.id = client_deliveries.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = client_deliveries.studio_id and studios.user_id = auth.uid()));

create policy "Users can manage own client delivery photos"
on public.client_delivery_photos for all
to authenticated
using (exists (select 1 from public.studios where studios.id = client_delivery_photos.studio_id and studios.user_id = auth.uid()))
with check (exists (select 1 from public.studios where studios.id = client_delivery_photos.studio_id and studios.user_id = auth.uid()));

create or replace function public.get_artist_invite_by_token(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', artist_access_invites.id,
    'studio_id', artist_access_invites.studio_id,
    'artist_id', artist_access_invites.artist_id,
    'email', artist_access_invites.email,
    'token', artist_access_invites.token,
    'status', case
      when artist_access_invites.status = 'pending' and artist_access_invites.expires_at <= now() then 'expired'
      else artist_access_invites.status
    end,
    'expires_at', artist_access_invites.expires_at,
    'accepted_at', artist_access_invites.accepted_at,
    'created_at', artist_access_invites.created_at,
    'updated_at', artist_access_invites.updated_at,
    'studio', jsonb_build_object(
      'id', studios.id,
      'name', studios.name,
      'slug', studios.slug,
      'logo_url', studios.logo_url
    ),
    'artist', jsonb_build_object(
      'id', tattoo_artists.id,
      'name', tattoo_artists.name,
      'slug', tattoo_artists.slug,
      'specialty', tattoo_artists.specialty
    )
  )
  from public.artist_access_invites
  join public.studios on studios.id = artist_access_invites.studio_id
  join public.tattoo_artists on tattoo_artists.id = artist_access_invites.artist_id
  where artist_access_invites.token = p_token
  limit 1;
$$;

revoke all on function public.get_artist_invite_by_token(uuid) from public;
grant execute on function public.get_artist_invite_by_token(uuid) to anon, authenticated;

create or replace function public.accept_artist_invite(
  p_token uuid,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.artist_access_invites%rowtype;
  artist_row public.tattoo_artists%rowtype;
  normalized_email text := lower(coalesce(p_email, ''));
begin
  if auth.uid() is null then
    raise exception 'Sessão expirada. Entre novamente.';
  end if;

  select *
  into invite_row
  from public.artist_access_invites
  where token = p_token
  limit 1;

  if not found then
    raise exception 'Convite não encontrado.';
  end if;

  if invite_row.status = 'revoked' then
    raise exception 'Seu convite expirou. Peça um novo link ao gestor.';
  end if;

  if invite_row.status = 'pending' and invite_row.expires_at <= now() then
    update public.artist_access_invites
    set status = 'expired',
        updated_at = now()
    where id = invite_row.id;

    raise exception 'Seu convite expirou. Peça um novo link ao gestor.';
  end if;

  if lower(invite_row.email) <> normalized_email then
    raise exception 'Este e-mail não corresponde ao convite.';
  end if;

  select *
  into artist_row
  from public.tattoo_artists
  where id = invite_row.artist_id
  limit 1;

  if not found then
    raise exception 'Perfil do tatuador não encontrado.';
  end if;

  if artist_row.auth_user_id is not null and artist_row.auth_user_id <> auth.uid() then
    raise exception 'Este tatuador já está vinculado a outra conta.';
  end if;

  if exists (
    select 1
    from public.tattoo_artists
    where auth_user_id = auth.uid()
      and id <> artist_row.id
  ) then
    raise exception 'Este e-mail já está vinculado a outro tatuador.';
  end if;

  update public.tattoo_artists
  set auth_user_id = auth.uid(),
      access_email = coalesce(access_email, invite_row.email)
  where id = artist_row.id;

  update public.artist_access_invites
  set status = 'accepted',
      accepted_at = coalesce(accepted_at, now()),
      updated_at = now()
  where id = invite_row.id;

  return jsonb_build_object(
    'ok', true,
    'artist_id', artist_row.id,
    'studio_id', artist_row.studio_id
  );
end;
$$;

revoke all on function public.accept_artist_invite(uuid, text) from public;
grant execute on function public.accept_artist_invite(uuid, text) to authenticated;

-- Storage buckets and helpers
insert into storage.buckets (id, name, public) values ('booking-references', 'booking-references', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('artists', 'artists', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('client-deliveries', 'client-deliveries', true) on conflict (id) do nothing;

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
drop policy if exists "Public can read artist media" on storage.objects;
drop policy if exists "Authenticated can upload artist media" on storage.objects;
drop policy if exists "Authenticated can delete artist media" on storage.objects;
drop policy if exists "Public can read studio logos" on storage.objects;
drop policy if exists "Authenticated can upload studio logos" on storage.objects;
drop policy if exists "Authenticated can delete studio logos" on storage.objects;
drop policy if exists "Public can read client deliveries" on storage.objects;
drop policy if exists "Authenticated can upload client deliveries" on storage.objects;
drop policy if exists "Authenticated can delete client deliveries" on storage.objects;

create policy "Public can read booking references"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'booking-references');

create policy "Public can upload booking references"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'booking-references' and public.valid_public_booking_reference_path(name));

create policy "Authenticated can delete booking references"
on storage.objects for delete
to authenticated
using (bucket_id = 'booking-references' and public.user_owns_storage_studio(name));

create policy "Public can read artist media"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('artists', 'gallery'));

create policy "Authenticated can upload artist media"
on storage.objects for insert
to authenticated
with check (bucket_id in ('artists', 'gallery') and public.user_owns_storage_studio(name));

create policy "Authenticated can delete artist media"
on storage.objects for delete
to authenticated
using (bucket_id in ('artists', 'gallery') and public.user_owns_storage_studio(name));

create policy "Public can read studio logos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'logos');

create policy "Authenticated can upload studio logos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'logos' and public.user_owns_storage_studio(name));

create policy "Authenticated can delete studio logos"
on storage.objects for delete
to authenticated
using (bucket_id = 'logos' and public.user_owns_storage_studio(name));

create policy "Public can read client deliveries"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'client-deliveries');

create policy "Authenticated can upload client deliveries"
on storage.objects for insert
to authenticated
with check (bucket_id = 'client-deliveries' and public.user_owns_storage_studio(name));

create policy "Authenticated can delete client deliveries"
on storage.objects for delete
to authenticated
using (bucket_id = 'client-deliveries' and public.user_owns_storage_studio(name));
