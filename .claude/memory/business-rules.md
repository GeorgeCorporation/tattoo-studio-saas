---
name: business-rules
description: Regras de negócio do domínio — agendamento, financeiro, booking, onboarding
metadata:
  type: project
---

# Business Rules

## Visão Geral

Regras de negócio implementadas em `src/lib/` (domínio puro) e `src/services/` (integração). Lógica testável isoladamente em `appointment-domain.ts` e `finance-domain.ts`.

## Agendamento (`appointment-domain.ts`)

### Transições de Status

```
pending → confirmed → completed
pending → cancelled
confirmed → cancelled
```

Status válidos: pending, confirmed, cancelled, completed.

### Regras

- Apenas transições unidirecionais permitidas
- Appointment deve existir e ter status válido
- `client_source`: artist_client ou studio_referral

### Concorrência

- Partial unique index: `appointments_active_slot_unique_idx` em (studio_id, artist_id, date, time) WHERE status IN ('pending', 'confirmed')
- Booking: valida dupla (consulta + insert) com `BookingAvailabilityError`

### Validações de INSERT público

- Status obrigatoriamente 'pending'
- Date > hoje
- Artista deve existir e estar ativo
- Serviço deve existir e estar ativo

## Financeiro (`finance-domain.ts`)

### Comissão de Artistas

- Regra define: percentage (obrigatório), monthly cap (opcional)
- Cálculo: `base_amount * (percentage / 100)`
- Se `cap_enabled` e `monthly_cap > 0`: `commission_amount = min(calculated, monthly_cap - cap_consumed)`
- `cap_applied` = true se comissão foi limitada pelo cap

### Pagamentos

- Tipos: signal (sinal), final, extra
- Métodos: pix, cash (dinheiro), card
- `signal_paid` em appointments: valor do sinal
- `total_price` em appointments: valor total

## Booking (`booking.service.ts`)

### Fluxo de 3 Etapas

1. Selecionar tatuador, serviço, data e horário
   - `getServicesByStudio(studioId)`
   - `getWorkingHourByDate(studioId, date)`
   - `getBookedTimes(studioId, artistId, date)` (RPC)
   - `getAvailableTimeSlots()` (calcula slots de 1h)
2. Dados do cliente + descrição + fotos (max 3)
   - `createClient({name, phone, email, instagram})`
   - `validateBookingEntities()` (artista + serviço ativos)
   - `createAppointment(data)` com verificação de conflito
   - `uploadReferencePhotos(studioId, appointmentId, files)`
3. Confirmação com link WhatsApp

## Onboarding (`onboarding.service.ts`)

### 5 Etapas (validadas sequencialmente)

1. Identidade → nome do estúdio, slug, descrição
2. Contato → email, WhatsApp, Instagram, website, endereço, cidade, estado
3. Funcionamento → horários (7 dias, toggle aberto/fechado)
4. Equipe e Serviços → tatuadores + serviços iniciais
5. Revisão → confirma dados

### No Submit

1. Cria/atualiza studios
2. Sincroniza working_hours (limpa e recria)
3. Upload da logo
4. Cria/atualiza tatuadores + fotos
5. Cria/atualiza serviços

**Sem rollback transacional** — se upload de logo falha após criar studio, estado fica inconsistente.

## Lembretes

- `reminders.service.ts` cria lembretes com status 'pending'
- Canal: apenas 'whatsapp'
- Status: pending → sent/failed/cancelled
- **Incompleto** — sem integração real com API WhatsApp

## Padrões Observados

- Domain logic em `src/lib/` testável isoladamente
- Validações duplicadas: app + banco (ex: slugs, status transitions)
- RPC functions para operações que exigem atomicidade
- Booking com verificação de concorrência (partial unique index)

## Recomendações

- Finalizar integração de lembretes com WhatsApp API
- Adicionar rollback transacional no onboarding
- Adicionar testes para `finance-domain.ts` (cálculo de comissão, cap)
- Centralizar validações de booking em domain layer
