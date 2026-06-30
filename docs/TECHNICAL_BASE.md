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

## Variaveis De Ambiente

Obrigatorias:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Essas chaves sao publicas do frontend. Nunca adicionar service role key no projeto.

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

## Agenda Confiavel

- O booking publico consulta `working_hours` antes de mostrar horarios.
- Dias fechados e datas passadas nao geram horarios disponiveis.
- Horarios ja ocupados pelo mesmo tatuador sao removidos da lista publica.
- O banco tem indice unico parcial para impedir duplicidade em appointments com status `pending` ou `confirmed`.
- A funcao `get_booked_appointment_times` devolve somente horarios ocupados, sem expor dados de clientes.

Sempre que `src/lib/database.sql` mudar, rode o SQL atualizado no Supabase antes de testar em producao.

## Proximos Reforcos Recomendados

- Gerar tipos do Supabase automaticamente via CLI quando houver token de acesso.
- Adicionar testes de integracao para onboarding e agendamento com mocks do Supabase.
- Configurar branch protection no GitHub exigindo CI verde antes de merge.
