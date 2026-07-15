# /cleanup

## Objetivo

Limpar o projeto: barrel files vazios, imports não usados, código morto.

## Entrada

Nenhuma (age no projeto todo).

## Processo

1. Identificar barrel files vazios (index.ts sem exports)
2. Identificar imports não usados (ESLint ou manual)
3. Identificar código comentado
4. Identificar `console.log` esquecidos
5. Remover ou corrigir cada item

## Saída Esperada

- Barrel files vazios removidos
- Imports não usados removidos
- Código comentado removido
- `console.log` removidos (substituir por logger se necessário)

## Alvos Conhecidos

- `src/components/ui/index.ts` — vazio
- `src/pages/index.ts` — vazio
- `src/styles/index.ts` — vazio
- `src/index.ts` — vazio

## Regras

- Não remover exports que parecem não usados mas fazem parte de API pública
- Verificar se barrel file vazio é placeholder intencional
- `console.log` só remover se não for parte de debug intencional
