# /feature

## Objetivo

Criar uma nova feature seguindo o padrão de camadas do projeto.

## Entrada

- Nome da feature (ex: "lista-negra-clientes")
- Descrição da feature (requisitos)

## Processo

1. Analisar requisitos
2. Identificar quais camadas serão alteradas (page, hook, service, lib)
3. Buscar padrões existentes no código para reutilizar
4. Implementar seguindo ordem: domain logic (lib/) → service → hook → page
5. Escrever testes na mesma ordem
6. Rodar `npm run check` ao final

## Saída Esperada

- Implementação completa seguindo camadas
- Testes (mínimo: domain logic)
- `npm run check` passando

## Regras

- Não pular camadas: Page → Hook → Service → Supabase
- Cores: usar variáveis Tailwind, nunca hardcoded
- Erro: usar `getFriendlyErrorMessage` de `@/lib/errors`
- Testes: domínio puro primeiro, depois integração
