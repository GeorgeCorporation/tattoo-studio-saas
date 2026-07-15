# 1. Visão geral do projeto

Inkora é um SaaS multiestúdio para gestão de estúdios de tatuagem: onboarding, agenda, clientes, tatuadores, serviços, galeria, financeiro, entregas de fotos e páginas públicas de estúdio/booking.

Stack: React 18, TypeScript strict, Vite, Tailwind, React Router, Supabase Auth/Postgres/Storage, Vitest, Cloudflare Pages e GitHub Actions.

Arquitetura: SPA em camadas `Pages → Hooks → Services → Supabase`, com regras de domínio em `src/lib/`.

# 2. Estrutura

- `src/pages/`: telas por domínio, incluindo áreas manager, artist e públicas.
- `src/services/`: acesso a dados e operações Supabase.
- `src/hooks/`: auth, acesso, dashboard e perfil de tatuador.
- `src/lib/`: domínio, segurança, cliente Supabase, SQL, utilitários.
- `src/components/`: layout, guardas de rota e boundary de erro.
- `src/types/`: tipos do banco e tipos de domínio.
- `docs/`: análise, roadmap, regras e planos de marca.
- `.claude/`: base operacional para agentes.
- `scripts/`: geração de tipos Supabase e cidades brasileiras.
- `public/`: headers de segurança, favicon e assets públicos.

Não há `README.md` nem pasta `supabase/`. O schema e RLS estão em `src/lib/database.sql` e `src/lib/rls-policies.sql`, contrariando a própria regra do projeto.

# 3. Fluxo da aplicação

- Auth: Supabase Auth por e-mail/senha; cadastro, callback e logout.
- Autorização: `PrivateRoute` + `useAccess`; papéis `manager` e `artist`.
- Banco: PostgreSQL/Supabase com RLS, funções RPC para convites, booking, entregas e acesso.
- Frontend: React Router, layout dashboard, páginas públicas com slug.
- Backend: não há backend próprio; services chamam Supabase diretamente.
- Storage: buckets para logos, artistas, galeria, referências de booking e entregas.
- APIs: Supabase JS SDK e RPCs como `get_booked_appointment_times`, `accept_artist_invite` e `get_client_delivery_by_token`.

# 4. Estado atual

Pronto:

- Onboarding de estúdio, horários, artista e serviço inicial.
- Login, registro e ativação de tatuador via convite.
- Gestão de agenda, clientes, artistas, serviços, galeria e entregas.
- Booking público com verificação de horários ocupados.
- Financeiro, pagamentos e regras de comissão.
- CI com typecheck, lint, testes, build e audit.
- Headers de segurança e validação de uploads.

Incompleto:

- Lembretes existem no schema/service, mas não há integração real com WhatsApp.
- Sem pagamentos online.
- Sem cache, paginação, code splitting, E2E ou testes de hooks.
- Sem migrations versionadas ou ambiente local Supabase.
- Reviews existem no tipo/schema, mas não há fluxo funcional de produto identificado.

Problemas/riscos:

- `npm run test` excedeu 60 s nesta análise; a suíte não está confiável como gate local atual.
- `useAuth()` é chamado em múltiplos hooks/guards, criando múltiplas leituras e subscriptions de auth por árvore renderizada.
- Documentação afirma que `.env` está ignorado, mas `.env.production` está versionado.
- `wrangler.jsonc` contém URL e chave pública do Supabase. A anon key pode ser pública, mas gestão por ambiente no Cloudflare é mais profissional.
- RLS é a fronteira real de segurança; services internos frequentemente filtram apenas por `id`, reduzindo defesa em profundidade.
- Mock mode e rate limit client-side não devem ser tratados como controles de produção.

# 5. Documentação

Úteis:

- [TECHNICAL_BASE.md](</C:/Users/George e Amanda/Documents/SaaS do studio/tattoo-studio-saas/docs/TECHNICAL_BASE.md>) é o documento operacional mais concreto.
- [PROJECT_ANALYSIS.md](</C:/Users/George e Amanda/Documents/SaaS do studio/tattoo-studio-saas/docs/PROJECT_ANALYSIS.md>) traz inventário técnico amplo.
- [RELATORIO_SEGURANCA.md](</C:/Users/George e Amanda/Documents/SaaS do studio/tattoo-studio-saas/RELATORIO_SEGURANCA.md>) registra riscos e medidas.
- Specs e plano de marca registram decisões de Inkora.

Duplicados:

- `CLAUDE.md` e `PROJECT_DOCUMENTATION.md` repetem perfil, stack, comandos e regras.
- `PROJECT_DOCUMENTATION.md` replica a estrutura de `ARCHITECTURE`, `ROADMAP`, `DECISIONS` e `PROJECT_RULES`.

Desatualizados/incompletos:

- `ARCHITECTURE.md`, `DECISIONS.md`, `ROADMAP.md` e `PROJECT_RULES.md` são majoritariamente índices/placeholders.
- Relatório de segurança declara testes passando; hoje a suíte excedeu o timeout.
- Docs prescrevem migrations, componentes UI e tokens Tailwind, mas o repo ainda não os possui.

Ausentes:

- README de entrada.
- Guia de setup local.
- Runbook de deploy/rollback.
- Migrations Supabase reais.
- Contrato de dados/schema versionado.
- Estratégia E2E, observabilidade e resposta a incidentes.

# 6. Knowledge Base

`.claude/` contém:

- 10 agentes: backend, database, deployment, frontend, performance, refactor, security, Supabase, testing e UI/UX.
- 11 comandos: audit, bugfix, check, cleanup, deploy, documentation, feature, migration, planning, refactor, review e security-review.
- 21 memórias: arquitetura, auth, autorização, backend, componentes, banco, deploy, ambiente, frontend, hooks, performance, projeto, rotas, segurança, serviços, estado, storage e Supabase.
- 4 templates: ADR, decisão técnica, feature spec e bug report.
- 11 checklists: feature, bug fix, banco, segurança, performance, PR, release, deploy, refactor e revisão.

Ajuda como guia de especialização e checklist, mas está excessiva para o tamanho atual do projeto e parcialmente contraditória com o código. Simplificaria para um `CLAUDE.md` útil, 5–6 checklists, ADRs reais e uma única memória canônica. Também é importante versionar `.claude/`: hoje ela aparece como não rastreada no Git.

# 7. Recomendações

1. Criar migrations versionadas e mover SQL para `supabase/migrations/`.
2. Corrigir e estabilizar a suíte de testes antes de confiar no CI.
3. Criar testes para `useAuth`, `useAccess`, `useDashboard` e `useArtist`.
4. Centralizar estado de autenticação/acesso em provider para evitar subscriptions duplicadas.
5. Implementar RLS no Supabase e validar com testes de autorização reais.
6. Filtrar operações privadas por `id + studio_id`.
7. Adicionar code splitting por rota e cache de queries.
8. Criar README, setup local e runbooks de deploy/rollback.
9. Remover/centralizar docs placeholder e manter uma fonte de verdade.
10. Implementar observabilidade persistente, rate limiting server-side e revisão LGPD antes de escala.

Nenhum arquivo foi criado ou alterado.
