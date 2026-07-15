# /planning

## Objetivo

Planejar uma nova tarefa ou sprint antes de implementar.

## Entrada

- Descrição do que precisa ser feito
- Contexto (bug, feature, refatoração)

## Processo

1. Explorar código relevante (entender estado atual)
2. Identificar arquivos que serão afetados
3. Identificar riscos e dependências
4. Estimar esforço e impacto
5. Documentar plano de implementação

## Saída Esperada

- Plano detalhado com:
  - Quais arquivos modificar
  - Ordem de implementação
  - Riscos identificados
  - Testes necessários
  - Critérios de aceitação

## Regras

- Plano não substitui implementação (é guia)
- Preferir reutilização de código existente
- Documentar trade-offs de design
- Incluir verificação final (`npm run check`)
