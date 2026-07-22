# Task 4 — Agenda e booking público

## Status

**DONE_WITH_CONCERNS.** A agenda interna foi concluída integralmente. O booking público valida expediente, data futura, duração do serviço candidato e sobreposição contra os inícios retornados pelo contrato público atual. A duração real dos agendamentos públicos já existentes permanece bloqueada pelo contrato de dados descrito em **Limitação não atendida**.

## Escopo entregue

- Duração do serviço define o intervalo; `null`/ausência usa fallback legado de 60 minutos.
- Agenda interna consulta agendamentos `pending`/`confirmed` do artista no dia com `services(avg_duration_minutes)` e bloqueia sobreposição para tatuador e gestor.
- Cliente público e tatuador são bloqueados fora do expediente ou em dia fechado.
- Gestor recebe confirmação explícita para sair apenas do expediente; cancelar não salva e confirmar repete toda a validação antes do insert.
- Override do gestor não ignora conflito nem data passada.
- Datas passadas são bloqueadas antes do insert.
- O modal carrega clientes, tatuadores, serviços com preço/duração e as sete linhas de expediente, exibindo erro específico por origem.
- A agenda ignora respostas atrasadas de uma data anterior por identificador monotônico de requisição.
- O booking público recalcula horários ao trocar serviço usando dependências primitivas e mantém sua proteção preexistente contra resposta assíncrona obsoleta.
- Nenhuma migration, RPC, policy/RLS, rota, auth, branding ou dependência foi alterada.

## Arquitetura e domínio compartilhado

- `src/lib/scheduling-domain.ts` concentra fallback de duração, conversão de data local e detecção de conflito, reutilizando `intervalsOverlap`, `timeToMinutes` e `isWithinWorkingHours` existentes.
- `src/lib/working-hours.ts` localiza o expediente da data sem duplicar regra nos services.
- `agenda.service.ts` consulta conflito atual imediatamente antes do insert; a UI fornece papel já carregado, duração do serviço selecionado e expediente carregado.
- `booking.service.ts` preserva o RPC público existente, aplica o domínio compartilhado e valida novamente entidade/duração no limite de persistência.
- `BookingPage.tsx` precisou de alteração mínima, embora não aparecesse na lista inicial de arquivos, para encaminhar a duração do serviço selecionado ao cálculo de disponibilidade pública.

## TDD — RED

### Booking público

Comando:

`npm.cmd run test -- src/services/booking.service.test.ts src/services/booking.flow.test.ts`

Resultado RED observado: **3 falhas esperadas, 13 aprovações**.

- `buildHourlySlots` ainda oferecia `11:00` para serviço de 120 minutos em expediente até `12:00`.
- criação com serviço de 120 minutos resolvia apesar da sobreposição.
- disponibilidade ainda oferecia `10:00` quando o candidato de 120 minutos sobrepunha início ocupado às `11:00`.

Os testes adicionais também cobrem cliente fora do expediente, fallback legado de 60 minutos e data passada.

### Agenda interna e React

Comando:

`npm.cmd run test -- src/services/agenda.service.test.ts src/pages/agenda/NewAppointmentModal.test.tsx src/pages/agenda/AgendaPage.test.tsx`

Resultado RED observado: **15 falhas, 1 aprovação**.

- service não carregava expediente e salvava tatuador/gestor fora dele, conflito e data passada.
- página deixava resposta antiga substituir a data atual.
- modal não diferenciava erros das quatro fontes e gerava rejeições não tratadas.
- a primeira execução revelou também um seletor de teste escrito com mojibake; ele foi corrigido para `/descri/i` antes da implementação. Os testes permaneceram escritos antes do código de produção.

## TDD — GREEN

- Focado principal: 5 arquivos, **32/32 testes**.
- Focado após integração do domínio: 7 arquivos, **43/43 testes**.
- Verificação final após auto-revisão: 3 arquivos, **20/20 testes**.
- `npm.cmd run typecheck`: exit 0 na execução final.
- Suíte completa: **30 arquivos, 153/153 testes**, exit 0, duração 92,15 s.
- `git diff --check`: exit 0; apenas avisos de normalização LF/CRLF do Git no Windows.

## Arquivos

Criados:

- `src/services/agenda.service.test.ts`
- `src/pages/agenda/NewAppointmentModal.test.tsx`
- `src/pages/agenda/AgendaPage.test.tsx`
- `.superpowers/sdd/task-4-report.md`

Modificados:

- `src/lib/scheduling-domain.ts`
- `src/lib/working-hours.ts`
- `src/services/agenda.service.ts`
- `src/pages/agenda/NewAppointmentModal.tsx`
- `src/pages/agenda/AgendaPage.tsx`
- `src/services/booking.service.ts`
- `src/services/booking.service.test.ts`
- `src/services/booking.flow.test.ts`
- `src/pages/public/BookingPage.tsx`

## Auto-revisão

- Conferido que conflito é avaliado antes do override de expediente e reavaliado após confirmação.
- Conferido que `pending` e `confirmed` bloqueiam; cancelados/concluídos não entram na consulta interna.
- Conferido que fallback de 60 ocorre apenas para `null`/`undefined`, não substitui duração válida.
- Conferido que papel vem de `useDashboardAccess` e é passado como primitivo; nenhuma regra de acesso/auth foi modificada.
- Conferido uso de setState funcional onde depende do valor anterior e dependências primitivas nos effects.
- Conferido que respostas obsoletas não alteram lista, erro nem loading da agenda atual.
- Conferido que arquivos não rastreados das Tasks 1–3 e o brief da Task 4 não pertencem ao commit.

## Limitação não atendida — evidência do contrato público

O requisito de usar a duração real de **agendamentos existentes** não pode ser concluído no booking anônimo sem mudança proibida de banco:

- `src/lib/database.sql`, função `get_booked_appointment_times` (aprox. linhas 391–418), retorna somente `booked_time`.
- As policies de `appointments` (aprox. linhas 881–936) permitem insert público, mas o select pertence ao proprietário/gestor ou tatuador autenticado.
- Portanto, o cliente anônimo não consegue ler `appointments.services.avg_duration_minutes`.

Implementação conservadora dentro do contrato atual: cada início retornado pelo RPC ocupa 60 minutos, enquanto a duração real do serviço **candidato** é respeitada. Isso bloqueia início igual e sobreposições do candidato, mas pode liberar cedo demais o período posterior a um agendamento existente com mais de 60 minutos. A correção completa exige ampliar o RPC público para retornar duração/intervalo ocupado ou criar uma operação transacional equivalente, mudanças explicitamente proibidas nesta Task.

## Limitação de corrida simultânea

A validação client/service reduz conflitos e é repetida antes do insert, mas duas solicitações simultâneas ainda podem validar o mesmo intervalo antes de qualquer insert. A proteção transacional/constraint de intervalo fica para Sprint futura, conforme limitação aprovada no brief.
