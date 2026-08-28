# INKORA SaaS — Sprint 1 Implementation Plan

> Fonte oficial de retomada da Sprint 1.
>
> Estado deste documento: planejamento consolidado; nenhuma implementação iniciada.
>
> Data da consolidação: 2026-07-20.
>
> Branch atual no encerramento: `main`.
>
> Commit atual no encerramento: `d81c1ac` (`elimina resolucao duplicada de acesso`).

## Objetivo

Estabilizar Onboarding, Configurações, Serviços, Agenda e Financeiro sem alterar a arquitetura principal, autenticação, permissões, rotas ou identidade visual do Inkora.

## Restrições globais aprovadas

- Preservar arquitetura atual.
- Preservar fluxo `Page → Hook/Service → Supabase`.
- Não criar outro projeto.
- Não adicionar dependências sem nova aprovação.
- Não alterar autenticação.
- Não alterar permissões ou RLS nesta Sprint.
- Não alterar rotas.
- Não alterar identidade visual.
- Não criar telas novas.
- Não criar migration destrutiva.
- Não remover a coluna `services.category` do banco.
- Não implementar WhatsApp, email, envio como documento ou CRM nesta Sprint.
- Produção nova deve seguir TDD: teste falhando, correção mínima, teste passando.
- Refatoração permitida somente quando necessária aos módulos incluídos.

---

## 1. Estado atual do projeto

### 1.1 Arquitetura identificada

- SPA em React 18, TypeScript e Vite.
- Supabase como backend: PostgreSQL, Auth e Storage.
- Cloudflare Workers/Assets para publicação do frontend.
- React Router com rotas públicas e privadas.
- Autorização em três camadas:
  1. `PrivateRoute` no frontend;
  2. `access.service` para resolver manager/artista;
  3. RLS no PostgreSQL como barreira real de segurança.
- Estado local por página/hook; não existe store global.
- Não existe Provider global de domínio. Hooks instanciam seu próprio estado.
- Domínio puro fica em `src/lib/`.
- Acesso a dados fica em `src/services/`.
- Algumas páginas ainda concentram estado e orquestração; `Settings.tsx` acessa Supabase diretamente, divergindo do padrão declarado.

### 1.2 Estrutura do projeto

```text
src/
├── components/layout/     layouts, sidebar e guardas de rota
├── components/shared/     componentes compartilhados existentes
├── components/ui/         atualmente vazio
├── hooks/                 autenticação, acesso e estado do dashboard
├── lib/                   domínio puro, utilitários e SQL legado
├── pages/                 páginas separadas por módulo
├── routes/                definição de rotas
├── services/              queries e comandos Supabase
├── test/                  configuração de testes
└── types/                 tipos gerados do banco

supabase/migrations/       migrations formais
docs/                      documentação e relatórios
.github/workflows/         CI
```

Arquivos grandes relevantes:

- `src/pages/onboarding/OnboardingPage.tsx`: aproximadamente 49 KB.
- `src/services/onboarding.service.ts`: aproximadamente 22 KB.
- `src/pages/dashboard/Settings.tsx`: aproximadamente 19 KB.
- `src/pages/financial/FinancialPage.tsx`: aproximadamente 16 KB.
- `src/services/financial.service.ts`: aproximadamente 12 KB.
- `src/lib/database.sql`: schema-base legado, aproximadamente 42 KB.
- `src/lib/rls-policies.sql`: RLS legado, aproximadamente 18 KB.

### 1.3 Fluxo de dados

Fluxo desejado e predominante:

```text
Page
  ↓
Hook de estado/orquestração, quando necessário
  ↓
Service
  ↓
Supabase JS
  ↓
PostgreSQL/RLS/Storage
```

Exceções atuais:

- `Settings.tsx` executa queries Supabase diretamente.
- `FinancialPage.tsx` concentra múltiplos estados e dispara várias consultas diretamente nos services.
- Agenda, Serviços e Entregas não possuem hooks próprios.

### 1.4 Principais módulos

- Autenticação e cadastro.
- Onboarding do estúdio.
- Dashboard.
- Agenda interna.
- Agendamento público.
- Clientes.
- Tatuadores e convites.
- Serviços.
- Galeria.
- Entregas de fotos.
- Financeiro e comissões.
- Configurações do estúdio.

### 1.5 Dependências

Produção:

- `react` 18.3.1.
- `react-dom` 18.3.1.
- `react-router-dom` 6.28.0.
- `@supabase/supabase-js` 2.50+.
- `lucide-react` 0.468+.

Ferramentas:

- TypeScript 5.7.
- Vite 6.
- Vitest 4.
- Testing Library.
- ESLint 10.
- Tailwind CSS 3.4.
- Supabase CLI 2.109.
- Node 22 e npm 10+.

Nenhuma dependência nova está prevista para esta Sprint.

### 1.6 Banco de dados

O schema legado descreve aproximadamente 15 tabelas, incluindo:

- `studios`.
- `working_hours`.
- `tattoo_artists`.
- `artist_access_invites`.
- `studio_members`.
- `services`.
- `clients`.
- `appointments`.
- `payments`.
- `artist_commission_rules`.
- `payment_commissions`.
- `gallery`.
- `client_deliveries`.
- `client_delivery_photos`.
- `reminders`.

Características relevantes:

- UUID como chave primária.
- `working_hours` possui dia, status aberto/fechado, abertura e fechamento.
- `services.category` é `text`, nullable e sem regra de domínio.
- `services.avg_duration_minutes` existe.
- Agendamentos guardam horário inicial, mas não guardam fim/duração congelada.
- O índice atual evita dois agendamentos com o mesmo horário inicial, mas não impede sobreposição por duração.
- Relações existem no SQL legado, porém `database.types.ts` registra `Relationships: []` em várias tabelas.

### 1.7 RLS

- RLS é a única barreira real de autorização.
- SQL legado contém policies para manager, artista e público.
- `src/lib/database.sql` e `src/lib/rls-policies.sql` divergem em policies de Agenda, Financeiro e Entregas.
- A aplicação não pode afirmar, somente pelo repositório, qual conjunto corresponde integralmente ao ambiente remoto.
- Esta Sprint não alterará policies.
- Qualquer erro autenticado de RLS encontrado deverá ser documentado e tratado separadamente, sem mudança silenciosa de permissão.

### 1.8 Migrations

Existem somente duas migrations formais:

1. `supabase/migrations/20260714153000_add_artist_access_schema.sql`.
2. `supabase/migrations/20260714154000_add_financial_ledger_schema.sql`.

Ambas são incrementais e dependem de tabelas criadas fora do histórico formal. Um banco vazio não pode ser reconstruído apenas com essas migrations.

O schema-base e parte das policies continuam em:

- `src/lib/database.sql`.
- `src/lib/rls-policies.sql`.

Reprodução completa do banco será tratada em Sprint futura. Nenhuma migration está planejada para este lote.

### 1.9 Organização do domínio

Domínios puros existentes:

- `appointment-domain.ts`.
- `finance-domain.ts`.
- `access-control.ts`.
- `text-limit.ts`.
- `slugs.ts`.

Domínios a criar nesta Sprint:

- `working-hours.ts`: atualização, normalização e validação de expediente.
- `scheduling-domain.ts`: intervalos, duração e conflitos.
- `service-domain.ts`: validação consistente de nome, preço e duração.

Esses helpers não acessarão React, Supabase, navegador ou storage.

### 1.10 Baseline técnico

No encerramento do planejamento:

- `git status`: limpo.
- TypeScript: aprovado.
- Vitest: 20 arquivos, 95 testes aprovados.
- ESLint: reprovado com 5 erros antigos.
- Nenhum arquivo de produção alterado nesta sessão.

Erros ESLint existentes:

1. `src/hooks/useArtist.ts`: `accessEmail` atribuído e não usado.
2. `src/pages/artists/ArtistModal.tsx`: `caughtError` não usado.
3. `src/pages/public/ArtistActivationPage.tsx`: `Date.now()` impuro durante render.
4. `src/services/artists.service.ts`: atribuição inútil a `accessEmail`.
5. `src/services/artists.service.ts`: `error` capturado e não usado.

---

## 2. Resumo da auditoria

### 2.1 Onboarding e Configurações

Causa raiz confirmada do bug de horários:

- `OnboardingPage.updateHour` aplica `[field]: value` e depois sobrescreve `open_time` e `close_time` com os valores antigos.
- `Settings.updateDay` repete o mesmo padrão.
- O valor novo é perdido no estado React antes de chegar ao service.
- `syncWorkingHours` persiste corretamente o estado que recebe; portanto o defeito imediato não está no Supabase.

Riscos adicionais:

- Rascunho do onboarding prevalece sobre horários do banco quando possui `workingHours`.
- Rascunho não é escopado por usuário.
- Escrita dos sete dias não é atômica.
- Updates não confirmam quantidade de linhas afetadas.
- Settings permite salvar abertura maior ou igual ao fechamento.
- Não existe timezone do estúdio; cálculos usam timezone do navegador.
- Onboarding e Settings contam descrição de formas diferentes.

### 2.2 Financeiro

Problema estrutural confirmado:

- `FinancialPage.loadFinancial` usa um `Promise.all` com cinco operações.
- Qualquer falha derruba a página inteira.
- `getArtistCommissionSummaries` relê pagamentos e regras, elevando a carga para até sete consultas lógicas.
- A mensagem final não identifica qual seção/query falhou.
- Logger de produção não preserva diagnóstico suficiente para o usuário.

Validação remota read-only confirmou:

- Tabelas financeiras existem.
- Campos consultados existem.
- Joins PostgREST usados pelo código são válidos.
- Respostas anônimas vazias são compatíveis com RLS.

Ainda não confirmado:

- Qual request autenticada específica falha no cenário homologado.
- A primeira etapa da implementação financeira deve reproduzir o erro autenticado e registrar seção, código e status.

Outras inconsistências:

- Pagamentos usam `paid_at`; comissões mensais usam `created_at`.
- Pagamento retroativo pode entrar num mês e comissão em outro.
- Pagamento e ledger são duas operações client-side, sem transação real.
- Modais fecham sem aguardar atualização completa.
- Resumo histórico pode usar regra de comissão atual em mês antigo.
- Não existem testes diretos de `financial.service`.

### 2.3 Serviços

- Categoria é somente apresentação/texto.
- Agenda interna já não depende semanticamente da categoria.
- Modal e lista duplicam vocabulário/cores de categoria.
- Preço zero é exibido como ausente por verificação truthy.
- Onboarding exige duração inteira mínima de 30 minutos.
- Modal normal de Serviços não aplica a mesma regra.
- Coluna `category` pode permanecer no banco sem uso pela aplicação.

Decisão:

- Remover categoria de componentes, tipos manuais, selects e payloads.
- Não remover a coluna do schema nem dos tipos gerados automaticamente.
- Não enviar valor default como `"Outro"`.

### 2.4 Agenda

- Agenda interna usa horários fixos e ignora `working_hours`.
- Duração do serviço não participa dos conflitos.
- Booking público gera slots fixos de 60 minutos.
- Conflito atual considera somente mesmo horário inicial.
- Agenda interna aceita data passada.
- Tatuador vê controles que podem tentar operações incompatíveis com RLS.
- Carregamento de opções pode falhar sem mensagem específica.
- Troca rápida de data pode exibir resposta atrasada da data anterior.

Regra aprovada:

- Cliente online não agenda fora do expediente.
- Tatuador não agenda fora do expediente.
- Gestor pode agendar fora do expediente após aviso e confirmação.
- Override do gestor vale para expediente; conflitos reais continuam bloqueados para todos.
- Datas passadas continuam bloqueadas para todos.
- Duração real do serviço define intervalo.
- Configuração vem de `working_hours` do estúdio.

Limitação conhecida desta arquitetura:

- Validação client/service reduz conflitos, mas não elimina corrida simultânea entre dois clientes.
- Garantia transacional completa exigiria mudança de banco/RPC e ficará para Sprint futura.

### 2.5 Entregas e compartilhamento

Achados importantes, fora do escopo definitivo deste lote:

- Link `download` cross-origin pode abrir imagem em vez de baixar.
- WhatsApp, email e envio como documento são funcionalidades novas.
- Entregas não são atômicas.
- Bucket público reduz eficácia da expiração do token.
- Existem riscos de integridade cross-tenant no schema legado.
- `DeliveryModal` possui risco de loop ao limpar `files` fechado.

Esses itens devem ser tratados em Sprint 2/3, não nesta implementação.

### 2.6 UX e código técnico

- Inputs, botões e modais estão duplicados.
- `components/ui/index.ts` está vazio.
- Cores hardcoded são frequentes.
- Loaders são majoritariamente texto simples.
- Modais têm lacunas de acessibilidade.
- Refatoração global seria ampla demais para o lote aprovado.

Decisão:

- Ajustar feedback/loading/acessibilidade somente nas telas tocadas.
- Não iniciar design system, skeleton global, tema ou refatoração transversal.

### 2.7 Riscos consolidados

- Drift entre banco remoto, SQL legado e migrations.
- RLS real não totalmente reproduzível localmente.
- Estado de onboarding em `localStorage` não escopado por usuário.
- Horários e datas dependem do timezone do navegador.
- Agendamento concorrente pode ultrapassar validação client-side.
- Financeiro não é transacional.
- Remover `category` dos tipos errados pode quebrar tipos gerados do Supabase.
- Mudanças amplas de UX poderiam alterar identidade visual; proibido.

---

## 3. Decisões aprovadas nesta conversa

- [x] Manter arquitetura atual.
- [x] Usar domínio compartilhado com helpers puros.
- [x] Onboarding, Configurações e Agenda usarão a mesma lógica de expediente.
- [x] Duração e conflitos serão centralizados em helpers reutilizáveis.
- [x] Manter `services.category` somente no banco por compatibilidade.
- [x] Remover categoria da interface.
- [x] Remover categoria dos tipos de domínio manuais.
- [x] Remover categoria dos payloads da aplicação.
- [x] Não criar migration destrutiva.
- [x] Financeiro carregará por seções independentes.
- [x] Falha numa seção não bloqueará dados carregados das outras.
- [x] Cada seção financeira terá retry independente.
- [x] Erros financeiros serão registrados com contexto técnico seguro.
- [x] Cliente online será bloqueado fora do expediente.
- [x] Tatuador será bloqueado fora do expediente.
- [x] Gestor poderá continuar fora do expediente após aviso e confirmação.
- [x] Horários virão da configuração feita no Onboarding/Configurações.
- [x] Conflitos por sobreposição serão bloqueados.
- [x] Datas passadas serão bloqueadas.
- [x] Não alterar autenticação.
- [x] Não alterar permissões/RLS.
- [x] Não alterar rotas.
- [x] Não alterar identidade visual.
- [x] Não implementar Entregas/WhatsApp/email/documento neste lote.
- [x] Não implementar descrição de 1000 caracteres neste lote.
- [x] Não implementar skeleton global ou refatoração ampla neste lote.
- [x] Não implementar nada na sessão de planejamento.
- [x] Não executar migrations nem criar commit nesta sessão.

---

## 4. Escopo definitivo da Sprint 1

### P0 — Preparação segura

1. Criar worktree/branch isolada para Sprint 1.
2. Confirmar `main` limpa e sincronizada.
3. Registrar baseline de testes, TypeScript e ESLint.
4. Não repetir auditoria nem rediscutir decisões deste documento.

### P1 — Bug crítico de horários

1. Criar domínio puro de expediente.
2. Criar teste que reproduza perda de `open_time`.
3. Criar teste que reproduza perda de `close_time`.
4. Corrigir handler do Onboarding.
5. Corrigir handler de Configurações.
6. Validar sete dias, aberto/fechado e abertura anterior ao fechamento.
7. Persistir valores personalizados.
8. Recarregar snapshot e confirmar valores.
9. Preservar toggle aberto/fechado.

### P1 — Serviços sem categoria

1. Criar domínio compartilhado de serviço.
2. Remover select/campo Categoria do modal.
3. Remover badge/estilo de categoria da listagem.
4. Remover categoria dos tipos manuais.
5. Remover categoria dos payloads de criação/edição/onboarding.
6. Alterar queries para selecionar somente campos usados.
7. Manter coluna e tipo gerado do Supabase intactos.
8. Exigir duração inteira mínima de 30 minutos.
9. Manter preço inicial opcional; quando informado, exigir valor não negativo.
10. Corrigir exibição de preço `0`.
11. Manter descrição opcional e status ativo/inativo.

### P1 — Agenda com domínio compartilhado

1. Usar duração do serviço para calcular horário final.
2. Usar `working_hours` do dia selecionado.
3. Bloquear data passada.
4. Bloquear dia fechado para cliente/tatuador.
5. Bloquear intervalo fora do expediente para cliente/tatuador.
6. Mostrar aviso ao gestor fora do expediente.
7. Exigir confirmação explícita do gestor antes de salvar override.
8. Bloquear sobreposição para todos os papéis.
9. Considerar agendamentos existentes com duração real.
10. Usar fallback de 60 minutos somente para registros legados sem duração.
11. Impedir resposta atrasada de data anterior sobrescrever data atual.
12. Exibir erro específico ao falhar carregamento de clientes/artistas/serviços/horários.
13. Aplicar mesma lógica ao booking público sem alterar rotas.

### P1 — Financeiro resiliente

1. Reproduzir cenário autenticado e identificar seção que falha.
2. Nomear consultas/seções nos logs.
3. Separar estados de histórico, resumo, comissões e regras.
4. Remover carregamento tudo-ou-nada.
5. Remover leituras duplicadas de pagamentos/regras.
6. Derivar cards e resumos do mesmo snapshot quando possível.
7. Mostrar dados aprovados mesmo quando outra seção falhar.
8. Mostrar erro específico somente na seção afetada.
9. Criar botão retry por seção.
10. Retry deve executar somente a seção afetada.
11. Aguardar refresh depois de pagamento/regra antes de fechar fluxo.
12. Preservar pagamento salvo mesmo se refresh posterior falhar.
13. Registrar falha de refresh separadamente.
14. Alinhar competência mensal de comissão com `payments.paid_at` no domínio de leitura, sem migration.

### P2 — Limpeza necessária

1. Corrigir os cinco erros ESLint baseline.
2. Remover somente imports/variáveis mortos encontrados nos arquivos tocados.
3. Não executar refatoração global.
4. Melhorar `aria-live`, `aria-busy` e retry somente nas seções alteradas.

### P3 — Verificação e entrega

1. Testes focados por ciclo TDD.
2. Suíte completa.
3. TypeScript.
4. ESLint global.
5. Build de produção.
6. `git diff --check`.
7. Revisão independente de código.
8. Homologação manual dos fluxos críticos.
9. Relatório final da Sprint.
10. Merge/deploy somente após autorização do usuário.

---

## 5. Ordem recomendada de implementação

### Task 0 — Isolamento e baseline

**Ações:**

1. Usar `superpowers:using-git-worktrees`.
2. Criar branch `codex/sprint1-stabilization` em worktree própria.
3. Executar:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run lint
git status --short --branch
```

**Resultado esperado:**

- TypeScript verde.
- 95 testes ou mais verdes.
- Exatamente os cinco erros ESLint conhecidos, caso ainda não tenham sido corrigidos por outra mudança externa.
- Worktree limpa.

### Task 1 — Domínio de expediente e conflitos

**Criar:**

- `src/lib/working-hours.ts`.
- `src/lib/working-hours.test.ts`.
- `src/lib/scheduling-domain.ts`.
- `src/lib/scheduling-domain.test.ts`.

**Interfaces planejadas:**

```ts
export type WorkingHourField = "is_open" | "open_time" | "close_time";

export function updateWorkingHourField(
  hour: OnboardingWorkingHour,
  field: WorkingHourField,
  value: boolean | string | null,
): OnboardingWorkingHour;

export function validateWorkingHours(hours: OnboardingWorkingHour[]): string;

export function timeToMinutes(time: string): number;

export function intervalsOverlap(
  firstStart: number,
  firstDuration: number,
  secondStart: number,
  secondDuration: number,
): boolean;

export function isWithinWorkingHours(
  startTime: string,
  durationMinutes: number,
  workingHour: OnboardingWorkingHour,
): boolean;
```

**TDD obrigatório:**

1. RED: editar abertura preserva novo valor.
2. GREEN: implementação mínima.
3. RED: editar fechamento preserva novo valor.
4. GREEN.
5. RED: fechado limpa horários.
6. GREEN.
7. RED: `09:00 + 120` conflita com `10:00 + 60`.
8. GREEN.
9. RED: intervalo terminando após fechamento é inválido.
10. GREEN.

### Task 2 — Onboarding e Configurações

**Modificar:**

- `src/pages/onboarding/OnboardingPage.tsx`.
- `src/pages/onboarding/OnboardingPage.test.tsx`.
- `src/services/onboarding.service.ts`.
- `src/services/onboarding.service.test.ts`.
- `src/pages/dashboard/Settings.tsx`.

**Criar:**

- `src/pages/dashboard/Settings.test.tsx`.
- `src/services/settings.service.ts`, somente se necessário para remover acesso Supabase direto da página sem ampliar escopo.
- `src/services/settings.service.test.ts`, se o service for criado.

**Sequência:**

1. RED: alterar `open_time` no Onboarding e verificar estado/payload.
2. RED: alterar `close_time` no Onboarding.
3. Corrigir com `updateWorkingHourField`.
4. GREEN.
5. Repetir RED/GREEN em Settings.
6. RED: rejeitar `open_time >= close_time`.
7. GREEN usando `validateWorkingHours`.
8. RED: persistir sete horários personalizados e reler snapshot.
9. GREEN no service.
10. Verificar que rascunho não reintroduz valores antigos após persistência.

### Task 3 — Domínio e módulo de Serviços

**Criar:**

- `src/lib/service-domain.ts`.
- `src/lib/service-domain.test.ts`.
- `src/services/services.service.test.ts`.
- `src/pages/services/ServiceModal.test.tsx`.
- `src/pages/services/ServicesPage.test.tsx`.

**Modificar:**

- `src/services/services.service.ts`.
- `src/pages/services/ServiceModal.tsx`.
- `src/pages/services/ServicesPage.tsx`.
- `src/services/onboarding.service.ts`.
- `src/pages/onboarding/OnboardingPage.tsx`.

**Interfaces planejadas:**

```ts
export type ServiceDraftInput = {
  name: string;
  description?: string;
  startingPrice?: number | null;
  durationMinutes: number;
};

export function validateServiceInput(input: ServiceDraftInput): string;
```

**Sequência:**

1. RED: modal não renderiza Categoria.
2. RED: payload não contém `category`.
3. RED: duração `29`, `30.5`, `NaN` e infinita é rejeitada.
4. RED: duração `30` é aceita.
5. RED: preço vazio é aceito; preço negativo é rejeitado; zero é exibido como `R$ 0,00`.
6. Implementar mínimo.
7. GREEN focado.
8. Buscar `category` em arquivos de aplicação e confirmar apenas schema/tipos gerados/compatibilidade documental.

### Task 4 — Agenda e booking público

**Modificar:**

- `src/services/agenda.service.ts`.
- `src/pages/agenda/NewAppointmentModal.tsx`.
- `src/pages/agenda/AgendaPage.tsx`.
- `src/services/booking.service.ts`.
- `src/services/booking.service.test.ts`.
- `src/services/booking.flow.test.ts`.

**Criar:**

- `src/services/agenda.service.test.ts`.
- `src/pages/agenda/NewAppointmentModal.test.tsx`.
- `src/pages/agenda/AgendaPage.test.tsx`.

**Dados necessários:**

- Serviço: `id`, `name`, `starting_price`, `avg_duration_minutes`.
- Expediente: sete linhas de `working_hours`.
- Agendamentos do dia: `date`, `time`, serviço/duração.
- Papel atual vindo do contexto de acesso já carregado.

**Sequência:**

1. RED: cliente online bloqueado fora do expediente.
2. RED: tatuador bloqueado fora do expediente.
3. RED: gestor recebe aviso e confirmação.
4. RED: gestor cancela confirmação e nada é salvo.
5. RED: gestor confirma e salvamento prossegue.
6. RED: conflito por sobreposição bloqueado para todos.
7. RED: duração de 120 minutos ocupa duas horas.
8. RED: serviço legado sem duração usa 60 minutos.
9. RED: data passada bloqueada.
10. Implementar com helpers compartilhados.
11. GREEN focado.
12. Testar resposta fora de ordem ao trocar data.

### Task 5 — Financeiro resiliente

**Criar:**

- `src/hooks/useFinancialDashboard.ts`.
- `src/hooks/useFinancialDashboard.test.tsx`.
- `src/services/financial.service.test.ts`.

**Modificar:**

- `src/pages/financial/FinancialPage.tsx`.
- `src/pages/financial/PaymentModal.tsx`.
- `src/pages/financial/CommissionRuleModal.tsx`.
- `src/services/financial.service.ts`.
- `src/lib/finance-domain.ts`.
- `src/lib/finance-domain.test.ts`.

**Estado planejado por seção:**

```ts
export type FinancialSectionState<T> = {
  data: T;
  loading: boolean;
  error: string;
};
```

Seções:

- Histórico/pagamentos.
- Resumo/cards.
- Comissões por artista.
- Regras e artistas para manager.

**Sequência:**

1. Reproduzir erro autenticado e registrar request/seção real.
2. RED: falha do resumo não remove histórico.
3. RED: falha do histórico não remove regras carregadas.
4. RED: retry do resumo não relê histórico.
5. RED: logs incluem seção, código/status disponível, mês, ano e studioId; sem dados pessoais.
6. RED: pagamentos e regras não são buscados duas vezes no mesmo ciclo.
7. Extrair agregação pura para `finance-domain`.
8. Implementar hook com carregadores independentes.
9. GREEN focado.
10. RED: modal aguarda refresh.
11. RED: falha de refresh mostra aviso específico sem apagar pagamento criado.
12. GREEN.

### Task 6 — ESLint e limpeza limitada

**Modificar somente para zerar baseline:**

- `src/hooks/useArtist.ts`.
- `src/pages/artists/ArtistModal.tsx`.
- `src/pages/public/ArtistActivationPage.tsx`.
- `src/services/artists.service.ts`.

**Sequência:**

1. Adicionar/ajustar testes de comportamento quando a correção tocar execução.
2. Remover atribuições/capturas realmente mortas.
3. Substituir `Date.now()` durante render por valor estável calculado fora da renderização impura.
4. Rodar ESLint focado.
5. Rodar ESLint global.

### Task 7 — Verificação final e relatório

**Comandos obrigatórios:**

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
git diff --check
git status --short --branch
```

**Revisões:**

1. Revisão de conformidade com este documento.
2. Revisão de qualidade e regressões.
3. Homologação manual.
4. Relatório final com arquivos, migrations, bugs, melhorias, testes e itens futuros.

---

## 6. Arquivos previstos

### Novos arquivos prováveis

- `src/lib/working-hours.ts`.
- `src/lib/working-hours.test.ts`.
- `src/lib/scheduling-domain.ts`.
- `src/lib/scheduling-domain.test.ts`.
- `src/lib/service-domain.ts`.
- `src/lib/service-domain.test.ts`.
- `src/services/services.service.test.ts`.
- `src/services/agenda.service.test.ts`.
- `src/services/financial.service.test.ts`.
- `src/hooks/useFinancialDashboard.ts`.
- `src/hooks/useFinancialDashboard.test.tsx`.
- `src/pages/dashboard/Settings.test.tsx`.
- `src/pages/services/ServiceModal.test.tsx`.
- `src/pages/services/ServicesPage.test.tsx`.
- `src/pages/agenda/NewAppointmentModal.test.tsx`.
- `src/pages/agenda/AgendaPage.test.tsx`.
- `src/services/settings.service.ts`, apenas se necessário para retirar Supabase direto de Settings.
- `src/services/settings.service.test.ts`, condicionado à criação do service.

### Arquivos previstos para modificação

- `src/pages/onboarding/OnboardingPage.tsx`.
- `src/pages/onboarding/OnboardingPage.test.tsx`.
- `src/services/onboarding.service.ts`.
- `src/services/onboarding.service.test.ts`.
- `src/pages/dashboard/Settings.tsx`.
- `src/pages/services/ServiceModal.tsx`.
- `src/pages/services/ServicesPage.tsx`.
- `src/services/services.service.ts`.
- `src/pages/agenda/NewAppointmentModal.tsx`.
- `src/pages/agenda/AgendaPage.tsx`.
- `src/services/agenda.service.ts`.
- `src/services/booking.service.ts`.
- `src/services/booking.service.test.ts`.
- `src/services/booking.flow.test.ts`.
- `src/pages/financial/FinancialPage.tsx`.
- `src/pages/financial/PaymentModal.tsx`.
- `src/pages/financial/CommissionRuleModal.tsx`.
- `src/services/financial.service.ts`.
- `src/lib/finance-domain.ts`.
- `src/lib/finance-domain.test.ts`.
- `src/hooks/useArtist.ts`.
- `src/pages/artists/ArtistModal.tsx`.
- `src/pages/public/ArtistActivationPage.tsx`.
- `src/services/artists.service.ts`.

### Arquivos proibidos de alteração sem nova aprovação

- `src/routes/index.tsx`.
- `src/hooks/useAuth.ts`.
- `src/hooks/useAccess.ts`.
- `src/components/layout/PrivateRoute.tsx`.
- Assets de marca.
- `wrangler.jsonc`.
- Migrations existentes.
- Policies RLS.

---

## 7. Banco de dados

### 7.1 Migrations previstas

Nenhuma migration prevista para o escopo aprovado.

Motivos:

- Bug de horários nasce no estado React.
- Coluna `category` será preservada.
- Resiliência financeira pode ser implementada na leitura/orquestração atual.
- Agenda usará validação de domínio compartilhado sem RPC nesta Sprint.

### 7.2 Alterações previstas

- Nenhuma alteração estrutural no banco.
- Nenhuma alteração de RLS.
- Nenhuma alteração de trigger.
- Nenhuma alteração de coluna.
- Queries selecionarão apenas campos realmente usados.
- Payloads novos de serviço omitirão `category`.

### 7.3 Alterações proibidas

- `DROP COLUMN category`.
- Reescrita ou remoção de dados existentes.
- Mudança de autenticação.
- Mudança de papel manager/artista.
- Ampliação de acesso público.
- Relaxamento de RLS.
- Mudança de bucket/storage.
- Migration base automática sem auditoria do banco remoto.
- RPC financeira/agenda sem nova decisão de arquitetura.

### 7.4 Itens de banco adiados

- Baseline migration reproduzível.
- Reconciliação `database.sql` versus `rls-policies.sql` versus remoto.
- Constraints de expediente.
- Timezone do estúdio.
- Conflito transacional por intervalo.
- Pagamento + comissão transacional.
- Integridade cross-tenant por constraints compostas.

---

## 8. Checklist completo

### Preparação

- [ ] Ler `RETOMAR DAQUI`.
- [ ] Confirmar `main` limpa.
- [ ] Criar worktree isolada.
- [ ] Criar branch `codex/sprint1-stabilization`.
- [ ] Registrar novo commit-base se `main` tiver avançado.
- [ ] Rodar baseline.
- [ ] Não repetir auditoria já documentada.

### Domínio compartilhado

- [ ] Criar `working-hours` com testes RED/GREEN.
- [ ] Criar `scheduling-domain` com testes RED/GREEN.
- [ ] Criar `service-domain` com testes RED/GREEN.
- [ ] Helpers sem React/Supabase/browser.
- [ ] Duração inteira mínima de 30 minutos.
- [ ] Sobreposição testada nos limites.
- [ ] Expediente testado nos limites.

### Onboarding

- [ ] Reproduzir bug de abertura.
- [ ] Reproduzir bug de fechamento.
- [ ] Corrigir handler.
- [ ] Toggle fechado continua funcionando.
- [ ] Sete dias persistem.
- [ ] Valores customizados permanecem após reload.
- [ ] Horário inválido é bloqueado.
- [ ] Rascunho não sobrescreve valor persistido novo.

### Configurações

- [ ] Adicionar teste de componente.
- [ ] Corrigir mesmo bug de abertura/fechamento.
- [ ] Usar helper compartilhado.
- [ ] Validar abertura anterior ao fechamento.
- [ ] Confirmar persistência e releitura.
- [ ] Não alterar identidade visual.

### Serviços

- [ ] Remover campo Categoria do modal.
- [ ] Remover categoria da listagem.
- [ ] Remover estilos/mapas de categoria.
- [ ] Remover categoria dos tipos manuais.
- [ ] Remover categoria dos payloads.
- [ ] Preservar coluna no banco.
- [ ] Preservar categoria nos tipos gerados do Supabase.
- [ ] Validar duração.
- [ ] Validar preço quando informado.
- [ ] Exibir preço zero corretamente.
- [ ] Testar cadastro.
- [ ] Testar edição.
- [ ] Testar status.
- [ ] Testar listagem.

### Agenda

- [ ] Carregar expediente configurado.
- [ ] Carregar duração do serviço.
- [ ] Calcular horário final.
- [ ] Bloquear data passada.
- [ ] Bloquear cliente online fora do expediente.
- [ ] Bloquear tatuador fora do expediente.
- [ ] Avisar gestor fora do expediente.
- [ ] Exigir confirmação do gestor.
- [ ] Cancelar confirmação sem salvar.
- [ ] Bloquear conflito para todos.
- [ ] Usar fallback 60 somente em legado.
- [ ] Testar serviço 30 minutos.
- [ ] Testar serviço 60 minutos.
- [ ] Testar serviço 120 minutos.
- [ ] Testar limite exato do fechamento.
- [ ] Testar dia fechado.
- [ ] Testar troca rápida de data.
- [ ] Exibir erro específico por carga de opções.

### Financeiro

- [ ] Reproduzir erro autenticado.
- [ ] Identificar seção/query real que falha.
- [ ] Criar estado independente por seção.
- [ ] Histórico independente.
- [ ] Resumo/cards independente.
- [ ] Comissões independente.
- [ ] Regras/artistas independente.
- [ ] Remover consultas duplicadas.
- [ ] Manter dados bem-sucedidos visíveis.
- [ ] Mostrar erro somente na seção afetada.
- [ ] Adicionar retry específico.
- [ ] Retry não recarrega seção saudável.
- [ ] Log contém seção e contexto técnico.
- [ ] Log não contém dados pessoais.
- [ ] Modal aguarda refresh.
- [ ] Falha de refresh não apaga pagamento salvo.
- [ ] Totais usam competência coerente.

### ESLint e limpeza

- [ ] Corrigir cinco erros baseline.
- [ ] Não refatorar módulos alheios.
- [ ] ESLint focado verde.
- [ ] ESLint global verde.

### Verificação

- [ ] Testes focados verdes.
- [ ] Suíte completa verde.
- [ ] TypeScript verde.
- [ ] ESLint verde.
- [ ] Build verde.
- [ ] `git diff --check` verde.
- [ ] Worktree sem alterações não commitadas.
- [ ] Revisão de especificação/conformidade.
- [ ] Revisão de qualidade.
- [ ] Homologação manual.
- [ ] Relatório final criado.
- [ ] Usuário aprova integração/deploy.

---

## 9. Critérios de aceite

Sprint considerada concluída somente quando todos forem verdadeiros:

### Onboarding e Configurações

- Alterar abertura/fechamento atualiza estado correto.
- Exatamente sete dias são persistidos.
- Horários sobrevivem logout/reload/retomada.
- Fechado persiste sem horários ativos.
- Aberto exige abertura e fechamento válidos.
- Abertura deve ser anterior ao fechamento.

### Serviços

- Categoria não aparece na aplicação.
- Nenhum payload novo envia `category`.
- Coluna permanece no banco.
- Nome obrigatório.
- Duração inteira mínima de 30 minutos.
- Preço opcional; não negativo quando informado.
- Agenda consome nome, valor e duração.

### Agenda

- Cliente online não agenda fora do expediente.
- Tatuador não agenda fora do expediente.
- Gestor recebe aviso e só continua após confirmação.
- Data passada é bloqueada.
- Sobreposição é bloqueada para todos.
- Duração define intervalo real.
- Booking público e agenda interna compartilham domínio.
- Nenhuma rota ou permissão é alterada.

### Financeiro

- Uma seção com falha não derruba a página inteira.
- Seções saudáveis continuam visíveis.
- Erro identifica seção afetada.
- Retry recarrega somente seção afetada.
- Erro é registrado com contexto seguro.
- Pagamento salvo dispara refresh aguardado.
- Consultas duplicadas do mesmo snapshot são eliminadas.
- Cards, histórico e totais usam dados coerentes.

### Qualidade

- Todos os testes existentes e novos passam.
- TypeScript passa sem erro.
- ESLint passa sem erro.
- Build passa.
- Nenhuma migration destrutiva criada.
- Nenhuma alteração de auth, permissão, rota ou branding.
- Relatório final lista arquivos, migrations, bugs, melhorias, testes e itens futuros.

---

## 10. Próximas Sprints

### Sprint 2 — Entregas e Configurações ampliadas

- Download real cross-origin com nome original.
- Estratégia segura para `Content-Disposition` ou download via blob/Worker.
- Compartilhamento por link WhatsApp.
- Preparação de email sem envio automático não aprovado.
- Avaliar “enviar como documento” com limitações reais do WhatsApp.
- Corrigir lifecycle/atomicidade do `DeliveryModal`.
- Expiração real e estratégia de bucket privado/signed URLs.
- Descrição do estúdio com 1000 caracteres, regra única frontend/service/DB.

### Sprint 3 — Banco, segurança e atomicidade

- Baseline migration reproduzível.
- Reconciliação de RLS remoto/legado/migrations.
- Testes RLS por manager, artista, público e cross-tenant.
- Integridade composta entre estúdio, clientes, agendamentos e entregas.
- RPC transacional para pagamento/comissão.
- Proteção concorrente do teto de comissão.
- Proteção transacional contra conflito por intervalo.
- Timezone explícito do estúdio.

### Sprint 4 — UX, performance e maturidade

- Componentes UI base.
- Skeletons/loading padronizados.
- Acessibilidade completa de modais.
- Lazy routes/code splitting.
- Cache/prefetch de queries.
- Paginação.
- E2E.
- Observabilidade real.
- Limpeza técnica ampla.
- CRM somente após especificação própria.

---

## RETOMAR DAQUI

### Ponto de interrupção

Desenvolvimento interrompido após auditoria completa e aprovação da abordagem técnica. Nenhum código foi alterado. Nenhuma migration foi executada. Nenhum commit foi criado nesta sessão.

### Já decidido

- Implementar Sprint 1 usando domínio compartilhado.
- Preservar arquitetura principal.
- Corrigir horários no Onboarding e Configurações.
- Remover categoria somente da aplicação.
- Preservar `services.category` no banco.
- Tornar Financeiro resiliente por seções com retry independente.
- Usar `working_hours`, duração real e conflitos na Agenda.
- Cliente online e tatuador não podem sair do expediente.
- Gestor pode sair do expediente após aviso e confirmação.
- Conflitos reais permanecem bloqueados para todos.
- Não alterar auth, permissões, rotas, RLS ou identidade visual.
- Não criar migration destrutiva.
- Entregas, descrição 1000, UX global e refatoração ampla ficam fora deste lote.

### Ainda falta implementar

Tudo. Esta sessão produziu somente auditoria e plano.

### Primeiro passo ao retornar

1. Ler esta seção.
2. Não repetir auditoria ou planejamento.
3. Usar `superpowers:using-git-worktrees`.
4. Criar worktree/branch `codex/sprint1-stabilization`.
5. Rodar baseline.
6. Iniciar **Task 1 — Domínio de expediente e conflitos** com TDD.

### Comando de retomada

> Continuar a implementação da Sprint 1 a partir do documento `SPRINT1_IMPLEMENTATION_PLAN.md` e da seção `RETOMAR DAQUI`, sem repetir a auditoria ou o planejamento.

