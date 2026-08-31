-- Reconstrução, não o SQL original.
--
-- Esta migration foi aplicada direto no SQL Editor do Supabase em
-- 30/07/2026 e nunca foi versionada — apareceu como órfã em
-- `supabase migration list --linked` (presente no remoto, ausente do
-- repositório). O arquivo abaixo reconstrói a definição a partir de
-- `npm run db:types`, que reflete o schema real, incluindo as foreign keys
-- compostas.
--
-- Existiu para o CLI reconhecer a versão e permitir `db push` das migrations
-- novas (29/08/2026); a tabela já existia em produção, então `create table if
-- not exists` foi no-op. Ninguém no código usa `artist_services` — é
-- provavelmente o começo do catálogo por artista do backlog (S2.7). RLS fica
-- ligado sem nenhuma policy: acesso bloqueado por padrão até a feature ser
-- desenhada.

create table if not exists public.artist_services (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  artist_id uuid not null,
  service_id uuid not null,
  is_enabled boolean not null default true,
  display_order integer not null default 0,
  price_override numeric,
  duration_override_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (studio_id, artist_id) references public.tattoo_artists(studio_id, id) on delete cascade,
  foreign key (studio_id, service_id) references public.services(studio_id, id) on delete cascade
);

alter table public.artist_services enable row level security;
