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

## Barreira defensiva de persistência

A re-revisão identificou que a UI bloqueava preço negativo, mas chamadas diretas aos limites de persistência ainda podiam enviá-lo ao Supabase.

- RED: `services.service.test.ts` provou que `createService` resolvia para preço negativo; `onboarding.flow.test.ts` provou que `createStudioOnboarding` persistia e resolvia com o mesmo input.
- GREEN: `createService` e `updateService` executam `validateServiceInput` antes de acessar `supabase.from`.
- GREEN: `createStudioOnboarding` valida os serviços iniciais antes de mock, snapshot ou upsert; `syncInitialServices` repete a validação antes de buscar e inserir/atualizar serviços. A defesa de onboarding preserva o comportamento legado de duração ausente e usa o domínio para validar o preço.
- O teste de serviços verifica que create e update rejeitam e que `supabase.from` não é chamado; o teste de fluxo verifica que não ocorre insert/update no onboarding; o teste da UI também afirma que `createStudioOnboarding` não foi chamado.
- `npm.cmd run test -- src/services/services.service.test.ts` — 2/2.
- `npm.cmd run test -- src/services/onboarding.flow.test.ts` — 4/4.
- `npm.cmd run test -- src/pages/onboarding/OnboardingPage.test.tsx` — 16/16.
- `npm.cmd run test -- src/lib/service-domain.test.ts src/pages/services/ServiceModal.test.tsx src/pages/services/ServicesPage.test.tsx` — 9/9.
- `npm.cmd run test -- src/services/onboarding.service.test.ts` — 21/21.
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

## Correção pós-revisão

A revisão identificou que `validationData.firstServices` encaminhava somente nome e duração, então a validação de onboarding não recebia `starting_price` e permitia avançar com preço negativo.

- RED: adicionado o teste `rejeita preço inicial negativo na validação do onboarding`; ele falhou ao não encontrar a mensagem de preço válido.
- GREEN: `OnboardingPage.tsx` passou `starting_price: service.startingPrice === "" ? null : Number(service.startingPrice)` exclusivamente para `validationData`. O payload final aprovado de `createStudioOnboarding` não foi alterado.
- `npm.cmd run test -- src/pages/onboarding/OnboardingPage.test.tsx` — 16/16.
- `npm.cmd run test -- src/services/onboarding.service.test.ts src/services/onboarding.flow.test.ts` — 24/24.
- `npm.cmd run test -- src/lib/service-domain.test.ts src/services/services.service.test.ts src/pages/services/ServiceModal.test.tsx src/pages/services/ServicesPage.test.tsx` — 10/10.
- `npm.cmd run typecheck` — exit 0.
