-- Fecha a exposição dos buckets de Storage.
--
-- Verificado contra produção em 27/08/2026:
--
--   POST /storage/v1/object/list/client-deliveries   -> devolve a árvore
--   GET  /storage/v1/object/public/client-deliveries/<studio>/<entrega>/<arquivo>
--                                                    -> HTTP 200 SEM chave nenhuma
--
-- São duas falhas somadas. A listagem responde para qualquer requisição com a
-- chave publicável, que vai no bundle de toda página do site; e o download não
-- pede credencial alguma, porque o bucket está marcado como público. Somadas,
-- dão acesso irrestrito a foto de tatuagem entregue a cliente — dado pessoal
-- sob LGPD.
--
-- Tratamento diferente para cada bucket, pelo que cada um precisa:
--
--   client-deliveries  -> privado de verdade. Quem abre a entrega é anônimo e
--                         não pode assinar, então o gestor assina no upload
--                         (ver uploadDeliveryPhoto em deliveries.service.ts).
--   booking-references -> continua público, mas deixa de ser listável. Quem lê
--                         é o estúdio autenticado, e as URLs estão gravadas
--                         dentro de appointments.notes como texto; torná-lo
--                         privado agora quebraria essa leitura. Remover a
--                         listagem já elimina a enumeração, que é a parte
--                         grave. O fechamento completo vem depois, junto da
--                         migração dessas URLs para path.
--
-- ATENÇÃO: linhas antigas de client_delivery_photos guardam URL pública e
-- deixam de abrir depois desta migration. Hoje isso atinge apenas dados de
-- teste, porque nenhum estúdio real usa o sistema. Rodar antes do primeiro
-- cliente real entrar.

begin;

-- 1. client-deliveries deixa de servir download sem credencial.
update storage.buckets
set public = false
where id = 'client-deliveries';

-- 2. Remove a leitura anônima que permitia enumerar os dois buckets.
drop policy if exists "Public can read client deliveries" on storage.objects;
drop policy if exists "Public can read booking references" on storage.objects;

-- 3. Só o dono do estúdio lê os objetos de entrega. O cliente final não passa
--    por aqui: ele abre a URL assinada, que é validada pelo próprio serviço de
--    Storage e não consulta esta policy.
create policy "Studio owner can read client deliveries"
on storage.objects for select
to authenticated
using (bucket_id = 'client-deliveries' and public.user_owns_storage_studio(name));

-- 4. Mesma regra para as referências de agendamento. O bucket segue público
--    para download direto por URL conhecida, mas ninguém mais lista.
create policy "Studio owner can read booking references"
on storage.objects for select
to authenticated
using (bucket_id = 'booking-references' and public.user_owns_storage_studio(name));

commit;

-- Verificação depois de aplicar. O primeiro comando deve devolver erro ou lista
-- vazia; o segundo, 400 ou 404 em vez de 200.
--
--   curl -X POST "$URL/storage/v1/object/list/client-deliveries" \
--        -H "apikey: $ANON" -H "Content-Type: application/json" -d '{"prefix":""}'
--
--   curl -I "$URL/storage/v1/object/public/client-deliveries/<caminho conhecido>"
