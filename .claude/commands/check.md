# /check

## Objetivo

Rodar a pipeline completa de verificação.

## Entrada

Nenhuma (roda no projeto atual).

## Processo

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Saída Esperada

- Todas as 4 etapas passam (typecheck, lint, test, build)
- Se alguma falhar, reportar erro e parar

## Regras

- Rodar antes de cada commit
- Rodar antes de cada PR
- Se falhar, corrigir antes de prosseguir
