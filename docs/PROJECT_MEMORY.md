# Inkora — Memória Permanente do Projeto

> Fonte oficial de contexto técnico. Atualizar quando decisão arquitetural, regra de domínio ou limitação confirmada mudar.

## 1. Visão do Produto

- **Produto:** SaaS para operação de estúdios de tatuagem.
- **Público:** gestores de estúdio, tatuadores e clientes finais.
- **Conceito:** painel multiestúdio para operação, agenda, serviços, clientes, financeiro, galeria, entregas e página pública de booking.
- **Escopo atual:** SPA React/Vite com Supabase para Auth, PostgreSQL, RLS e Storage; publicação por Cloudflare.

## 2. Princípios do Projeto

- Preservar fluxo `Page → Hook → Service → Supabase`.
- Pages orquestram UI; não devem concentrar regra de negócio ou query de dados.
- Hooks concentram estado, concorrência, cache local e ciclos de carregamento quando necessários.
- Services são fronteira de acesso ao Supabase e de validação defensiva antes de persistir.
- Regras puras de domínio ficam em `src/lib`; não dependem de React, Supabase, browser ou storage.
- TypeScript `strict` obrigatório.
- RLS é barreira real de autorização; frontend nunca é controle de segurança suficiente.
- Segurança, isolamento por `studio_id` e privacidade vencem conveniência.
- Não duplicar regra: extrair helper compartilhado antes de reproduzir lógica em outro módulo.
- Mudanças de banco exigem migration incremental, auditada e reproduzível; nunca migration destrutiva sem aprovação explícita.

## 3. Arquitetura Atual

```text
Page
  ↓
Hook de estado/orquestração (quando necessário)
  ↓
Service
  ↓
Supabase JS
  ↓
PostgreSQL / RLS / Storage
```

| Camada | Responsabilidade |
| --- | --- |
| `src/pages` | UI, rotas, interação do usuário, feedback visual. |
| `src/hooks` | Estado reutilizável, concorrência, ciclos de dados e acesso. |
| `src/services` | Queries, comandos, DTOs e validação antes de persistir. |
| `src/lib` | Domínio puro, erros, logger, segurança, utilitários. |
| `src/types` | Tipos de banco e contratos locais. |
| `src/components` | Layout, guardas de rota e componentes compartilhados. |

### Observações arquiteturais

- Estado global é mínimo; acesso autenticado é propagado por `Outlet context`.
- Não existe query cache global. Cada page/hook gerencia seu ciclo de dados.
- `Settings.tsx` ainda acessa Supabase diretamente; tratar como exceção legada a remover em refactor futuro.
- `src/lib/rls-policies.sql` foi removido em 27/08/2026. Auditoria por diff provou que era subconjunto puro e desatualizado de `database.sql`: 35 policies contra 47, nenhum `grant`/`revoke` exclusivo, nenhuma função exclusiva. As 12 policies ausentes eram todas do papel de tatuador e do ledger financeiro. A única contribuição real dele — restringir cinco policies de leitura pública a `to anon, authenticated` em vez de deixá-las abertas a todos os papéis — foi portada para `database.sql` antes da remoção.
- `database.sql` é a fonte de verdade do repositório, mas **não descreve o banco de produção**. Verificação de 27/08/2026 contra o projeto `qpsykgrlplkspdadpmnp`, depois de restaurá-lo:
  - existe a migration `20260730143000` aplicada no remoto sem arquivo correspondente no repositório;
  - existe a tabela `artist_services` em produção, ausente de `database.sql`, das migrations e de todo o código do app;
  - três funções declaradas em `database.sql` não existem no banco: `current_user_can_view_client`, `current_user_can_view_delivery` e `current_user_is_artist_for_appointment`. São as funções que as policies do papel de tatuador usam, então essas policies provavelmente também nunca foram aplicadas;
  - os tipos gerados estavam 970 linhas atrás do schema real.
- Reconstruir o banco só pelas migrations continua impossível. Gerar a baseline exige `supabase db pull`, que precisa de Docker — não instalado nesta máquina.

## 4. Estrutura dos Módulos

| Módulo | Estado atual |
| --- | --- |
| Onboarding | Cria estúdio, horário, artistas e serviços iniciais; mantém draft local; valida antes de persistir. |
| Agenda | Agenda interna por data; usa expediente, duração, conflito e override explícito de gestor. |
| Clientes | Cadastro e listagem por estúdio; cliente público pode ser criado durante booking. |
| Serviços | Nome, descrição opcional, duração e preço inicial; categoria não é usada pela aplicação. |
| Financeiro | Histórico, resumo, comissões e regras carregados por seções com retry independente. |
| Configurações | Dados do estúdio, logo, expediente e senha; deve convergir para Service/Hook. |
| Booking Público | Carrega estúdio, artista, serviço e disponibilidade; cria cliente/agendamento pendente. |

## 5. Regras de Negócio

### Expediente e agenda

- `working_hours` é fonte de verdade para Onboarding, Configurações e Agenda.
- Dia aberto exige abertura anterior ao fechamento; dia fechado não mantém horários ativos.
- Cliente público e tatuador não agendam fora do expediente ou em dia fechado.
- Gestor pode agendar fora do expediente somente após confirmação explícita.
- Override de gestor nunca ignora conflito ou data passada.
- Conflitos consideram intervalo `início + duração`; registros legados sem duração usam 60 minutos.
- Status `pending` e `confirmed` bloqueiam conflito; cancelado/concluído não bloqueiam.
- Datas passadas são inválidas.

### Serviços

- Nome é obrigatório.
- Duração informada deve ser inteira, finita e >= 30 minutos.
- Preço é opcional; quando informado, deve ser finito e >= 0.
- `0` é preço válido e deve ser exibido/persistido como tal.
- `services.category` continua no banco apenas por compatibilidade; UI, payloads, selects e tipos manuais não usam esse campo.

### Financeiro

- Pagamentos usam `paid_at` como competência mensal de leitura.
- Falha de seção financeira não derruba seções saudáveis.
- Retry recarrega somente seção afetada.
- Logs financeiros não incluem PII; usam seção, status/código disponível, mês, ano e `studioId`.
- Pagamento/regra salvo permanece sucesso mesmo se refresh posterior falhar.

### Convites

- Convite de artista expira no backend e no frontend.
- Expiração deve ser revalidada antes de signup/signin/aceitação de sessão.

## 6. Decisões Técnicas

| Decisão | Motivo |
| --- | --- |
| `working-hours.ts` | Uma regra de expediente para Onboarding, Configurações e Agenda. |
| `scheduling-domain.ts` | Centralizar duração, datas, intervalo e conflito. |
| `service-domain.ts` | Mesma validação de serviço na UI e persistência. |
| `finance-domain.ts` | Agregação pura, competência UTC e resumo testável. |
| `useFinancialDashboard` | Isolar loading/error/retry por seção e evitar tela tudo-ou-nada. |
| `category` só no banco | Compatibilidade sem manter conceito morto na aplicação. |
| Fallback 60 min | Compatibilidade para registros legados sem duração. |
| Logger contextual seguro | Diagnóstico sem expor dados pessoais no Financeiro. |
| Tokens de requisição | Evitar resposta async antiga sobrescrever escopo/data atual. |

## 7. Limitações Conhecidas

- Booking público recebe do RPC apenas `booked_time`; não recebe duração real de agendamentos existentes.
- RLS anônimo não permite ler agendamentos/serviços existentes; por isso booking público usa fallback de 60 minutos por horário retornado.
- Dois bookings simultâneos podem validar mesmo intervalo antes de inserir; não há proteção transacional de intervalo.
- `capValue` histórico pode divergir se regra antiga foi inativada ou alterada durante mês; totais do ledger permanecem corretos.
- Draft de onboarding em `localStorage` não é escopado por usuário/estúdio.
- Timezone do estúdio não existe; datas usam combinação de browser, UTC e PostgreSQL.
- Banco remoto não é reconstruível apenas pelas migrations atuais.

## 8. Roadmap Arquitetural

Evoluções aprovadas para futura decisão/planejamento:

- Availability Engine público sem exposição de dados de agendamento.
- Booking Engine transacional com revalidação, lock/constraint de intervalo e criação atômica.
- Timezone IANA por estúdio.
- Fonte única schema + migrations + RLS e geração de tipos no CI.
- Query cache/invalidation compartilhado.
- Lazy loading de rotas e code splitting.
- Paginação/range para listas grandes.
- Observabilidade de produção com redaction de PII.
- Storage privado e signed URLs para entregas.
- Testes RLS por manager, artista, público e cross-tenant.
- Testes E2E para onboarding, booking, financeiro e convites.
- RPC transacional para pagamento + comissão.

## 9. Convenções do Projeto

- Não acessar Supabase diretamente em Pages novas.
- Não criar regra de domínio dentro de componente.
- Preferir helper puro testável em `src/lib`.
- Validar entrada na UI **e** no Service antes de persistir.
- Reusar tipos/DTOs explícitos; evitar casts amplos.
- Usar `Promise.all` somente para dados independentes; usar `Promise.allSettled` quando falha parcial é requisito.
- Tratar respostas async obsoletas em telas com troca de escopo/data.
- Não usar valor truthy para número opcional quando `0` é válido.
- Não registrar token, senha, JWT, segredo ou PII em logs.
- Teste de bug deve reproduzir falha antes da correção; preferir TDD.
- Rodar `typecheck`, `lint`, testes, build e `git diff --check` antes de integração.
- Não adicionar dependência, migration, alteração RLS, auth, rota ou branding sem escopo aprovado.

## 10. Histórico

- **Sprint 1:** estabilizou Onboarding, Configurações, Serviços, Agenda e Financeiro; introduziu domínios compartilhados, resiliência financeira e validações de agenda, elevando Inkora para MVP robusto. Aceite total de booking público permanece bloqueado pela limitação RPC + RLS documentada acima.

## 11. Verificação de Segurança contra Produção — 27/08/2026

Testes de comportamento real como usuário anônimo, usando a chave publicável que já vai no bundle do site. Só leitura e uma tentativa de escrita rejeitada; nada foi gravado nem baixado.

### Confirmado seguro

- Leitura anônima de `clients`, `appointments`, `payments`, `payment_commissions`, `artist_commission_rules`, `client_deliveries`, `client_delivery_photos`, `artist_access_invites` e `artist_services` retorna vazio. Não há vazamento entre estúdios pela API de tabelas.
- Leitura anônima de `studios`, `tattoo_artists` e `services` funciona, como o produto exige.
- Insert anônimo em `clients` com `studio_id` inexistente é rejeitado com `42501 new row violates row-level security policy`. A política existe e valida a referência.

### Confirmado exposto

**Os buckets de Storage aceitam listagem anônima.** `POST /storage/v1/object/list/<bucket>` responde para `client-deliveries`, `booking-references`, `logos`, `artists` e `gallery`. A listagem é recursiva: dá para descer de `client-deliveries` para `<studio_id>/` e daí para `<delivery_id>/`.

Isso derruba a suposição de que o nome de arquivo aleatório protegia o conteúdo. Não é preciso adivinhar caminho: dá para enumerar a árvore inteira e depois baixar. `client-deliveries` guarda foto de tatuagem entregue a cliente — dado pessoal sob LGPD, exposto a qualquer visitante do site, já que a chave publicável está no JavaScript da página.

Correção: tornar `client-deliveries` e `booking-references` privados e servir por signed URL de curta duração, emitida só depois de validar o token de entrega. É o item S4.05 do backlog, e a prioridade dele deve subir.
