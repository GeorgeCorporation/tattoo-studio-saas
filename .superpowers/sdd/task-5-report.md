# Task 5 — Financeiro resiliente

## Escopo e base

- Worktree: `tattoo-studio-saas-sprint1`
- Branch: `codex/sprint1-stabilization`
- Base confirmada antes das alterações: `99fbd0aed29bf7b596bcda1bb6d57f86ab010dbd`
- Arquitetura preservada: Page → Hook/Service → Supabase
- Nenhuma alteração em auth, RLS, banco, rotas, branding ou dependências.

## Reprodução e investigação

Foi tentado reutilizar uma sessão autenticada de forma segura pelo navegador disponível no ambiente. A ferramenta respondeu `No browser is available`; portanto não havia navegador nem sessão autenticada reutilizável. Não foram inspecionados cookies, storage ou credenciais e não foi atribuída falha a uma request/query de produção não observada.

A investigação estática encontrou dois mecanismos verificáveis no código-base:

1. `FinancialPage` aguardava todas as leituras em um único `Promise.all`; qualquer rejeição impedia a aplicação dos resultados das demais seções e caía em um erro global.
2. No mesmo ciclo, pagamentos eram lidos por `getPaymentsByMonth`, `getMonthSummary` e novamente por `getArtistCommissionSummaries`; regras eram lidas diretamente pela página e novamente por `getArtistCommissionSummaries`.

Hipótese confirmada pelos REDs: compartilhar as promises/snapshots do ciclo e manter estados independentes permite preservar seções bem-sucedidas, retry local e deduplicação.

## TDD — RED

Comando:

```text
npm.cmd run test -- src/lib/finance-domain.test.ts src/services/financial.service.test.ts src/hooks/useFinancialDashboard.test.tsx
```

Evidência inicial:

- domínio: 2 falhas esperadas (`buildMonthSummary` e `buildArtistCommissionSummaries` ausentes);
- serviço: 2 falhas esperadas (comissão não derivada do snapshot e range ainda usando `created_at`);
- hook/modal: após adicionar apenas a interface mínima do hook, 8/8 testes falharam pelos comportamentos ausentes:
  - isolamento histórico/resumo;
  - isolamento regras/histórico;
  - retry exclusivo do resumo;
  - log técnico seguro;
  - deduplicação de pagamentos/regras;
  - espera do refresh nos modais;
  - aviso específico após gravação com refresh falho.

## Implementação

- `finance-domain` passou a derivar resumo e comissões por artista de snapshots, filtrando a competência por `payments.paid_at`.
- `financial.service` passou a obter resumo a partir de uma única leitura mensal de pagamentos (com o ledger aninhado) e da contagem de cancelados, sem consulta separada de comissões por `created_at`.
- `useFinancialDashboard` mantém estado `{ data, loading, error }` por pagamentos, resumo, comissões e dados gerenciais.
- O carregamento inicial inicia pagamentos, cancelados, regras e artistas em paralelo e compartilha as mesmas promises entre consumidores.
- Cada retry atualiza somente sua seção; o retry do resumo reutiliza o snapshot de pagamentos já carregado.
- Logs recebem somente seção, código/status disponível, mês, ano e `studioId`; a instância original do erro não é enviada ao logger.
- `FinancialPage` preserva dados carregados e apresenta loading/erro/retry por seção.
- Modais aguardam o refresh antes de fechar. Se a gravação concluir e o refresh falhar, o modal mantém o sucesso da gravação, desabilita novo submit e mostra aviso específico.

## GREEN e verificação

GREEN focado:

```text
npm.cmd run test -- src/lib/finance-domain.test.ts src/services/financial.service.test.ts src/hooks/useFinancialDashboard.test.tsx
3 arquivos, 18 testes, todos passaram
```

Integração financeira:

```text
npm.cmd run test -- src/lib/finance-domain.test.ts src/services/financial.service.test.ts src/hooks/useFinancialDashboard.test.tsx src/components/layout/DashboardLayout.test.tsx
4 arquivos, 22 testes, todos passaram
```

Typecheck:

```text
npm.cmd run typecheck
exit 0
```

Suíte completa (executada uma vez):

```text
npm.cmd run test
32 arquivos, 168 testes, todos passaram
```

Diff check:

```text
git diff --check
exit 0
```

O lint global foi executado e encontrou seis erros preexistentes fora do escopo em `useArtist.ts`, `AgendaPage.tsx`, `ArtistModal.tsx`, `ArtistActivationPage.tsx` e `artists.service.ts`. Nenhum erro apontou para os arquivos financeiros alterados.

## Arquivos

Criados:

- `src/hooks/useFinancialDashboard.ts`
- `src/hooks/useFinancialDashboard.test.tsx`
- `src/services/financial.service.test.ts`
- `.superpowers/sdd/task-5-report.md`

Modificados:

- `src/pages/financial/FinancialPage.tsx`
- `src/pages/financial/PaymentModal.tsx`
- `src/pages/financial/CommissionRuleModal.tsx`
- `src/services/financial.service.ts`
- `src/lib/finance-domain.ts`
- `src/lib/finance-domain.test.ts`
- `src/components/layout/DashboardLayout.test.tsx` (mock atualizado para o novo contrato do serviço)

## Pendências e limites

- A request real que falhava em produção não pôde ser identificada sem uma sessão autenticada disponível; deliberadamente não foi inferida.
- Os seis erros do lint global permanecem fora do escopo desta tarefa.
