# Inkora — Product Backlog Oficial

> Fonte consolidada para priorização pós-Sprint 1. Este documento registra somente itens já identificados na homologação, na auditoria técnica e na memória do projeto.

## Critérios

- **S:** pequeno, baixo risco e escopo localizado.
- **M:** alteração em mais de uma camada ou módulo.
- **L:** alteração estrutural, de segurança, banco ou arquitetura.
- Prioridade preserva a classificação já registrada; nenhum item deste backlog autoriza implementação automática.

## 🔴 Sprint 2 — Alta prioridade / valor imediato

### S2.01 — Biblioteca de serviços prontos `[Homologação]`

- **Objetivo:** oferecer modelos como Fine Line, Blackwork, Realismo, Colorido, Lettering, Cover-up, Orçamento e Piercing, com duração e categoria sugeridas.
- **Benefício:** acelerar o cadastro inicial e reduzir erros de configuração.
- **Complexidade:** M
- **Prioridade:** Alta

### S2.02 — Duplicar serviços entre tatuadores `[Homologação]`

- **Objetivo:** permitir copiar a lista de serviços de um tatuador para outro.
- **Benefício:** reduzir trabalho repetitivo em estúdios com catálogo compartilhado.
- **Complexidade:** M
- **Prioridade:** Média

### S2.03 — Fluxo de endereço por CEP `[Homologação]`

- **Objetivo:** adicionar CEP, preenchimento automático/autocomplete, bairro, número e complemento no contato e localização.
- **Benefício:** tornar o cadastro do estúdio mais rápido e consistente.
- **Complexidade:** M
- **Prioridade:** Média

### S2.04 — Isolar draft de onboarding por usuário/estúdio `[Auditoria]`

- **Objetivo:** impedir que o `localStorage` de um onboarding seja reutilizado por outro usuário ou estúdio.
- **Benefício:** evitar vazamento de contexto e dados incorretos no cadastro.
- **Complexidade:** M
- **Prioridade:** Alta

### S2.05 — Reduzir acesso direto do Settings ao Supabase `[Auditoria]`

- **Objetivo:** mover a exceção legada de `Settings.tsx` para o fluxo Service/Hook adotado pelo projeto.
- **Benefício:** manter separação de responsabilidades e facilitar testes/manutenção.
- **Complexidade:** M
- **Prioridade:** Alta

### S2.06 — Proteção contra abuso no booking público `[Auditoria]`

- **Objetivo:** adicionar controles de abuso compatíveis com a arquitetura atual para criação pública de clientes/agendamentos (rate limit e/ou desafio anti-automação, conforme desenho aprovado).
- **Benefício:** reduzir spam, abuso de recursos e risco operacional do endpoint público.
- **Complexidade:** L
- **Prioridade:** Alta

### S2.07 — Padronizar feedback de erro nos módulos operacionais `[Auditoria]`

- **Objetivo:** aplicar mensagens, estados de carregamento e retry coerentes em Clientes, Serviços e Configurações, preservando o padrão resiliente já usado no Financeiro.
- **Benefício:** melhorar diagnóstico e recuperação sem bloquear telas inteiras.
- **Complexidade:** M
- **Prioridade:** Média

### S2.08 — Verificação de acessibilidade e UX dos fluxos principais `[Auditoria]`

- **Objetivo:** revisar onboarding, agenda, login e financeiro para teclado, foco, labels, estados vazios e mensagens de validação.
- **Benefício:** reduzir barreiras de uso e regressões visuais nos fluxos mais importantes.
- **Complexidade:** M
- **Prioridade:** Média

## 🟠 Sprint 3 — Infraestrutura

### S3.01 — Query Layer e cache compartilhado `[Auditoria/Roadmap]`

- **Objetivo:** centralizar leitura, invalidação e cache de queries hoje gerenciados separadamente por cada page/hook.
- **Benefício:** menos chamadas duplicadas, respostas mais rápidas e comportamento previsível de atualização.
- **Complexidade:** L
- **Prioridade:** Alta

### S3.02 — Lazy loading e code splitting de rotas `[Auditoria/Roadmap]`

- **Objetivo:** carregar módulos sob demanda; o build atual produz bundle principal aproximado de 778 kB.
- **Benefício:** reduzir tempo inicial e custo de carregamento.
- **Complexidade:** M
- **Prioridade:** Alta

### S3.03 — Paginação e consultas por faixa `[Auditoria/Roadmap]`

- **Objetivo:** substituir listas sem paginação/range por consultas paginadas nos módulos que crescem com o estúdio.
- **Benefício:** manter performance e consumo de memória em escala.
- **Complexidade:** M
- **Prioridade:** Alta

### S3.04 — Componentização das páginas grandes `[Auditoria]`

- **Objetivo:** decompor páginas e serviços extensos, especialmente Onboarding, Booking e Settings, sem mudar regras de negócio.
- **Benefício:** melhorar coesão, testes e manutenção.
- **Complexidade:** L
- **Prioridade:** Média

### S3.05 — Biblioteca de componentes UI compartilhados `[Auditoria/Roadmap]`

- **Objetivo:** preencher a camada `components/ui` com componentes reutilizáveis para estados, formulários, modais e feedback.
- **Benefício:** reduzir duplicação visual e inconsistência de UX.
- **Complexidade:** M
- **Prioridade:** Média

### S3.06 — Observabilidade de produção `[Auditoria/Roadmap]`

- **Objetivo:** evoluir logs atuais para diagnóstico, métricas e alertas com redaction consistente de PII.
- **Benefício:** detectar falhas reais e reduzir tempo de investigação.
- **Complexidade:** M
- **Prioridade:** Média

### S3.07 — Cobertura e limiares de qualidade `[Auditoria]`

- **Objetivo:** definir thresholds de cobertura e ampliar testes de hooks, serviços e estados de erro.
- **Benefício:** impedir regressões não detectadas pelo conjunto atual de testes.
- **Complexidade:** M
- **Prioridade:** Média

## 🔵 Sprint 4 — Arquitetura

### S4.01 — Availability Engine para booking público `[Auditoria]`

- **Objetivo:** calcular disponibilidade no servidor e retornar apenas horários livres, sem expor registros anonimamente.
- **Benefício:** corrigir a limitação atual do RPC + RLS sobre duração real dos agendamentos.
- **Complexidade:** L
- **Prioridade:** Alta

### S4.02 — Booking Engine transacional `[Auditoria]`

- **Objetivo:** revalidar disponibilidade dentro de transação e proteger concorrência com lock/constraint de intervalo; criar booking atomicamente.
- **Benefício:** evitar dupla reserva em bookings simultâneos.
- **Complexidade:** L
- **Prioridade:** Alta

### S4.03 — Timezone IANA por estúdio `[Auditoria]`

- **Objetivo:** registrar e aplicar o fuso horário do estúdio em expediente, disponibilidade, agenda e competência.
- **Benefício:** eliminar divergências entre browser, UTC e PostgreSQL.
- **Complexidade:** L
- **Prioridade:** Alta

### S4.04 — Snapshot de serviço no agendamento `[Auditoria]`

- **Objetivo:** congelar duração (e dados necessários) no appointment, preservando o intervalo histórico mesmo após alteração do serviço.
- **Benefício:** manter histórico e conflitos corretos.
- **Complexidade:** M
- **Prioridade:** Alta

### S4.05 — Storage privado e signed URLs `[Auditoria]`

- **Objetivo:** revisar buckets públicos, especialmente `client-deliveries`, e aplicar acesso privado com URLs assinadas quando necessário.
- **Benefício:** proteger materiais potencialmente privados e controlar expiração de acesso.
- **Complexidade:** M
- **Prioridade:** Alta

### S4.06 — Schema, migrations, RLS e tipos como fonte única `[Auditoria]`

- **Objetivo:** eliminar drift entre `database.sql`, `rls-policies.sql`, migrations remotas e `database.types.ts`, incluindo relacionamentos tipados.
- **Benefício:** reproduzir ambientes com segurança e reduzir erros de contrato.
- **Complexidade:** L
- **Prioridade:** Alta

### S4.07 — Testes de RLS e isolamento multiestúdio `[Auditoria]`

- **Objetivo:** testar manager, artista, público, cross-tenant e operações sensíveis contra o Supabase.
- **Benefício:** validar a principal barreira de segurança do SaaS.
- **Complexidade:** L
- **Prioridade:** Alta

### S4.08 — Testes E2E e de concorrência `[Auditoria/Roadmap]`

- **Objetivo:** cobrir onboarding, agenda, booking, financeiro, convites e reservas simultâneas em ambiente realista.
- **Benefício:** validar jornadas completas e riscos que testes unitários não alcançam.
- **Complexidade:** L
- **Prioridade:** Alta

### S4.09 — Operações financeiras transacionais `[Auditoria]`

- **Objetivo:** avaliar RPC/transação para persistir pagamento e comissão de forma atômica.
- **Benefício:** evitar estado parcial entre ledger e comissão.
- **Complexidade:** L
- **Prioridade:** Média

### S4.10 — Endurecer autorização do endpoint de notas públicas `[Auditoria]`

- **Objetivo:** revisar a função `update_public_appointment_notes`, hoje baseada em UUID e janela de 30 minutos, adicionando prova de posse/token adequada.
- **Benefício:** reduzir risco de alteração indevida por terceiros.
- **Complexidade:** M
- **Prioridade:** Alta

## 🟢 Futuro — ideias sem prioridade definida

- Favicon personalizado por estúdio.
- Menu contextual na logo da sidebar: página pública, copiar link, configurações, trocar logo e trocar estúdio.
- Copiar horário de um dia para os demais dias.
- Lembretes por WhatsApp/e-mail.
- Relatórios financeiros avançados.
- Avaliações de clientes.
- Página pública de serviços e galeria antes/depois.
- Entregas e compartilhamento de materiais com fluxos adicionais.
- Tema claro/escuro, internacionalização e outras evoluções de produto sem prioridade aprovada.

## Dívidas Técnicas

| Dívida | Impacto | Prioridade | Quando resolver |
| --- | --- | --- | --- |
| Booking público recebe somente `booked_time`; fallback de 60 minutos pode liberar horário cedo demais. | Disponibilidade pública incorreta. | Alta | Sprint 4, com Availability Engine. |
| Não há transação/constraint de intervalo para bookings simultâneos. | Risco de dupla reserva. | Alta | Sprint 4, com Booking Engine. |
| Duração do serviço não é congelada no appointment. | Histórico pode mudar semanticamente após editar serviço. | Alta | Sprint 4. |
| Timezone do estúdio não existe; políticas misturam browser, UTC e PostgreSQL. | Erros de horário e competência. | Alta | Sprint 4. |
| `database.sql`, RLS, migrations remotas e tipos podem divergir; relacionamentos gerados estão vazios. | Ambientes não reproduzíveis e menor segurança de tipos. | Alta | Sprint 4. |
| `Settings.tsx` acessa Supabase diretamente. | Acoplamento e menor testabilidade. | Alta | Sprint 2. |
| Draft de onboarding em `localStorage` não é escopado. | Risco de contexto/dados cruzados. | Alta | Sprint 2. |
| Não existe query cache global nem paginação ampla. | Chamadas duplicadas e degradação com crescimento. | Alta | Sprint 3. |
| Bundle principal grande e rotas sem lazy loading. | Maior tempo de carregamento inicial. | Alta | Sprint 3. |
| Páginas e serviços extensos, com componentes UI compartilhados limitados. | Manutenção e evolução mais caras. | Média | Sprint 3. |
| Storage público para entregas potencialmente privadas. | Exposição indevida de materiais. | Alta | Sprint 4. |
| Criação pública sem proteção robusta contra abuso. | Spam, custo e indisponibilidade. | Alta | Sprint 2; arquitetura definitiva em Sprint 4 se necessário. |
| Autorização de notas públicas baseada em UUID/janela de tempo. | Possível alteração por terceiro que conheça o UUID. | Alta | Sprint 4. |
| Financeiro pode divergir em `capValue` histórico quando regra muda; ledger permanece correto. | Exibição histórica de comissão pode surpreender. | Média | Sprint 3/4, ao definir snapshot de regra. |
| Não há testes RLS, E2E, contrato RPC ou carga/concorrência. | Riscos críticos não cobertos em CI. | Alta | Sprint 4. |
| Observabilidade de produção ainda é limitada. | Diagnóstico lento de falhas reais. | Média | Sprint 3. |
| Não há thresholds de cobertura. | Queda de cobertura pode passar despercebida. | Média | Sprint 3. |

## Fora deste backlog

- Remoção destrutiva de `services.category` no banco.
- Alteração de autenticação, permissões, identidade visual ou arquitetura principal sem decisão específica.
- Migrações ou implementação de qualquer item: este arquivo é planejamento oficial.

