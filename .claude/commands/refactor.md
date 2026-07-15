# /refactor

## Objetivo

Refatorar código existente sem alterar comportamento externo.

## Entrada

- Alvo da refatoração (arquivo, função, módulo)
- Motivo (código duplicado, arquivo grande, padrão inconsistente)

## Processo

1. Verificar testes existentes para o alvo
2. Se não houver testes, criar testes cobrindo comportamento atual
3. Executar refatoração em etapas pequenas e verificáveis
4. Rodar `npm run typecheck` após cada etapa
5. Rodar `npm run test` para verificar regressões
6. Rodar `npm run check` ao final

## Saída Esperada

- Código refatorado (mais limpo, organizado, sem duplicação)
- Testes existentes ainda passam
- `npm run check` passando

## Regras

- 1 refatoração = 1 commit (não misturar com features)
- Não alterar comportamento externo da API/funções
- Preservar tipos TypeScript e exports
- Atualizar imports em todos os arquivos dependentes
