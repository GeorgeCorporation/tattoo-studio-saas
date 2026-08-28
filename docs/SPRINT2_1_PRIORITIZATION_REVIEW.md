# Inkora — Revisão Crítica e Priorização da Pesquisa Sprint 2.1

> Documento de decisão de produto. Não aprova implementação automática, não altera o backlog oficial e não substitui especificação técnica por item.

## Veredito

O relatório de pesquisa é um **bom mapa de oportunidades**, mas não é um plano executável ainda.

### Pontos fortes

- Protege o Inkora de copiar interface ou fluxo proprietário.
- Identifica corretamente Agenda, Cliente e Booking como núcleos do produto.
- Mantém o limite arquitetural real: RPC + RLS, concorrência de booking, timezone e Storage privado.
- Não reintroduz `category` na aplicação.
- Prioriza fonte de verdade e segurança antes de automação.

### Correções necessárias na leitura do relatório

| Problema | Decisão desta revisão |
| --- | --- |
| Os 40 itens parecem ter prioridade parecida. | Agrupar por resultado de produto e dependência; não executar a lista em sequência. |
| Mistura UX, bug/estabilização, novos domínios e infraestrutura. | Cada grupo entra em uma sprint distinta; nenhum épico atravessa sprint sem critério de aceite. |
| Algumas sugestões são de CRM genérico. | Manter somente o que melhora sessão, agenda, cliente, artista ou operação do estúdio. |
| “Mais indicadores” pode criar painel bonito e pouco confiável. | Métrica só entra após definição, fonte e drill-down verificáveis. |
| Automação parece simples, mas depende de eventos e dados consistentes. | Lembretes, depósitos, rebooking e waitlist ficam depois do domínio de booking. |
| Fotos/documentos aparecem como UX. | São dados sensíveis: só entram após Storage privado, retenção e testes RLS. |

### Princípio de corte

Uma melhoria só entra agora se cumprir pelo menos um destes critérios:

1. reduz falha/hora manual em tarefa já existente;
2. melhora uma rotina específica de tatuagem;
3. reduz risco de dado, acesso ou reserva;
4. prepara uma dependência necessária para valor futuro imediato.

---

## Matriz de priorização

**Legenda:** complexidade técnica: S/M/L. Risco arquitetural: baixo/médio/alto/crítico.  
**Cobertura:** números da checklist do relatório original.

| Melhoria agrupada | Benefício Inkora | Impacto usuário | Complexidade | Risco | Dependências | Esforço | Cobertura |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Isolar draft de onboarding por usuário/estúdio | Evita restauração de dados/fotos em conta errada. | Alto, confiança no cadastro. | M | Médio | chave de escopo, limpeza e testes de retomada. | Médio | 10–11 |
| Feedback padrão: loading, erro, retry, salvar, empty state | Menos tela bloqueada e menos dúvida ao operar. | Alto, diário. | M | Baixo | componentes/padrões de UI; sem mudar domínio. | Médio | 32–35 |
| Acessibilidade dos fluxos críticos | Uso por teclado, foco correto, labels e feedback perceptível. | Alto, transversal. | M | Baixo | checklist de aceite e testes de interação. | Médio | 35 |
| Dashboard operacional, sem novos indicadores | Destaca agenda, pendências e ação do dia. | Alto, diário. | M | Médio | dados atuais confiáveis; definição de estados vazios/erro. | Médio | 1, 4 |
| Métrica com drill-down e definição | Evita número sem origem e aumenta confiança. | Médio/alto, gestor. | M | Médio | contratos financeiros, filtros e rotas/listas de origem. | Médio | 2–3 |
| Filtros, busca e preservação de contexto | Menos cliques para encontrar agenda, cliente ou artista. | Alto, diário. | M | Baixo | parâmetros de URL/estado e paginação futura compatível. | Médio | 5, 7, 22 |
| Atalhos de criação e retorno contextual | Acelera rotina sem mudar dados. | Médio/alto. | S/M | Baixo | rotas/ações existentes e UX de permissão. | Baixo | 6–7 |
| Navegação agrupada e mobile | Torna módulos fáceis de localizar. | Médio. | M | Médio | auditoria de rotas, responsividade e papéis. | Médio | 8–9 |
| Duplicar serviços entre tatuadores | Reduz cadastro repetitivo em estúdio com catálogo comum. | Alto para gestor. | M | Médio | service domain, autorização e confirmação de destino. | Médio | Backlog S2.02 |
| Endereço por CEP | Reduz erro e tempo no cadastro do estúdio. | Médio. | M | Médio | provedor CEP, indisponibilidade, LGPD e fallback manual. | Médio | Backlog S2.03 |
| Identificação de possível duplicidade de cliente | Reduz CRM fragmentado. | Médio. | M | Alto | regra de comparação, privacidade e estratégia de merge. | Médio | 12 |
| Cliente 360°: resumo, histórico e timeline | Contexto por sessão sem procurar em vários módulos. | Alto, estúdio e artista. | M/L | Alto | modelo de eventos/associações, RLS e paginação. | Alto | 13, 15 |
| Notas internas estruturadas | Preserva contexto clínico/operacional entre sessões. | Alto. | M | Alto | autor, visibilidade, auditoria e RLS. | Médio | 14 |
| Pedido de orçamento/consulta | Trata tatuagem customizada sem forçar booking instantâneo. | Muito alto, diferencial vertical. | L | Alto | novo domínio, status, referência, artista, notificações futuras. | Alto | 16 |
| Serviços, duração e preço por tatuador | Representa a operação real de cada artista. | Alto. | M/L | Alto | compatibilidade do serviço atual, agenda e booking. | Alto | 19 |
| Bloqueios, pausas e disponibilidade por tatuador | Agenda reflete férias, eventos e preparo. | Alto. | M/L | Alto | working hours, conflito, timezone e UI de agenda. | Alto | 20, 22 |
| Histórico de status, remarcação e cancelamento | Rastreia mudança e reduz erro operacional. | Alto. | L | Alto | modelo de evento, transação/consistência e regras de conflito. | Alto | 23–24 |
| Proteção antiabuso de booking público | Reduz spam, custo e fraude. | Alto, proteção do estúdio. | L | Alto | desenho de rate limit/desafio, observabilidade e UX pública. | Alto | 27; Backlog S2.06 |
| Formulários, consentimento e documentos | Segurança e contexto de atendimento. | Alto, principalmente tatuagem. | L | Crítico | Storage privado, signed URLs, retenção, RLS e versão. | Alto | 17–18 |
| Fotos privadas por sessão | Mantém referência e evolução de trabalho. | Médio/alto. | L | Crítico | mesmo bloco de segurança documental. | Alto | 17 |
| Confirmação, lembretes e rebooking | Menos no-show e mais retorno. | Alto. | L | Alto | eventos, consentimento de comunicação e provedor. | Alto | 25 |
| Depósito e política de cancelamento | Protege agenda de alto valor. | Alto. | L | Crítico | pagamento, estorno, política, booking transacional. | Alto | 26 |
| Financeiro: extrato, filtros e indicadores confiáveis | Gestor entende números e origem. | Alto. | M/L | Alto | snapshot, timezone, estorno e regras de comissão. | Alto | 2–3, 31 |
| Produtividade/ocupação por artista | Ajuda decisão de gestão. | Médio. | M/L | Alto | disponibilidade confiável, timezone e métricas definidas. | Alto | 21 |
| Paginação, cache, lazy loading e observabilidade | Mantém velocidade e diagnóstico em escala. | Médio hoje; alto no crescimento. | L | Alto | estratégia de query/cache, métricas e redaction. | Alto | 36, 39 |
| Testes RLS e E2E | Reduz risco de vazamento e regressão real. | Alto indireto. | L | Crítico | ambiente de teste, fixtures e CI. | Alto | 37–38 |
| Availability Engine | Disponibilidade pública correta sem expor dados. | Crítico. | L | Crítico | timezone, duração/snapshot, RLS e contrato RPC. | Alto | 28, 30–31 |
| Booking Engine transacional | Evita dupla reserva e torna booking confiável. | Crítico. | L | Crítico | Availability Engine, transação/constraint e E2E concorrente. | Alto | 29 |
| Waitlist inteligente | Preenche vagas depois de cancelamento. | Médio. | L | Alto | Booking Engine, eventos e comunicação. | Alto | pesquisa: waitlist |
| Portfólio ligado a serviço/sessão | Melhora escolha e contexto artístico. | Médio. | M/L | Alto | Storage, moderação e permissão pública/privada. | Alto | pesquisa: portfólio |
| Recursos/salas/equipamentos | Ajuda estúdios grandes a evitar choque de recurso. | Baixo/médio no público atual. | L | Alto | novo domínio de recurso e scheduling engine. | Alto | pesquisa: recursos |
| Metas, ranking e gamificação | Pode mostrar evolução de equipe. | Baixo e pode gerar efeito cultural ruim. | M | Médio | métricas maduras e política de gestão. | Médio | pesquisa: metas/ranking |
| Campanhas, segmentação e avaliações | Crescimento e retorno de clientes. | Médio, não essencial agora. | L | Alto | consentimento, comunicação e CRM maduro. | Alto | pesquisa: campanhas |
| Marketplace e descoberta | Pode gerar demanda externa. | Incerto; alto custo de aquisição. | L | Crítico | rede de oferta/demanda, moderação, pagamentos e suporte. | Alto | pesquisa: marketplace |
| POS/inventário completo | Expande operação de varejo. | Baixo para núcleo de tatuagem. | L | Crítico | fiscal, estoque, checkout e financeiro. | Alto | pesquisa: POS/inventário |

---

## Organização por decisão

### Quick Wins

Pequenas/médias melhorias de grande efeito, sem criar novo domínio pesado.

1. **Isolar draft de onboarding por usuário/estúdio.** Corrige risco real de contexto e mantém confiança após os bugs recentes.
2. **Padronizar loading, erro, retry, salvar e empty state.** Leva a resiliência já aprovada no Financeiro para módulos operacionais.
3. **Acessibilidade dos fluxos críticos.** Labels, foco, teclado e mensagens tornam o sistema mais confiável para todos.
4. **Filtros, busca e preservação de contexto.** Menos navegação repetitiva em Agenda, Clientes e Tatuadores.
5. **Atalhos de criação e retorno contextual.** Valor rápido sem alterar regras de negócio.
6. **Duplicar serviços entre tatuadores.** Alto ganho administrativo; encaixa no domínio de serviços já existente.
7. **CEP com fallback manual.** Bom benefício de onboarding, desde que serviço externo seja opcional e falhas não bloqueiem salvar.

### Alto Impacto

Muito valor, mas precisa de especificação e sequência técnica.

1. **Cliente 360° com histórico e notas.** É CRM de tatuagem, não CRM genérico: precisa preservar sessões, referências e contexto artístico.
2. **Pedido de orçamento/consulta.** Principal diferencial de estúdio de tatuagem, pois projetos customizados não devem virar slot automático.
3. **Serviço/disponibilidade por tatuador.** Deixa catálogo e agenda coerentes com operação real.
4. **Bloqueios por artista e visão dia/semana.** Valor diário; só depois de validar conflitos e timezone.
5. **Histórico de status, remarcação e cancelamento.** Base para confiança, comunicação e métricas.
6. **Proteção antiabuso no booking público.** P0 de segurança antes de aumentar exposição pública.
7. **Financeiro com extrato/drill-down.** Somente com definições de competência, estorno e comissão.
8. **Formulários/consentimento e fotos privadas por sessão.** Alto valor e alta responsabilidade de privacidade.
9. **Availability Engine + Booking Engine.** Obrigatórios antes de prometer disponibilidade avançada e anti-dupla-reserva.

### Baixo Impacto agora

Não são ruins. Apenas não resolvem o maior problema atual.

1. Navegação lateral reorganizada visualmente, se não vier junto de filtros/atalhos concretos.
2. Métricas de produtividade/ocupação por artista antes de disponibilidade e timezone confiáveis.
3. Portfólio ligado a serviço/sessão antes de Storage privado e consentimento.
4. Waitlist antes de Booking Engine, eventos e comunicação.
5. Recursos, salas e equipamentos: relevante apenas para estúdios maiores.
6. Campanhas, segmentação e avaliações antes de CRM/consentimento maduro.

### Não recomendadas para o núcleo do Inkora

| Sugestão de referência | Por que descartar agora |
| --- | --- |
| **Marketplace próprio de descoberta** | É negócio de rede, não melhoria de SaaS operacional. Exige aquisição de clientes, moderação, suporte, reputação e pagamentos. O Inkora deve primeiro permitir que cada estúdio converta seu próprio público. |
| **POS e inventário completos** | É um segundo produto: fiscal, checkout, estoque, fornecedores e varejo. Muitos estúdios não precisam disso; integrar no futuro é mais prudente que competir com PDVs maduros. |
| **Ranking/gamificação de tatuadores** | Pode gerar competição nociva, métricas manipuláveis e não melhora atendimento de forma direta. Gestão deve focar em dados privados e contexto. |
| **Construtor genérico de CRM/views estilo Notion** | Flexibilidade irrestrita aumenta suporte, treinamento, inconsistência e risco de dados. Inkora deve oferecer views curadas para tatuagem. |
| **IA/automação genérica por moda** | Sem dados estruturados, consentimento, telemetria e objetivo mensurável, adiciona custo e risco sem resolver rotina principal. |

---

## Plano por sprints pequenas

> A Sprint 2.1 atual é **somente pesquisa e priorização**. As sprints abaixo começam após aprovação individual de escopo.

| Sprint | Objetivo | Escopo enxuto | Por que agora | Critério de saída |
| --- | --- | --- | --- | --- |
| **2.1** | Decisão de produto | Pesquisa, matriz, descarte e plano. | Evita construir por inspiração superficial. | Este documento aprovado. |
| **2.2** | Confiabilidade percebida | Draft isolado; feedback/loading/erro/retry; acessibilidade crítica. | Resolve risco conhecido e melhora cada módulo sem criar novos domínios. | Retomada de onboarding por usuário funciona; telas saudáveis não bloqueiam por erro parcial; testes de interação passam. |
| **2.3** | Cadastros rápidos | Duplicar serviços entre tatuadores. | Escopo localizado, alto uso administrativo, aproveita Service Domain. | Cópia autorizada, idempotente/confirmada e sem reintroduzir `category`. |
| **2.4** | Endereço confiável | CEP, preenchimento assistido e fallback manual. | Acelera onboarding/configurações sem tornar serviço externo requisito. | Falha do CEP não impede salvar; campos e validação manual funcionam. |
| **2.5** | Encontrar e agir | Busca/filtros persistentes; atalhos; retorno contextual em Agenda/Clientes. | Reduz cliques em rotina existente sem alterar regras críticas. | Filtros preservam contexto e são acessíveis; ação não perde dados. |
| **2.6** | CRM de sessão — fase 1 | Perfil de cliente: resumo, histórico existente e notas internas; sem documentos/fotos privadas. | Entrega contexto de tatuagem com risco controlado. | RLS por estúdio/papel, paginação prevista e histórico verificável. |
| **2.7** | Catálogo real por artista | Serviço, duração/preço e bloqueios por tatuador; especificação de agenda antes de código. | Prepara disponibilidade real sem mexer ainda no booking público. | Conflitos/expediente continuam corretos; regras compartilhadas testadas. |
| **2.8** | Booking público protegido | Desenho + implementação de antiabuso compatível com arquitetura. | Booking é fronteira pública; segurança antecede aumento de tráfego. | Abuse tests, logs sem PII e rota legítima preservada. |
| **2.9** | Ciclo do agendamento | Estados, motivos, histórico; remarcação/cancelamento internos. | Base para comunicação e métricas, antes de automação. | Operação consistente; não perde slot nem cria conflito; E2E principal passa. |
| **3.0** | Financeiro verificável | Extrato/filtragem/drill-down; definições de indicadores. | Evita gráficos sem confiança. | Todo valor aponta para origem e respeita competência/estorno. |
| **3.1** | Dados sensíveis | Storage privado, consentimento, referências/fotos por sessão. | Só depois de segurança e perfil de cliente. | Signed URLs, retenção, RLS e testes cross-tenant aprovados. |
| **4.0** | Booking escalável | Timezone IANA, snapshot, Availability Engine, Booking Engine e E2E concorrente. | Remove limitação estrutural e habilita automações corretas. | Não há dupla reserva em teste concorrente; disponibilidade não expõe dados privados. |
| **4.1+** | Automação com segurança | Confirmação, lembretes, rebooking, depósito e waitlist. | Depende de eventos e booking transacional. | Consentimento, entregabilidade, falhas/retry e auditoria definidos. |

## Regras de sequência

1. Não iniciar Sprint 2.6 sem fechar o modelo mínimo de timeline/notas e RLS.
2. Não iniciar 2.7 sem especificação de serviço por artista e compatibilidade de agenda atual.
3. Não automatizar mensagem, depósito ou waitlist antes de 2.9 + 4.0.
4. Não armazenar referência sensível/documento em bucket público.
5. Não criar gráfico novo sem definição de métrica, período, estado vazio e drill-down.
6. Não executar sprints em paralelo quando ambas alteram Agenda/Booking/Cliente.

## Decisão recomendada

**Aprovar para execução somente 2.2 e 2.3.**

São as duas menores entregas com valor operacional claro e risco controlável. CEP (2.4) e filtros (2.5) podem ser aprovados depois, sem bloquear as demais decisões. Todo bloco posterior precisa de especificação funcional e técnica própria.
