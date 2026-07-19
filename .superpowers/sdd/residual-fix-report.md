# Relatório das correções residuais

Base verificada: `f778b7d`.

## Diagnóstico

1. `PrivateRoute` fornecia `PrivateRouteOutletContext`, mas o `Outlet` interno de `DashboardLayout` não reencaminhava esse contexto. As quatro páginas chamavam `useAccess` novamente, criando uma segunda consulta por árvore autenticada.
2. `getOnboardingProgress` usava `isBookingReady` apenas quando `activateBooking` era verdadeiro. Assim, uma duração inválida era ignorada por `canFinish` quando a agenda pública estava desligada, embora `validateOnboardingStep` rejeitasse o mesmo estado.

## Ciclos TDD

### RED

Comando:

```powershell
npm.cmd run test -- src/components/layout/DashboardLayout.test.tsx src/services/onboarding.service.test.ts
```

Resultado esperado e observado antes da implementação: exit code 1, com 3 falhas e 19 testes aprovados.

- A árvore com `ClientsPage` chamou `useAccess` 2 vezes, em vez de 1.
- A árvore com `ArtistPanelPage` chamou `useAccess` 2 vezes, em vez de 1.
- `getOnboardingProgress(completeSnapshot(30.5), false)` retornou `canFinish: true`, em vez de `false`.

### GREEN

Implementação mínima:

- `DashboardLayout` reencaminha o mesmo `PrivateRouteOutletContext` ao seu `Outlet`.
- `useDashboardAccess` fornece consumo pequeno e tipado desse contexto.
- `ArtistPanelPage`, `ClientsPage`, `ClientProfile` e `FinancialPage` usam o acesso já carregado.
- `hasInvalidNamedService` é calculado separadamente de `isBookingReady`; serviço nomeado inválido bloqueia `canFinish` e mantém `nextStep` na etapa 4 mesmo com agenda desligada.
- O caso sem artistas/serviços e agenda desligada continua com `canFinish: true` e `nextStep: 5`.

Comando final focado:

```powershell
npm.cmd run test -- src/components/layout/DashboardLayout.test.tsx src/services/onboarding.service.test.ts
```

Resultado: exit code 0; 2 arquivos e 23/23 testes aprovados.

## Verificação final

```powershell
npm.cmd run test
```

Resultado: exit code 0; 20 arquivos e 93/93 testes aprovados.

```powershell
npm.cmd run typecheck
```

Resultado: exit code 0; `tsc --noEmit` sem erros.

```powershell
npm.cmd exec -- eslint src/components/layout/DashboardLayout.test.tsx src/components/layout/DashboardLayout.tsx src/hooks/useDashboardAccess.ts src/pages/artist/ArtistPanelPage.tsx src/pages/clients/ClientsPage.tsx src/pages/clients/ClientProfile.tsx src/pages/financial/FinancialPage.tsx src/services/onboarding.service.test.ts src/services/onboarding.service.ts
```

Resultado: exit code 0; nenhuma ocorrência nos arquivos alterados. Os cinco erros globais preexistentes ficaram fora do escopo e não foram modificados.

```powershell
git diff --check
```

Resultado: exit code 0; nenhum erro de whitespace. O Git exibiu somente avisos locais de futura conversão LF para CRLF no Windows.
