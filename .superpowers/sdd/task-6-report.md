# Task 6 — ESLint e limpeza limitada

## Escopo entregue

- Removidas as capturas/atribuições mortas nos arquivos baseline autorizados.
- `ArtistActivationPage` captura o horário de abertura uma vez, por inicializador lazy de estado, e não chama `Date.now()` na renderização.
- `AgendaPage` atualiza o ref de data em `useEffect`, sem mutação de ref durante render.
- Preservada a exclusão de `accessEmail` do payload de atualização do artista; a gestão do convite continua no fluxo próprio.

## Verificação

- ESLint focado: passou sem diagnósticos.
- ESLint global: 0 erros; permanece somente o warning pré-existente em `src/hooks/useFinancialDashboard.ts:106`.
- Typecheck: passou (`tsc --noEmit`).
- Teste focado Agenda: 2/2 passou.
- Teste focado ArtistModal: 2/2 passou.
- `git diff --check`: passou.

## Observações

- Não houve mudança funcional deliberada nas remoções de código morto. Os testes existentes de Agenda já cobrem a proteção contra uma atualização de status que termina após troca de data.
- Uma execução com os dois arquivos de teste em um único comando exibiu uma falha intermitente do esbuild/Vitest de leitura de diretório/configuração, embora tenha saído com código 0; as execuções individuais dos dois testes passaram.
