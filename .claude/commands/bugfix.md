# /bugfix

## Objetivo

Corrigir um bug existente sem introduzir regressões.

## Entrada

- Descrição do bug (comportamento esperado vs real)
- Passos para reproduzir
- Evidências (log de erro, screenshot)

## Processo

1. Reproduzir o bug localmente (`npm run dev`)
2. Escrever teste que falha (reproduz o bug)
3. Identificar causa raiz
4. Implementar correção
5. Verificar que teste passa + testes existentes não quebram
6. Rodar `npm run check`

## Saída Esperada

- Correção do bug
- Teste de regressão (previne retorno)
- `npm run check` passando

## Regras

- 1 bug fix = 1 commit (não misturar com features)
- Teste de regressão obrigatório
- Verificar se o bug existe em outras partes similares
