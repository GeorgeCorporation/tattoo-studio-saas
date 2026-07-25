# SPRINT 1 — Relatório de Implementação

Data: 2026-07-25  
Branch: `codex/sprint1-stabilization`  
Base: `d81c1ac`  
Último commit de implementação: `cc9cca9`

## Status geral

**Sprint 1 não está formalmente concluída.**

Todo o escopo de aplicação permitido foi implementado, revisado e verificado. Há um requisito de aceite ainda bloqueado: o booking público não consegue considerar a duração real de agendamentos existentes sem alterar RPC/RLS, mudanças explicitamente proibidas nesta Sprint.

Também permanece a limitação aprovada de corrida simultânea entre dois pedidos de booking; resolução exige proteção transacional de banco e fica para Sprint futura.

## Status por bloco

| Bloco | Status | Resultado |
| --- | --- | --- |
| 1 — Onboarding e Configurações | Concluído | Domínio compartilhado de expediente, handlers corrigidos, validação e persistência dos sete dias. |
| 2 — Serviços e Agenda | Parcial bloqueado | Serviços concluídos. Agenda interna concluída. Booking público aplica regras permitidas, mas não recebe duração real dos existentes. |
| 3 — Financeiro | Concluído | Seções independentes, retry por seção, logs seguros, deduplicação, competência por `paid_at`, proteção contra respostas antigas. |
| 4 — Qualidade | Concluído | Erros ESLint corrigidos; testes, TypeScript, lint, build e revisão final executados. |

## Concluído

### Onboarding e Configurações

- Corrigida perda de `open_time` e `close_time` nos handlers.
- Criados helpers puros de expediente e agenda.
- Validação exige abertura anterior ao fechamento.
- Dia fechado limpa horários.
- Onboarding e Configurações usam mesma regra.
- Persistência e releitura de sete horários cobertas por teste.

### Serviços

- Removida `category` da interface, tipos manuais, selects e payloads da aplicação.
- Coluna `services.category` e tipos gerados foram preservados.
- Duração informada exige inteiro finito >= 30 minutos.
- Preço é opcional, não negativo quando informado e preserva `0`.
- Validações ocorrem na UI e antes de qualquer persistência.

### Agenda

- Duração real do serviço usada na agenda interna; legado sem duração usa 60 minutos.
- Cliente público e tatuador bloqueados fora do expediente/dia fechado.
- Gestor pode agendar fora do expediente somente após confirmação explícita.
- Conflitos e datas passadas bloqueiam todos os papéis.
- Erros de clientes, artistas, serviços e horários são específicos.
- Corrigidas respostas obsoletas por troca de data e reabertura do modal com opções antigas.

### Financeiro

- Tela não é mais tudo-ou-nada: histórico, resumo, comissões e manager carregam separadamente.
- Retry recarrega somente seção afetada.
- Erros registram seção, status/código disponível, mês, ano e `studioId`, sem PII.
- Pagamentos/regras são compartilhados no mesmo ciclo para evitar leituras duplicadas.
- Totais mensais usam `payments.paid_at` com política UTC única.
- Regras históricas são escolhidas por `starts_at` do período.
- Pagamento/regra salva mantém sucesso quando refresh falha e apresenta aviso específico.
- Troca de mês/estúdio invalida dados e respostas antigas antes da nova carga.

### Qualidade

- Corrigidos cinco erros ESLint baseline e um erro novo da Agenda.
- Corrigida expiração de convite mantido aberto: revalidação ocorre antes de autenticar/aceitar, sem `Date.now()` no render.
- Revisões por tarefa e revisão ampla final executadas.

## Arquivos modificados

### Domínio e hooks

- `src/lib/working-hours.ts`
- `src/lib/scheduling-domain.ts`
- `src/lib/service-domain.ts`
- `src/lib/finance-domain.ts`
- `src/hooks/useFinancialDashboard.ts`

### Onboarding, Configurações e Serviços

- `src/pages/onboarding/OnboardingPage.tsx`
- `src/pages/dashboard/Settings.tsx`
- `src/services/onboarding.service.ts`
- `src/pages/services/ServiceModal.tsx`
- `src/pages/services/ServicesPage.tsx`
- `src/services/services.service.ts`

### Agenda e booking

- `src/pages/agenda/AgendaPage.tsx`
- `src/pages/agenda/NewAppointmentModal.tsx`
- `src/services/agenda.service.ts`
- `src/pages/public/BookingPage.tsx`
- `src/services/booking.service.ts`

### Financeiro e lint

- `src/pages/financial/FinancialPage.tsx`
- `src/pages/financial/PaymentModal.tsx`
- `src/pages/financial/CommissionRuleModal.tsx`
- `src/services/financial.service.ts`
- `src/hooks/useArtist.ts`
- `src/pages/artists/ArtistModal.tsx`
- `src/pages/public/ArtistActivationPage.tsx`
- `src/services/artists.service.ts`

Foram criados/atualizados testes de domínio, services, hooks e componentes correspondentes. A lista completa de arquivos está no diff `d81c1ac..cc9cca9`.

## Testes e verificações finais

Executados após o último commit de correção:

| Comando | Resultado |
| --- | --- |
| `npm.cmd run test` | 34 arquivos, 178 testes aprovados |
| `npm.cmd run typecheck` | aprovado |
| `npm.cmd run lint` | 0 erros, 0 warnings |
| `npm.cmd run build` | aprovado |
| `git diff --check` | aprovado |

Observação: build informa bundle principal de aproximadamente 778 kB após minificação. É aviso de performance, não falha; code splitting ficou fora do escopo aprovado.

## Pendências

### Bloqueio de aceite — booking público

O RPC `get_booked_appointment_times` retorna somente `booked_time`. RLS anônimo permite inserir agendamento, mas não ler `appointments`/serviço existente. Logo, booking público não consegue descobrir duração real de agendamentos existentes.

Implementação atual usa fallback conservador de 60 minutos por horário retornado. Um agendamento existente com mais de 60 minutos pode liberar cedo demais o período posterior.

Correção necessária em Sprint futura, após aprovação:

1. Alterar RPC público para retornar intervalo ocupado/duração; ou
2. Criar operação de disponibilidade transacional equivalente; e
3. Revisar RLS e testes públicos sem expor dados pessoais.

### Limitações conhecidas aprovadas

- Dois pedidos simultâneos ainda podem passar por validação antes de inserção. Solução exige constraint/RPC transacional.
- `capValue` histórico pode divergir se regra antiga foi inativada ou alterada no meio do mês; totais do ledger continuam corretos.

## Banco de dados

- Nenhuma migration criada.
- Nenhuma migration destrutiva executada.
- Nenhuma coluna removida.
- `services.category` preservada no banco.
- Nenhuma alteração de RLS, autenticação, rotas, branding ou dependências.

## Commits da Sprint

`ff33836`, `4740eb4`, `d435a5c`, `4eab9a3`, `c0fc07a`, `dba8c32`, `7643d24`, `44cffe5`, `893fb68`, `99fbd0a`, `849d30c`, `7cd4af5`, `d239e7a`, `6044247`, `cc9cca9`.

## Decisão de encerramento

Não fazer merge/deploy como Sprint 1 totalmente aceita enquanto requisito de duração real no booking público estiver bloqueado. O restante pode ser homologado em branch isolada; a decisão de alterar RPC/RLS deve ser aprovada separadamente.
