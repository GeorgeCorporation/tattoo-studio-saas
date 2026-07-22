# Task 1 — Domínio de expediente e conflitos

## Escopo entregue

- Criado `src/lib/working-hours.ts`, com helpers puros para atualizar um campo de horário e validar o expediente.
- Criado `src/lib/scheduling-domain.ts`, com helpers puros para conversão de horário, sobreposição de intervalos e validação de um agendamento dentro do expediente.
- Criados testes focados para os dois módulos, sem alterar consumidores, serviços, rotas, autenticação, RLS ou migrations.

## Compatibilidade de tipo confirmada antes da implementação

O tipo existente é `OnboardingWorkingHour`, exportado por `src/services/onboarding.service.ts`:

```ts
type OnboardingWorkingHour = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
};
```

Os helpers importam esse tipo somente como type import e preservam os horários no formato já usado pela aplicação (`HH:mm`, com compatibilidade de leitura para `HH:mm:ss` em `timeToMinutes`).

## TDD: RED → GREEN

### RED

Foram criados primeiro os testes de `working-hours` e `scheduling-domain` e executados antes de qualquer código de produção:

```text
npm.cmd run test -- src/lib/working-hours.test.ts src/lib/scheduling-domain.test.ts
```

Resultado esperado e observado: falha na resolução de `@/lib/working-hours` e `@/lib/scheduling-domain`, pois os módulos ainda não existiam. Os comportamentos cobertos no RED foram:

1. editar abertura preserva o novo valor;
2. editar fechamento preserva o novo valor;
3. fechar o dia limpa abertura e fechamento;
4. `09:00 + 120` conflita com `10:00 + 60`;
5. um intervalo que termina após o fechamento é inválido.

Também foram especificados os casos de expediente válido, intervalo adjacente sem conflito, conversão de horário e intervalo inteiramente dentro do expediente.

### GREEN

Foram adicionadas as implementações mínimas, puras e sem dependências adicionais. A mesma execução focada passou:

```text
Test Files  2 passed (2)
Tests       10 passed (10)
```

## Regras de domínio implementadas

- `updateWorkingHourField` retorna uma cópia imutável, preserva as alterações de abertura/fechamento e limpa ambos os horários ao definir `is_open` como `false`.
- `validateWorkingHours` retorna mensagem quando um dia aberto não tem horários ou quando abertura não é anterior ao fechamento; retorna string vazia para uma lista válida.
- `intervalsOverlap` trata intervalos adjacentes como não conflitantes.
- `isWithinWorkingHours` exige dia aberto, horários configurados, início igual ou posterior à abertura e fim igual ou anterior ao fechamento.

## Verificação

Executados após a implementação:

```text
npm.cmd run typecheck
Exit code: 0

npm.cmd run test
Test Files  22 passed (22)
Tests       105 passed (105)
Exit code: 0

git diff --check
Exit code: 0
```

## Auto-revisão

- Interfaces e nomes correspondem integralmente ao brief.
- O domínio não importa React, Supabase, APIs de navegador ou storage.
- Nenhum consumidor foi alterado nesta tarefa; a adoção pelos fluxos de onboarding, configurações e agenda fica para as tarefas subsequentes.
- Não foram encontrados erros de whitespace no diff.

## Observação

`task-1-brief.md` já estava não rastreado no worktree e foi preservado fora do commit. O relatório é o único artefato de planejamento adicionado pela tarefa.
