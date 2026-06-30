# Base Tecnica

## Comandos Obrigatorios

Antes de publicar ou enviar mudancas importantes, rode:

```bash
npm ci
npm run check
```

O comando `npm run check` valida:

- TypeScript
- ESLint
- Vitest
- Build de producao

## Testes Automatizados

Cobertura atual inclui:

- Regras de onboarding: slug, estudio existente, criacao de estudio e 7 horarios.
- Regras de booking: dias fechados, horarios ocupados, criacao e conflito de appointment.
- Paths de Storage: logo, artista, galeria e referencias por `studioId`.
- Dashboard: checklist pendente/concluido e lista de proximos agendamentos.
- Pagina publica: estudio vazio e estudio inexistente.

Comandos:

```bash
npm run test
npm run test:coverage
```

## Deploy

- Node.js: 22.x
- Build command: `npm run build`
- Output: `dist`
- Cloudflare usa SPA fallback pelo `wrangler.jsonc`

## CI GitHub

Todo push em `main` roda jobs separados:

- `TypeScript`: `npm run typecheck`
- `ESLint`: `npm run lint`
- `Vitest coverage`: `npm run test:coverage`
- `Production build`: `npm run build`
- `Security audit`: `npm audit --audit-level=high`

O job de testes envia `coverage/` como artifact do GitHub Actions.

Branch protection recomendada no GitHub:

1. Abrir repositório no GitHub.
2. Ir em `Settings`.
3. Ir em `Branches`.
4. Clicar em `Add branch protection rule`.
5. Em `Branch name pattern`, colocar `main`.
6. Ativar `Require status checks to pass before merging`.
7. Selecionar checks:
   - `TypeScript`
   - `ESLint`
   - `Vitest coverage`
   - `Production build`
   - `Security audit`
8. Salvar.

Assim, erro de tipo, lint, teste, build ou vulnerabilidade alta bloqueia merge/entrega.

## Variaveis De Ambiente

Obrigatorias:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_PROJECT_ID` para gerar tipos via CLI

Essas chaves sao publicas do frontend. Nunca adicionar service role key no projeto.

## Tipos Supabase

Tipos do banco ficam em `src/types/database.types.ts`.

Depois de rodar SQL novo no Supabase, atualize tipos:

```bash
npx supabase login
npm run db:types
npm run typecheck
```

O script `npm run db:types` usa `SUPABASE_PROJECT_ID`. Se essa variavel nao existir, tenta extrair o project id de `VITE_SUPABASE_URL`.

Nunca gere tipos usando service role key no frontend.

## Seguranca Supabase

- RLS ativo em todas as tabelas principais.
- Dados privados dependem do `studio_id` pertencer ao usuario logado.
- Paginas publicas leem apenas dados publicos de estudio, tatuadores, galeria e reviews.
- Storage tem buckets publicos para imagens; uploads administrativos exigem usuario autenticado e path com `studioId`.
- Policies de Storage validam ownership pelo primeiro segmento do path.

Paths padrao:

- `logos/{studioId}/arquivo`
- `artists/{studioId}/{artistId}/arquivo`
- `gallery/{studioId}/arquivo`
- `booking-references/{studioId}/{appointmentId}/arquivo`
- `client-deliveries/{studioId}/{deliveryId}/arquivo`

## Agenda Confiavel

- O booking publico consulta `working_hours` antes de mostrar horarios.
- Dias fechados e datas passadas nao geram horarios disponiveis.
- Horarios ja ocupados pelo mesmo tatuador sao removidos da lista publica.
- O banco tem indice unico parcial para impedir duplicidade em appointments com status `pending` ou `confirmed`.
- A funcao `get_booked_appointment_times` devolve somente horarios ocupados, sem expor dados de clientes.
- Status de agendamento e labels ficam centralizados em `src/lib/appointment-domain.ts`.
- Banco valida status, valores negativos e pagamentos invalidos com constraints.
- Base para lembretes por WhatsApp fica em `appointment_reminders`.
- Service de lembretes fica em `src/services/reminders.service.ts`.
- Mensagem padrao de lembrete fica em `buildWhatsAppReminderMessage`.

Sempre que `src/lib/database.sql` mudar, rode o SQL atualizado no Supabase antes de testar em producao.

## Entrega De Fotos Ao Cliente

- Painel: `/entregas`.
- Link publico: `/entrega/:token`.
- Bucket: `client-deliveries`.
- Tabelas: `client_deliveries` e `client_delivery_photos`.
- Cliente baixa fotos pelo link publico.
- Dados da entrega publica saem pela function `get_client_delivery_by_token`, nao por select aberto nas tabelas.
- Admin cria entrega e faz upload apenas quando o `studioId` do path pertence ao usuario logado.

## Proximos Reforcos Recomendados

- Rodar `npm run db:types` depois de aplicar SQL novo no Supabase.
- Ligar um provedor real de WhatsApp quando quiser envio automatico de lembretes.
