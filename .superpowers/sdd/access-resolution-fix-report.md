# Relatório da resolução única de acesso

Base: `12a657a`.

## Diagnóstico

O teste anterior substituía `getCurrentUserStudio`, ocultando a cadeia real `getCurrentUserStudio(user.id) -> getCurrentUserAccess(user.id)`. A inspeção confirmou essa resolução indireta em todos os oito consumidores autenticados listados no brief.

## TDD

### RED

O teste de integração mantém `getCurrentUserStudio` real, apenas instrumenta sua chamada, observa `getCurrentUserAccess` e aguarda as consultas de folha concluírem.

```powershell
npm.cmd run test -- src/components/layout/DashboardLayout.test.tsx
```

Resultado: exit code 1; 3 falhas e 1 teste aprovado.

- `ClientsPage`: `getCurrentUserStudio("user-1")` chamado 1 vez.
- `FinancialPage`: `getCurrentUserStudio("user-1")` chamado 1 vez.
- Dashboard/`useDashboard`: `getCurrentUserStudio("user-1")` chamado 1 vez.
- `ArtistPanelPage` já não repetia a resolução.

### GREEN

```powershell
npm.cmd run test -- src/components/layout/DashboardLayout.test.tsx
```

Resultado final: exit code 0; 1 arquivo e 4/4 testes aprovados. Cada árvore chama `useAccess` exatamente uma vez e não chama `getCurrentUserStudio` nem `getCurrentUserAccess` na folha.

## Implementação

- `useDashboard` deriva o `DashboardStudio` do `AccessContext` já carregado.
- `AgendaPage`, `ClientsPage`, `ServicesPage`, `ArtistsPage`, `GalleryPage`, `DeliveriesPage` e `FinancialPage` consultam dados diretamente com `access.studioId`.
- `useAuth` e `getCurrentUserStudio` foram removidos desses consumidores.
- `getCurrentUserStudio` permaneceu no serviço, preservando a API válida fora da árvore autenticada.
- Fluxos manager/artist, estados de loading/erro e contratos dos modais foram preservados.

Verificação estática:

```powershell
rg -n "getCurrentUserStudio|getCurrentUserAccess|useAuth\(" src/hooks/useDashboard.ts src/pages/agenda/AgendaPage.tsx src/pages/clients/ClientsPage.tsx src/pages/services/ServicesPage.tsx src/pages/artists/ArtistsPage.tsx src/pages/gallery/GalleryPage.tsx src/pages/deliveries/DeliveriesPage.tsx src/pages/financial/FinancialPage.tsx
```

Resultado: nenhuma ocorrência.

## Verificação final

```powershell
npm.cmd run test
```

Resultado: exit code 0; 20 arquivos e 95/95 testes aprovados.

```powershell
npm.cmd run typecheck
```

Resultado: exit code 0; `tsc --noEmit` sem erros.

```powershell
npm.cmd exec -- eslint src/components/layout/DashboardLayout.test.tsx src/hooks/useDashboard.ts src/pages/agenda/AgendaPage.tsx src/pages/clients/ClientsPage.tsx src/pages/services/ServicesPage.tsx src/pages/artists/ArtistsPage.tsx src/pages/gallery/GalleryPage.tsx src/pages/deliveries/DeliveriesPage.tsx src/pages/financial/FinancialPage.tsx
```

Resultado: exit code 0; nenhuma ocorrência. Os cinco erros globais preexistentes não foram alterados.

```powershell
npm.cmd run build
```

Resultado: exit code 0; 1.694 módulos transformados e build Vite concluído. Houve apenas o aviso não bloqueante de chunk acima de 500 kB.

```powershell
git diff --check
```

Resultado: exit code 0; nenhum erro de whitespace. O Git exibiu somente avisos locais de futura conversão LF para CRLF no Windows.
