# /audit

## Objetivo

Auditar uma área específica do projeto em busca de problemas estruturais, de segurança ou performance.

## Entrada

- Área a auditar (ex: "auth", "storage", "tabela clients", "useArtist hook")

## Processo

1. Identificar todos os arquivos relevantes para a área
2. Revisar cada arquivo contra:
   - Segurança: RLS policies, exposição de dados, rate limit
   - Performance: queries sem índice, N+1 queries, sem paginação
   - Qualidade: código duplicado, arquivos grandes, barrel files vazios
   - Tipos: `any`, tipos faltando, tipo inconsistente
3. Compilar relatório com problemas, severidade e recomendações

## Saída Esperada

- Relatório de auditoria com:
  - Problemas encontrados (categorizados por severidade)
  - Recomendações de correção
  - Prioridade de cada correção
  - Esforço estimado

## Regras

- Auditoria não modifica código
- Cada achado deve ter evidência (arquivo:linha)
- Recomendações devem ser acionáveis
