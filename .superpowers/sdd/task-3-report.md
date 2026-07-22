# Task 3 — Domínio e módulo de Serviços

## Escopo entregue

- Criado `src/lib/service-domain.ts` com `ServiceDraftInput` e `validateServiceInput`.
- Duração exige número finito, inteiro e mínimo de 30 minutos.
- Preço inicial continua opcional (`null` quando vazio) e, quando informado, precisa ser finito e não negativo.
- Removida a categoria da UI, tipos manuais, queries, ordenação e payloads de Serviços, Onboarding e do seletor de serviços de Booking.
- A coluna `services.category` foi preservada em `src/lib/database.sql` e `src/types/database.types.ts`; não houve migration, mudança de RLS, auth, rotas, branding ou dependências.
- A listagem de serviços agora usa verificação explícita contra `null`, portanto mostra `R$ 0,00` para preço zero.

## Arquivos

Criados:

- `src/lib/service-domain.ts`
- `src/lib/service-domain.test.ts`
- `src/services/services.service.test.ts`
- `src/pages/services/ServiceModal.test.tsx`
- `src/pages/services/ServicesPage.test.tsx`

Modificados:

- `src/services/services.service.ts`
- `src/pages/services/ServiceModal.tsx`
- `src/pages/services/ServicesPage.tsx`
- `src/services/onboarding.service.ts`
- `src/pages/onboarding/OnboardingPage.tsx`
- `src/services/booking.service.ts` (remoção do select/tipo manual residual)
- Fixtures de testes de onboarding, para acompanhar os tipos manuais sem categoria.

## TDD — evidência RED/GREEN

RED observado antes da implementação:

1. `ServiceModal.test.tsx`: falhou porque o documento ainda continha o rótulo `Categoria`.
2. `services.service.test.ts`: a primeira comparação foi ajustada porque aceitava uma chave `undefined`; a asserção literal de propriedades falhou, encontrando `category` no payload de insert.
3. `service-domain.test.ts`: após expor o contrato mínimo, falhou para durações `29`, `30.5`, `NaN`, `Infinity` e preço negativo, pois a validação retornava string vazia.
4. `ServicesPage.test.tsx`: falhou encontrando `Inicial: -` para `starting_price: 0` e ainda mostrava a badge de categoria no DOM.

GREEN focado após a implementação:

- `npm.cmd run test -- src/lib/service-domain.test.ts` — 7/7.
- `npm.cmd run test -- src/services/services.service.test.ts` — 1/1.
- `npm.cmd run test -- src/pages/services/ServiceModal.test.tsx` — 1/1.
- `npm.cmd run test -- src/pages/services/ServicesPage.test.tsx` — 1/1.
- Na auto-revisão, `onboarding.service.test.ts` expôs uma referência residual no cálculo de progresso; a causa foi a remoção do helper local enquanto `getOnboardingProgress` ainda o chamava. O helper foi recomposto como adaptador do domínio compartilhado e o teste voltou a passar (21/21).

## Verificação final

- `npm.cmd run typecheck` — exit 0.
- `npm.cmd run test` — 27 arquivos, 122 testes aprovados na execução fresca final (83,82 s).
- `rg -n '\\bcategory\\b' src` — somente `src/types/database.types.ts` e `src/lib/database.sql`.
- `git diff --check` — sem erros de whitespace.

## Auto-revisão

- Confirmei que preço `0` não usa mais uma condição de truthiness.
- Confirmei que o modal valida o mesmo contrato do domínio antes de chamar `onSave`; o estado permanece local ao formulário, sem estado derivado adicional.
- Confirmei que `category` não recebe valor padrão e não é enviado por nenhum payload da aplicação.
- Mantive descrição opcional e a alternância de status ativo/inativo intactas.

## Observação

Uma execução conjunta de vários arquivos focados encontrou uma falha transitória do sandbox/esbuild ao carregar `vitest.config.ts`. As execuções focadas individuais seguintes, o typecheck e a suíte completa foram concluídos normalmente.
