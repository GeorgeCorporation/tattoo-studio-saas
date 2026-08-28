# Inkora — Sprint 2.1 | Pesquisa de Produto

> **Tipo:** pesquisa de produto e recomendações.  
> **Escopo:** nenhuma funcionalidade é implementada, aprovada ou incluída automaticamente neste documento.  
> **Método:** leitura de páginas, central de ajuda e documentação públicas oficiais em 29/07/2026. A análise registra padrões de produto observáveis; não presume detalhes internos, código, dados ou fluxos proprietários das plataformas.

## Sumário executivo

O Inkora já tem a base correta de um SaaS operacional: estúdio multi-tenant, artistas, serviços, agenda, clientes, financeiro, configurações e booking público. A maior oportunidade não é adicionar telas isoladas: é tornar a informação **conectada, acionável e confiável**.

Os padrões mais fortes encontrados são:

1. **Agenda como centro operacional:** criar, alterar, confirmar, cobrar e consultar o cliente sem perder o contexto da agenda.
2. **Cadastro vira histórico:** cliente, artista, serviço e sessão são registros conectados, não formulários estáticos.
3. **Dashboard prioriza ação, não volume:** hoje, pendências e riscos primeiro; indicadores detalhados depois.
4. **Automação progressiva:** confirmação, lembrete, depósito, remarcação e rebooking são etapas futuras, ativadas somente quando a base de dados e segurança suportarem.
5. **Uma fonte de verdade por domínio:** o princípio já adotado no Inkora para expediente, serviços e financeiro deve evoluir para perfis, disponibilidade e operações de booking.

### Limite da pesquisa

- Não copiar componentes, identidade, textos, nomes de recursos, telas ou jornada proprietária.
- Não interpretar material comercial como prova de implementação técnica interna.
- Não tratar qualquer item abaixo como requisito já aprovado. Itens com impacto em pagamentos, comunicação, RLS, Storage, banco ou booking precisam de especificação própria.

---

## 1. Dashboard

### Comparativo por referência

| Plataforma | Pontos fortes e organização | Indicadores e prioridade visual | Inspiração segura para o Inkora |
| --- | --- | --- | --- |
| **Fresha** | Une agenda, clientes, equipe, pagamentos, relatórios e marketing. O calendário é apresentado como núcleo da operação; o cliente e a cobrança aparecem ligados ao atendimento. | Foco em ocupação, vendas, retenção, desempenho de equipe, comissões e resultados por período. | Dashboard orientado ao dia: próximos atendimentos, lacunas, confirmações pendentes e pagamentos a receber antes de gráficos detalhados. |
| **Booksy** | Centraliza calendário, clientes, pagamentos, marketing, catálogo e presença pública. A documentação destaca edição de agendamento ao lado do calendário, reduzindo troca de contexto. | Stats/reports e painel de visibilidade do perfil complementam a rotina operacional. | Criar atendimento sem sair da visão temporal; manter detalhes em painel/modal contextual, não abrir páginas em excesso. |
| **GlossGenius** | Conecta agenda, checkout, CRM, comunicação, equipe e relatórios. Dados do cliente atualizam a partir de booking e pagamento. | Prioriza receita, recorrência, agenda e performance/atividade da equipe. | Cards de saúde operacional: agenda de hoje, pendências, receita do período, taxa de retorno e próximos passos. |
| **TattooPro** | É específico para tatuagem: diferencia projetos customizados de slots simples/flash e conecta pedido, aprovação, depósito e agenda. | O valor visual está em exceções: pedido aguardando decisão, depósito pendente, slot reaberto, agenda disponível. | Painel de “atenção agora”: pedidos de orçamento, referências pendentes, sessões sem confirmação e horários vagos. |
| **HubSpot** | Dashboard nasce de uma fonte de dados/relacionamentos comum; cada time vê métricas adequadas à sua responsabilidade. | Funil, atividades, receita e próximos passos são filtráveis e permissionados. | Métricas clicáveis que levam à lista já filtrada; cada métrica deve responder “o que faço agora?”. |
| **Linear** | Prioriza foco: itens ativos, estado, responsável, prioridade e bloqueios. Evita misturar planejamento amplo com trabalho diário. | Indicadores aparecem no contexto da lista/projeto, sem transformar a tela em painel pesado. | Separar “operação de hoje” de “análise do mês”; usar estados e prioridade claros para pendências. |
| **Notion** | Uma mesma fonte pode ter visão de tabela, calendário, quadro, timeline e gráfico conforme o contexto. | O usuário escolhe o recorte; propriedades irrelevantes ficam ocultas na visão atual. | Reutilizar a mesma fonte para cards, lista e calendário; filtros persistentes por artista, período e status. |

### Recomendação para o Dashboard Inkora

Ordem recomendada de leitura, sem mudar branding atual:

1. **Agora:** agenda de hoje, próximos atendimentos, atrasos/pending, conflito/pendência operacional.
2. **Ação:** botão de criar agendamento, abrir agenda, cobrar/registrar pagamento quando o domínio suportar, revisar pedidos.
3. **Saúde do estúdio:** receita recebida no mês, ocupação, cancelamentos/no-show, clientes novos/recorrentes.
4. **Evolução:** desempenho por artista e serviço, somente com dados e definição de métricas confiáveis.

Não mostrar um card apenas por existir dado. Cada card deve ter: definição, período, estado vazio, erro parcial, loading e destino ao clicar.

---

## 2. Navegação

### Padrões observados

| Referência | Padrão de navegação | Lição aplicável |
| --- | --- | --- |
| Fresha / Booksy / GlossGenius | Módulos operacionais claros: agenda, clientes, equipe, catálogo, pagamentos/relatórios e configurações. A agenda é caminho principal. | Agrupar por trabalho do estúdio, não por estrutura de banco. |
| TattooPro | Organiza a rotina do estúdio em front desk/agenda, clientes, pagamentos, equipe/portfólio, formulários e relatórios. | Tatuagem pede separar “operação diária” de “crescimento/configuração”. |
| HubSpot | Navegação por áreas de responsabilidade, com registros relacionados e ações dentro do contexto. | Perfil de cliente deve evitar caça a dados em módulos diferentes. |
| Linear | Hierarquia enxuta, atalhos, filtros e contexto lateral. Planejamento amplo separado da execução. | Reduzir cliques em tarefas frequentes; abrir detalhe sem perder a lista/agenda. |
| Notion | Sidebar hierárquica e views contextuais da mesma fonte. | Usuário deve enxergar somente propriedades e ações relevantes ao papel/tela. |

### Proposta de arquitetura de informação para validar depois

| Grupo | Módulos Inkora | Resultado esperado |
| --- | --- | --- |
| **Operação** | Dashboard, Agenda, Clientes | Resolver o dia em até 1–2 cliques. |
| **Catálogo e equipe** | Tatuadores, Serviços, Galeria | Manter oferta, pessoas e presença pública. |
| **Gestão** | Financeiro, Relatórios futuros | Entender resultado sem misturar com agenda diária. |
| **Crescimento** | Booking público, pedidos/orçamentos futuros, comunicação futura | Converter interesse em atendimento confirmado. |
| **Administração** | Configurações, acesso/equipe, assinatura/suporte institucionais | Ações menos frequentes, fora do fluxo diário. |

### Melhorias de navegação a investigar

- Atalhos contextuais de criação: “novo agendamento”, “novo cliente”, “novo serviço”.
- Filtros visíveis e preservados por agenda/lista: data, artista, status e busca.
- Breadcrumb ou retorno contextual quando abrir cliente/artista a partir de uma agenda.
- Ações secundárias no detalhe/side panel, sem sobrecarregar a sidebar.
- Navegação mobile que mantenha Agenda e ação primária acessíveis.

---

## 3. Cadastros: cliente, artista, estúdio e serviços

### Comparação com o Inkora atual

| Entidade | Inkora hoje | Referências | Lacuna / melhoria a validar |
| --- | --- | --- | --- |
| **Cliente** | Cadastro e listagem por estúdio; histórico básico/perfil previsto; criação também via booking. | Fresha e GlossGenius centralizam detalhes, sessões, preferências, notas, formulários e histórico de compra. HubSpot trata o contato como registro relacionado a atividades. | Perfil 360° de cliente, linha do tempo, notas estruturadas, anexos/consentimentos e busca/duplicidade. |
| **Tatuador** | Perfil, foto, convite, agenda, galeria e acesso por papel. | Fresha/GlossGenius ligam agenda, disponibilidade, serviços/preço, comissão e desempenho por profissional. TattooPro reforça portfólio e trabalho móvel. | Serviços/duração/preço por artista, disponibilidade/bloqueios, indicadores individuais e portfólio ligado a sessão. |
| **Estúdio** | Onboarding cria identidade, localização, expediente, equipe e serviços; Configurações altera dados. | Plataformas maduras fazem onboarding progressivo e deixam configurações avançadas fora do primeiro uso. | Progresso de ativação persistente, configurações agrupadas e validações de publicação pública. CEP já está no backlog; não implementar sem aprovação. |
| **Serviços** | Nome, duração, preço inicial opcional, descrição e biblioteca reutilizável; sem `category` na aplicação. | Booksy usa serviço + descrição + foto; Fresha permite configurar serviço no atendimento/equipe; catálogo deve apoiar escolha rápida. | Modelos editáveis já iniciados na Sprint 2; próxima evolução deve ser serviço por artista, imagem opcional e regras de booking, sem reintroduzir `category`. |

### Princípios de formulário

1. Exigir somente o mínimo para salvar; enriquecer depois.
2. Explicar a consequência de um campo de publicação, duração, preço ou disponibilidade.
3. Autosave/draft somente com escopo por usuário/estúdio, restauração determinística e limpeza explícita.
4. Evitar cadastro duplicado: buscar por telefone/e-mail antes de criar, quando a regra de privacidade estiver definida.
5. Mostrar confirmação após salvar e manter o usuário no contexto adequado.

---

## 4. Agenda

### Comparativo

| Tema | Padrões de mercado | Situação Inkora / recomendação |
| --- | --- | --- |
| Criação | Agenda contextual com cliente, artista, serviço, duração, notas, recursos e pagamento/deposito quando aplicável. | Inkora já valida expediente, conflito, duração e data. Evoluir o formulário somente após manter uma fonte de verdade para disponibilidade. |
| Calendário | Dia/semana, filtro por equipe, blocos claros, detalhes ao lado; algumas referências oferecem drag-and-drop. | Priorizar dia/semana por artista e detalhe contextual. Drag-and-drop é posterior: exige validação de conflito no mesmo fluxo. |
| Confirmação | Mensagens automáticas, depósitos/políticas e estado visível de confirmação. | Criar primeiro estados explícitos e trilha de eventos; comunicação/pagamento exigem arquitetura e fornecedor aprovados. |
| Remarcação | Reabre disponibilidade, registra motivo e notifica as partes. | Definir operação atômica: validar novo slot, liberar antigo, registrar histórico e só então comunicar. |
| Cancelamento | Política, motivo, vaga liberada e possível fila de espera. | Implementar histórico/motivo antes de waitlist. Não prometer reposição automática sem Availability/Booking Engine. |
| Tatuagem customizada | TattooPro separa consulta/pedido aprovado de slot instantâneo, com referências e depósito. | Alto valor para Inkora: “pedido de orçamento” deve ser domínio próprio, não forçar um projeto complexo no booking de serviço comum. |

### Regra de produto

O calendário não deve ser a única fonte de disponibilidade pública. A limitação atual de RPC + RLS e a ausência de transação para bookings simultâneos continuam bloqueadores para recursos como waitlist, instant booking complexo, drag-and-drop público e depósitos automáticos. Isso pertence ao futuro **Availability Engine + Booking Engine**.

---

## 5. Financeiro

### Padrões relevantes

- **Fresha:** vendas, pagamentos, performance da equipe, comissões e relatórios por período/local.
- **Booksy:** pagamentos integrados, stats/reports e catálogo conectados à rotina.
- **GlossGenius:** checkout, despesas, comissões, relatórios, pagamento da equipe e indicadores de cliente.
- **HubSpot:** painel configurável, filtros, permissões e métricas que levam ao registro de origem.
- **Linear/Notion:** métricas no contexto, com recortes e visualizações adequadas, evitando dashboards genéricos.

### Direção para o Inkora

O Financeiro já é resiliente por seção e deve manter esta decisão. Próximos indicadores devem ser definidos antes de virarem cards:

| Indicador | Definição necessária | Risco se não definir |
| --- | --- | --- |
| Receita recebida | `paid_at`, escopo, estorno e timezone. | Somar receita fora do período ou duplicar. |
| Receita prevista | Status de agenda, orçamento, depósito e cancelamento. | Tratar intenção como dinheiro. |
| Ticket médio | Numerador, quantidade de atendimentos e regra para valor zero. | Métrica enganosa. |
| Comissão | Base, teto, vigência, estorno e snapshot histórico. | Divergência entre pagamento e comissão. |
| Ocupação | Horas disponíveis, bloqueios, expediente, duração e timezone. | Percentual falso. |
| No-show/cancelamento | Estados finais, motivo e período. | Ação sem diagnóstico. |

Recomendação: primeiro **extrato filtrável + definições + drill-down**; depois gráficos. Gráfico sem origem verificável reduz confiança.

---

## 6. Perfil do Cliente

### Modelo de experiência recomendado

O perfil deve ser a fonte operacional de relacionamento, com abas ou seções enxutas:

| Seção | Conteúdo | Valor |
| --- | --- | --- |
| Resumo | contato, observação destacada, alertas e próximo agendamento. | Contexto imediato. |
| Linha do tempo | bookings, sessões, alterações de status, pagamentos e comunicações futuras. | Auditoria e continuidade. |
| Sessões | serviço, artista, duração, valor, resultado e próximo passo. | Histórico de trabalho. |
| Referências/fotos | arquivos ligados à sessão, com permissão e retenção definidas. | Contexto visual sem misturar com galeria pública. |
| Notas | notas internas estruturadas, autor/data e visibilidade. | Continuidade entre equipe. |
| Documentos | consentimento/formulário assinado, versão e data. | Segurança operacional e rastreabilidade. |

Fresha e GlossGenius demonstram o valor de concentrar histórico, notas, formulários e preferências no perfil. HubSpot reforça o princípio: o registro é útil quando junta dados e atividades relacionados, não quando apenas guarda campos.

**Pré-requisito:** anexos, imagens de referência, dados sensíveis e consentimentos exigem política de acesso, Storage privado/signed URLs, retenção e RLS testado. Não usar bucket público para estes dados por conveniência.

---

## 7. Perfil do Tatuador

### O que um perfil profissional precisa responder

| Pergunta | Dados necessários | Situação / direção |
| --- | --- | --- |
| Onde ele trabalha e quando? | agenda, expediente próprio, bloqueios, férias e disponibilidade. | Agenda/expediente existem; personalização por artista é evolução. |
| O que ele oferece? | serviços habilitados, duração, preço, estilo, portfólio. | Serviços e galeria existem; relação por artista ainda é oportunidade. |
| Como está indo? | sessões, receita recebida, ocupação, cancelamento, comissão e metas. | Financeiro tem base de comissão; metas e indicadores exigem definições/snapshots. |
| Qual é o próximo passo? | próximos atendimentos, pendências de confirmação, pedido de consulta e tarefas futuras. | Priorizar rotina antes de analytics sofisticado. |

Padrão importante de Fresha/GlossGenius: permissões e visão devem acompanhar o papel. O artista visualiza seu trabalho e cliente permitido; o gestor enxerga a operação agregada. No Inkora, isto continua dependente de RLS e não pode ser resolvido apenas por ocultação de UI.

---

## 8. UX e qualidade percebida

### Padrões que o Inkora deve adotar gradualmente

| Tema | Padrão de produto | Direção Inkora |
| --- | --- | --- |
| Microinterações | Feedback curto para ação concluída, alteração de estado e ação reversível quando segura. | Toast acessível + atualização local coerente; não usar animação para esconder latência. |
| Loading | Skeleton quando a estrutura é previsível; spinner local para ações pequenas. | Evitar bloquear página inteira por seção independente. Financeiro já é referência interna. |
| Estado vazio | Explicar por que está vazio e oferecer a ação primária. | “Nenhum agendamento hoje” + criar agendamento, não apenas área branca. |
| Erro | Mensagem específica, causa segura, retry local e preservação do conteúdo saudável. | Reaplicar padrão resiliente do Financeiro em Clientes, Serviços e Configurações. |
| Salvar | Botão com estado, prevenção de duplo envio e confirmação clara. | Tratar sucesso somente depois da persistência; não navegar antes de atualizar acesso/dados necessários. |
| Excluir | Mostrar impacto, confirmar operação irreversível e informar resultado. | Preferir arquivamento quando histórico financeiro/agenda depender do dado. |
| Consistência | Mesma semântica de status, datas, moeda, erro e ações primárias. | Criar catálogo de componentes/padrões antes de multiplicar telas. |
| Acessibilidade | Labels, foco, teclado, contraste, feedback sem depender só de cor. | Manter como critério de aceite de cada fluxo, não como polimento final. |

---

## 9. Funcionalidades ausentes no Inkora

> Priorização de **pesquisa**. Não altera o backlog oficial até validação de produto, arquitetura e segurança.

### Essenciais

| Item | Motivo | Impacto | Complexidade |
| --- | --- | --- | --- |
| Pedido de orçamento/consulta para tatuagem customizada | Projetos grandes não cabem bem em agendamento instantâneo de serviço. | Alto | L |
| Formulários e consentimento digital por cliente/sessão | Segurança operacional, coleta de referência e contexto antes do atendimento. | Alto | L |
| Histórico 360° do cliente | Evita perda de contexto entre sessões e artistas. | Alto | M |
| Confirmação/remarcação/cancelamento com trilha de eventos | Reduz no-show e torna mudanças auditáveis. | Alto | L |
| Fonte confiável de disponibilidade pública | Corrige limitação atual de RPC + RLS e risco de dupla reserva. | Crítico | L |
| Proteção antiabuso no booking público | Endpoint público precisa limitar spam/automação. | Crítico | L |
| Feedback operacional padronizado | Erros/loads não podem bloquear todo módulo nem deixar usuário sem ação. | Alto | M |

### Importantes

| Item | Motivo | Impacto | Complexidade |
| --- | --- | --- | --- |
| Serviço, preço e duração por tatuador | Catálogo real varia por artista e estilo. | Alto | M |
| Bloqueios, pausas e indisponibilidade por artista | Agenda precisa refletir férias, eventos e preparo. | Alto | M |
| Depósito e política de cancelamento | Protege horas de alto valor; depende de provedor/fluxo financeiro. | Alto | L |
| Lembretes e rebooking | Automatiza rotina e ajuda retenção. | Alto | L |
| Filtros, busca, paginação e views por módulo | Mantém operação usável com crescimento da base. | Médio | M/L |
| Painel de produtividade/ocupação por artista | Ajuda gestão, se definição de métrica for confiável. | Médio | M |
| Histórico de fotos por sessão | Melhora continuidade e relacionamento; exige Storage privado. | Médio | L |
| Duplicidade de cliente e merge assistido | Evita CRM fragmentado. | Médio | M/L |

### Futuras

| Item | Motivo | Impacto | Complexidade |
| --- | --- | --- | --- |
| Waitlist inteligente | Preenche cancelamentos; só depois de disponibilidade transacional. | Médio | L |
| Recursos/salas/equipamentos | Útil a estúdios maiores; não é requisito do primeiro fluxo. | Médio | L |
| Portfólio ligado a serviço/sessão | Ajuda descoberta e decisão; requer moderação/Storage. | Médio | M/L |
| Metas, gamificação e ranking | Pode motivar equipe, mas exige governança e métricas confiáveis. | Baixo/Médio | M |
| Campanhas, segmentação e avaliações | Crescimento/retensão depois de CRM e consentimento maduros. | Médio | L |
| Marketplace e descoberta | Estratégia de rede complexa, não requisito operacional inicial. | Alto potencial | L |
| Inventário/POS completo | Pode expandir monetização, mas amplia domínio financeiro/operacional. | Médio | L |

---

## 10. Roadmap recomendado

| Fase | Entregas candidatas | Impacto | Complexidade | Prioridade |
| --- | --- | --- | --- | --- |
| **MVP — confiança operacional** | Isolar draft por usuário/estúdio; feedback/empty/error coerentes; acessibilidade dos fluxos; busca/filtros básicos; perfil de cliente com histórico já existente; proteção antiabuso. | Alto | M/L | P0 |
| **Versão 1.1 — rotina de tatuagem** | Pedido de orçamento/consulta; bloqueios por artista; serviço por artista; confirmação/remarcação/cancelamento com histórico; CEP; duplicar serviços entre artistas. | Alto | M/L | P1 |
| **Versão 1.2 — relacionamento e resultado** | Formulários/consentimento, referências privadas por sessão, lembretes/rebooking, indicadores financeiros com drill-down, produtividade por artista, paginação/cache/lazy loading. | Alto | M/L | P1/P2 |
| **Versão 2.0 — plataforma escalável** | Availability Engine, Booking Engine transacional, timezone IANA, snapshot de serviço, testes E2E/RLS, Storage privado, observabilidade, pagamentos/depósitos e waitlist. | Crítico | L | P0 arquitetural |

### Ordem obrigatória de dependências

1. Segurança/RLS, dados e estados de agenda corretos.
2. Availability Engine e Booking Engine antes de prometer disponibilidade avançada, waitlist ou automação de slot.
3. Storage privado/consentimento antes de guardar documentos e fotos sensíveis.
4. Ledger, snapshots e regras de comissão antes de metas/analytics financeiros avançados.
5. Eventos confiáveis antes de SMS/e-mail, pagamentos e automações.

---

## 11. Checklist final de melhorias encontradas

1. [ ] Reordenar Dashboard por urgência operacional: hoje, pendências, ação e saúde.
2. [ ] Tornar métricas clicáveis para listas filtradas de origem.
3. [ ] Definir cada indicador financeiro antes de exibi-lo.
4. [ ] Separar operação diária de análise mensal no Dashboard.
5. [ ] Preservar filtros de agenda/listas por contexto.
6. [ ] Criar atalhos de “novo agendamento”, “novo cliente” e “novo serviço”.
7. [ ] Abrir detalhes contextuais sem perder a agenda/lista de origem.
8. [ ] Agrupar navegação por Operação, Catálogo/Equipe, Gestão, Crescimento e Administração.
9. [ ] Adaptar navegação mobile para manter Agenda e ação primária acessíveis.
10. [ ] Isolar rascunho de onboarding por usuário/estúdio.
11. [ ] Manter onboarding progressivo e configurações avançadas fora do primeiro uso.
12. [ ] Adicionar busca de possível duplicidade de cliente conforme política aprovada.
13. [ ] Evoluir cliente para perfil 360° com linha do tempo.
14. [ ] Adicionar notas internas estruturadas, com autor/data/visibilidade.
15. [ ] Vincular sessões, serviços, artista e próximo passo ao cliente.
16. [ ] Criar pedido de orçamento/consulta como domínio separado de instant booking.
17. [ ] Suportar referências/fotos por sessão com Storage privado e RLS.
18. [ ] Criar formulários e consentimentos digitais versionados.
19. [ ] Permitir serviços, duração e preço por tatuador.
20. [ ] Criar bloqueios, pausas, férias e disponibilidade por tatuador.
21. [ ] Mostrar próxima ação e pendências no perfil do tatuador.
22. [ ] Validar agenda em visão dia/semana por artista.
23. [ ] Definir operação atômica para remarcação e cancelamento.
24. [ ] Registrar motivo e histórico de mudança de status de agendamento.
25. [ ] Implementar confirmação, lembretes e rebooking somente após eventos confiáveis.
26. [ ] Avaliar depósito e política de cancelamento com fornecedor e regras aprovadas.
27. [ ] Implementar proteção antiabuso no booking público.
28. [ ] Construir Availability Engine antes de disponibilidade avançada pública.
29. [ ] Construir Booking Engine transacional antes de garantir ausência de dupla reserva.
30. [ ] Adicionar timezone IANA por estúdio antes de métricas/agenda global confiáveis.
31. [ ] Criar snapshot de serviço no appointment antes de métricas históricas avançadas.
32. [ ] Manter carregamento resiliente por seção e retry específico em todos módulos operacionais.
33. [ ] Padronizar skeleton, empty state, erro, salvar e excluir.
34. [ ] Definir componentes de UI/padrões compartilhados antes de multiplicar telas.
35. [ ] Tratar acessibilidade como critério de aceite: foco, teclado, labels, contraste e feedback.
36. [ ] Adicionar paginação/range, query cache e lazy loading antes da escala de dados.
37. [ ] Testar RLS por papel e isolamento multiestúdio antes de ampliar perfis/documentos.
38. [ ] Adicionar testes E2E de onboarding, agenda, booking, financeiro e concorrência.
39. [ ] Adicionar observabilidade com redaction de PII e métricas de erro/latência.
40. [ ] Manter `category` fora da aplicação; não reintroduzir no catálogo de serviços.

---

## Fontes oficiais consultadas

- [Fresha — recursos para negócios](https://www.fresha.com/for-business/features) e [agenda/booking](https://www.fresha.com/for-business/features/scheduling)
- [Booksy — recursos](https://biz.booksy.com/en-gb/features) e [central de ajuda: recursos principais](https://support.booksy.com/hc/en-us/articles/16460372265106-What-are-Booksy-s-Core-Features)
- [GlossGenius — visão do produto](https://glossgenius.com/overview), [CRM](https://glossgenius.com/client-management) e [agenda](https://glossgenius.com/calendar-scheduling-app)
- [TattooPro — visão geral](https://tattoopro.io/) e [scheduling](https://tattoopro.io/scheduling)
- [HubSpot — dashboards e reporting](https://www.hubspot.com/products/reporting-dashboards), [CRM de contatos](https://www.hubspot.com/products/crm/contact-management?web=1) e [Smart CRM](https://www.hubspot.com/products/crm/ai-crm?from=groupmessage&isappinstalled=0)
- [Linear — modelo conceitual](https://linear.app/docs/conceptual-model), [Insights](https://linear.app/docs/insights) e [opções de visualização](https://linear.app/docs/display-options)
- [Notion — produto](https://www.notion.com/product/notion), [views/filtros](https://www.notion.com/help/views-filters-and-sorts) e [bancos de dados](https://www.notion.com/help/intro-to-databases)

## Próximo passo recomendado

Validar este relatório como direcionamento. Depois, transformar **somente as melhorias de homologação já aprovadas** em blocos pequenos, cada um com especificação, risco, dependências, testes e critério de aceite. Nenhum item desta pesquisa deve ser implementado por inferência.
