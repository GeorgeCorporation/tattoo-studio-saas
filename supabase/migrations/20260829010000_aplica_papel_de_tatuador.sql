-- Aplica o papel de tatuador, que existe em database.sql mas nunca rodou em
-- produção.
--
-- Confirmado em 29/08/2026: `current_user_can_view_client`,
-- `current_user_can_view_delivery` e `current_user_is_artist_for_appointment`
-- não existem no banco (npm run db:types não as lista). Sem elas, as policies
-- de leitura do tatuador nunca existiram — login como `artist` carrega painel
-- vazio: agenda, clientes, entregas e comissão, todos sem dado nenhum.
--
-- Não afeta o papel de gestor: cada tabela abaixo mantém sua policy "Users can
-- manage own ..." de sempre; isto só adiciona a leitura restrita do tatuador.
-- Idempotente (drop-if-exists / create-or-replace), seguro rodar mesmo que
-- parte já exista.

begin;

create or replace function public.current_user_is_artist_for_appointment(
  p_studio_id uuid,
  p_artist_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_artist_id is not null and public.current_user_artist_id(p_studio_id) = p_artist_id;
$$;

revoke all on function public.current_user_is_artist_for_appointment(uuid, uuid) from public;
grant execute on function public.current_user_is_artist_for_appointment(uuid, uuid) to authenticated;

create or replace function public.current_user_can_view_client(
  p_studio_id uuid,
  p_client_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.appointments
    where appointments.studio_id = p_studio_id
      and appointments.client_id = p_client_id
      and appointments.artist_id = public.current_user_artist_id(p_studio_id)
  );
$$;

revoke all on function public.current_user_can_view_client(uuid, uuid) from public;
grant execute on function public.current_user_can_view_client(uuid, uuid) to authenticated;

create or replace function public.current_user_can_view_delivery(
  p_studio_id uuid,
  p_appointment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.appointments
    where appointments.studio_id = p_studio_id
      and appointments.id = p_appointment_id
      and appointments.artist_id = public.current_user_artist_id(p_studio_id)
  );
$$;

revoke all on function public.current_user_can_view_delivery(uuid, uuid) from public;
grant execute on function public.current_user_can_view_delivery(uuid, uuid) to authenticated;

-- tattoo_artists: o próprio perfil
drop policy if exists "Artists can read own tattoo artist profile" on public.tattoo_artists;
drop policy if exists "Artists can update own tattoo artist profile" on public.tattoo_artists;

create policy "Artists can read own tattoo artist profile"
on public.tattoo_artists for select
to authenticated
using (id = public.current_user_artist_id(studio_id));

create policy "Artists can update own tattoo artist profile"
on public.tattoo_artists for update
to authenticated
using (id = public.current_user_artist_id(studio_id))
with check (id = public.current_user_artist_id(studio_id));

-- clients: só os clientes de agendamentos do próprio tatuador
drop policy if exists "Artists can read own clients" on public.clients;

create policy "Artists can read own clients"
on public.clients for select
to authenticated
using (public.current_user_can_view_client(studio_id, id));

-- appointments: leitura e atualização dos próprios
drop policy if exists "Artists can read own appointments" on public.appointments;
drop policy if exists "Artists can update own appointments" on public.appointments;

create policy "Artists can read own appointments"
on public.appointments for select
to authenticated
using (public.current_user_is_artist_for_appointment(studio_id, artist_id));

create policy "Artists can update own appointments"
on public.appointments for update
to authenticated
using (public.current_user_is_artist_for_appointment(studio_id, artist_id))
with check (public.current_user_is_artist_for_appointment(studio_id, artist_id));

-- payments: leitura dos pagamentos dos próprios agendamentos
drop policy if exists "Artists can read own payments" on public.payments;

create policy "Artists can read own payments"
on public.payments for select
to authenticated
using (
  exists (
    select 1
    from public.appointments
    where appointments.id = payments.appointment_id
      and appointments.studio_id = payments.studio_id
      and public.current_user_is_artist_for_appointment(payments.studio_id, appointments.artist_id)
  )
);

-- payment_commissions: leitura da própria comissão
drop policy if exists "Artists can read own payment commissions" on public.payment_commissions;

create policy "Artists can read own payment commissions"
on public.payment_commissions for select
to authenticated
using (artist_id = public.current_user_artist_id(studio_id));

-- artist_commission_rules: leitura da própria regra
drop policy if exists "Users can manage own artist commission rules" on public.artist_commission_rules;
drop policy if exists "Artists can read own commission rules" on public.artist_commission_rules;

create policy "Users can manage own artist commission rules"
on public.artist_commission_rules for all
to authenticated
using (
  exists (
    select 1 from public.studios
    where studios.id = artist_commission_rules.studio_id
    and studios.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.studios
    where studios.id = artist_commission_rules.studio_id
    and studios.user_id = auth.uid()
  )
);

create policy "Artists can read own commission rules"
on public.artist_commission_rules for select
to authenticated
using (artist_id = public.current_user_artist_id(studio_id));

-- client_deliveries / client_delivery_photos: leitura das entregas dos
-- próprios agendamentos
drop policy if exists "Artists can read own client deliveries" on public.client_deliveries;
drop policy if exists "Artists can read own client delivery photos" on public.client_delivery_photos;

create policy "Artists can read own client deliveries"
on public.client_deliveries for select
to authenticated
using (
  appointment_id is not null
  and public.current_user_can_view_delivery(studio_id, appointment_id)
);

create policy "Artists can read own client delivery photos"
on public.client_delivery_photos for select
to authenticated
using (
  exists (
    select 1
    from public.client_deliveries
    where client_deliveries.id = client_delivery_photos.delivery_id
      and client_deliveries.studio_id = client_delivery_photos.studio_id
      and client_deliveries.appointment_id is not null
      and public.current_user_can_view_delivery(client_delivery_photos.studio_id, client_deliveries.appointment_id)
  )
);

commit;

-- Verificação: como tatuador logado, GET em /rest/v1/appointments deve
-- devolver os próprios agendamentos (hoje devolve vazio).
