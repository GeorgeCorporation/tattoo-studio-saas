-- Align the remote schema with the artist-access code path.
-- Safe for the existing production schema: only additive DDL or replaceable functions.

create extension if not exists "pgcrypto";

alter table public.tattoo_artists
  add column if not exists access_email text,
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists tattoo_artists_auth_user_id_unique_idx
  on public.tattoo_artists(auth_user_id)
  where auth_user_id is not null;

create unique index if not exists tattoo_artists_access_email_unique_idx
  on public.tattoo_artists(access_email)
  where access_email is not null;

create table if not exists public.artist_access_invites (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  artist_id uuid not null references public.tattoo_artists(id) on delete cascade,
  email text not null,
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_id)
);

create index if not exists artist_access_invites_studio_id_idx
  on public.artist_access_invites(studio_id);
create index if not exists artist_access_invites_status_idx
  on public.artist_access_invites(status);

alter table public.artist_access_invites enable row level security;

drop policy if exists "Users can manage own artist invites" on public.artist_access_invites;
create policy "Users can manage own artist invites"
on public.artist_access_invites for all
to authenticated
using (
  exists (
    select 1
    from public.studios
    where studios.id = artist_access_invites.studio_id
      and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.studios
    where studios.id = artist_access_invites.studio_id
      and studios.user_id = auth.uid()
  )
);

create or replace function public.current_user_artist_id(p_studio_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tattoo_artists.id
  from public.tattoo_artists
  where tattoo_artists.studio_id = p_studio_id
    and tattoo_artists.is_active = true
    and tattoo_artists.auth_user_id = auth.uid()
  limit 1;
$$;

revoke all on function public.current_user_artist_id(uuid) from public;
grant execute on function public.current_user_artist_id(uuid) to authenticated;

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

  if invite_row.status = 'revoked' or (invite_row.status = 'pending' and invite_row.expires_at <= now()) then
    if invite_row.status = 'pending' then
      update public.artist_access_invites
      set status = 'expired', updated_at = now()
      where id = invite_row.id;
    end if;
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
