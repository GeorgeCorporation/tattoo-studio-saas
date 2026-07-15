# Sprint 01 - Homologação Funcional

## Controle da homologação

| Campo | Valor |
| --- | --- |
| Produto | Inkora Tattoo Studio SaaS |
| Sprint | 01 |
| Ambiente | ______________________________ |
| Data | ____/____/______ |
| Responsável | ______________________________ |
| Versão/commit | ______________________________ |

## Legenda de status

| Status | Significado |
| --- | --- |
| ⬜ Não testado | Cenário ainda não executado. |
| 🟡 Em teste | Cenário em validação, sem resultado conclusivo. |
| ✅ OK | Resultado esperado confirmado. |
| ❌ Bug | Divergência encontrada; registrar evidência e referência do defeito. |

> Preencher `Observações` com dados usados, usuário/role, URL, dispositivo, evidências e, quando aplicável, ID do bug.

## 1. Autenticação

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Login com e-mail e senha válidos. | Usuário autenticado é direcionado ao dashboard, onboarding ou painel de artista conforme seu acesso. | |
| ⬜ Não testado | Login com senha inválida. | Login é bloqueado e uma mensagem de erro compreensível é exibida. | |
| ⬜ Não testado | Login com e-mail inexistente. | Login é bloqueado sem expor dados sobre a existência da conta. | |
| ⬜ Não testado | Repetir falhas de login até atingir o limite local. | Novas tentativas são temporariamente bloqueadas e o usuário recebe orientação clara. | |
| ⬜ Não testado | Cadastro com dados válidos. | Conta é criada e segue para confirmação/callback ou próximo passo previsto. | |
| ⬜ Não testado | Cadastro com senha abaixo do mínimo. | Cadastro é bloqueado com mensagem de validação. | |
| ⬜ Não testado | Cadastro usando e-mail já registrado. | Sistema informa o problema sem criar conta duplicada. | |
| ⬜ Não testado | Recuperação de senha. | Fluxo de recuperação está acessível e envia/informa corretamente a redefinição de senha. | |
| ⬜ Não testado | Logout. | Sessão é encerrada, dados privados deixam de estar acessíveis e usuário volta à área pública/login. | |
| ⬜ Não testado | Acesso a rota privada após expiração/remoção da sessão. | Usuário é redirecionado ao login sem exibir conteúdo privado. | |

## 2. Onboarding

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Acessar onboarding com conta nova sem estúdio. | Página de onboarding abre e permite concluir a configuração inicial. | |
| ⬜ Não testado | Criar estúdio com nome e slug válidos. | Estúdio é criado com slug único e usuário torna-se manager. | |
| ⬜ Não testado | Informar slug reservado ou já utilizado. | Salvamento é bloqueado com mensagem clara. | |
| ⬜ Não testado | Configurar cidade, endereço e contatos. | Dados são persistidos e exibidos corretamente depois de recarregar. | |
| ⬜ Não testado | Configurar horários de funcionamento. | Sete dias são salvos; dias fechados e horários definidos refletem no booking público. | |
| ⬜ Não testado | Criar artista inicial. | Artista pertence ao estúdio criado e fica disponível nas áreas internas/públicas conforme status. | |
| ⬜ Não testado | Criar serviço inicial. | Serviço fica associado ao estúdio e disponível para agendamento quando ativo. | |
| ⬜ Não testado | Concluir onboarding e atualizar a página. | Usuário é direcionado ao dashboard e não retorna ao onboarding indevidamente. | |

## 3. Dashboard

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Abrir dashboard de manager. | Métricas, próximos agendamentos e checklist carregam sem erro. | |
| ⬜ Não testado | Validar contadores de agenda diária e semanal. | Valores correspondem aos registros do estúdio logado. | |
| ⬜ Não testado | Validar faturamento mensal. | Total considera pagamentos do período e respeita o estúdio logado. | |
| ⬜ Não testado | Validar total de clientes. | Total corresponde à base do estúdio logado. | |
| ⬜ Não testado | Alterar status de agendamento pelo dashboard. | Status é salvo e a lista/métricas são atualizadas. | |
| ⬜ Não testado | Abrir dashboard sem dados iniciais. | Estados vazios são compreensíveis e não há falha visual. | |

## 4. Clientes

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Listar clientes do estúdio. | Somente clientes autorizados são exibidos. | |
| ⬜ Não testado | Cadastrar cliente com campos obrigatórios. | Cliente é salvo e aparece na listagem. | |
| ⬜ Não testado | Cadastrar cliente com dados opcionais. | Telefone, e-mail, Instagram e observações são persistidos corretamente. | |
| ⬜ Não testado | Editar cliente existente. | Alterações são salvas e permanecem após recarregar. | |
| ⬜ Não testado | Abrir perfil do cliente. | Histórico e informações pertencem ao cliente e ao estúdio corretos. | |
| ⬜ Não testado | Tentar acessar cliente de outro estúdio por URL. | Acesso é negado ou registro não é encontrado. | |

## 5. Artistas

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Listar artistas do estúdio. | Apenas artistas do estúdio atual são exibidos. | |
| ⬜ Não testado | Cadastrar artista ativo com dados válidos. | Artista é salvo, recebe slug válido e aparece nas listas necessárias. | |
| ⬜ Não testado | Editar perfil de artista. | Dados de perfil são atualizados sem criar duplicidade. | |
| ⬜ Não testado | Ativar e desativar artista. | Status é salvo e disponibilidade pública respeita o status. | |
| ⬜ Não testado | Enviar convite de acesso ao artista. | Convite é criado com token, validade e e-mail corretos. | |
| ⬜ Não testado | Ativar conta pelo link de convite. | Usuário autenticado é vinculado ao artista correto e acessa somente o painel permitido. | |
| ⬜ Não testado | Revogar ou reenviar convite. | Convite anterior deixa de ser utilizável e novo convite funciona conforme esperado. | |
| ⬜ Não testado | Enviar foto e galeria do artista. | Arquivos são enviados, exibidos e vinculados ao artista correto. | |

## 6. Agenda

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Listar agendamentos do período. | Agenda mostra somente dados autorizados e datas corretas. | |
| ⬜ Não testado | Criar agendamento interno com cliente existente. | Agendamento é salvo com artista, serviço, data, hora e status válidos. | |
| ⬜ Não testado | Criar agendamento interno com novo cliente. | Cliente e agendamento são criados corretamente, sem registros órfãos em caso de erro. | |
| ⬜ Não testado | Tentar usar horário já ocupado para o mesmo artista. | Operação é bloqueada pelo sistema e pelo banco. | |
| ⬜ Não testado | Alterar status do agendamento. | Novo status é persistido e refletido nas telas dependentes. | |
| ⬜ Não testado | Validar agenda como artista. | Artista visualiza apenas agendamentos e clientes permitidos pelo seu acesso. | |
| ⬜ Não testado | Criar agendamento em data passada ou dia fechado. | Operação é bloqueada com feedback adequado. | |

## 7. Serviços

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Listar serviços. | Serviços pertencem ao estúdio atual e carregam corretamente. | |
| ⬜ Não testado | Criar serviço com nome, preço e duração. | Serviço é salvo com os valores informados. | |
| ⬜ Não testado | Editar serviço. | Dados atualizados permanecem após recarregar. | |
| ⬜ Não testado | Ativar e desativar serviço. | Serviço inativo não fica disponível no booking público. | |
| ⬜ Não testado | Usar serviço de outro estúdio por manipulação de URL/requisição. | Operação é negada pelo controle de acesso. | |

## 8. Booking Público

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Abrir página pública de estúdio por slug válido. | Dados públicos do estúdio carregam sem expor informações privadas. | |
| ⬜ Não testado | Abrir página de artista pública. | Perfil, galeria e links são exibidos somente quando o artista está ativo. | |
| ⬜ Não testado | Abrir slug inexistente ou reservado. | Página não encontrada/erro adequado é exibido. | |
| ⬜ Não testado | Escolher data em dia aberto. | Apenas horários disponíveis do artista selecionado são oferecidos. | |
| ⬜ Não testado | Escolher data passada ou dia fechado. | Não há horário disponível nem possibilidade de concluir booking. | |
| ⬜ Não testado | Criar booking público válido. | Cliente e agendamento pending são criados no estúdio/artista/serviço corretos. | |
| ⬜ Não testado | Enviar referência de imagem no booking. | Arquivo válido é armazenado no caminho correto e associado ao agendamento. | |
| ⬜ Não testado | Tentar reservar horário simultaneamente em duas sessões. | Apenas uma reserva é aceita; a outra recebe erro de conflito. | |

## 9. Galeria

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Listar imagens da galeria do estúdio. | Somente itens do estúdio atual aparecem. | |
| ⬜ Não testado | Enviar imagem válida. | Imagem é salva no Storage, vinculada ao banco e exibida. | |
| ⬜ Não testado | Associar imagem a artista. | Associação é salva e aparece no perfil público/interno correto. | |
| ⬜ Não testado | Remover imagem. | Registro e arquivo correspondente são removidos sem afetar outros itens. | |
| ⬜ Não testado | Enviar arquivo inválido ou acima do limite. | Upload é bloqueado antes de persistir arquivo/registro. | |

## 10. Entregas

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Criar entrega para cliente/agendamento. | Entrega recebe token único e fica associada ao estúdio e cliente corretos. | |
| ⬜ Não testado | Enviar fotos para entrega. | Fotos são armazenadas e listadas na entrega correta. | |
| ⬜ Não testado | Abrir link público de entrega válido. | Cliente visualiza somente a entrega vinculada ao token. | |
| ⬜ Não testado | Abrir token inválido ou expirado. | Conteúdo não é exposto e uma mensagem adequada é exibida. | |
| ⬜ Não testado | Excluir foto de entrega. | Foto deixa de aparecer e arquivo é removido sem afetar outras entregas. | |
| ⬜ Não testado | Acessar entrega de outro estúdio internamente. | Acesso é negado. | |

## 11. Financeiro

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Listar pagamentos e resumo financeiro. | Valores pertencem ao estúdio atual e totais são coerentes. | |
| ⬜ Não testado | Registrar pagamento válido. | Pagamento é salvo com valor, tipo, método e data corretos. | |
| ⬜ Não testado | Registrar pagamento ligado a agendamento. | Vínculo é persistido e aparece nas áreas relacionadas. | |
| ⬜ Não testado | Criar regra de comissão de artista. | Regra é salva com percentual, período e teto configurados. | |
| ⬜ Não testado | Validar cálculo de comissão sem teto. | Comissão corresponde ao percentual sobre a base prevista. | |
| ⬜ Não testado | Validar cálculo de comissão com teto mensal. | Comissão é limitada conforme a regra configurada. | |
| ⬜ Não testado | Excluir/estornar operação com falha parcial. | Não permanecem registros financeiros inconsistentes. | |

## 12. Perfil

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Abrir perfil de artista. | Dados, galeria, próximos agendamentos e status de acesso carregam corretamente. | |
| ⬜ Não testado | Atualizar dados de perfil do artista. | Atualização é persistida e não altera dados de outro artista. | |
| ⬜ Não testado | Alterar foto de perfil do artista. | Nova foto aparece; arquivo anterior é tratado corretamente. | |
| ⬜ Não testado | Abrir perfil de cliente. | Informações e histórico do cliente são exibidos com autorização adequada. | |

## 13. Configurações

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Abrir configurações do estúdio. | Dados atuais do estúdio são carregados. | |
| ⬜ Não testado | Atualizar nome, descrição, contatos e endereço. | Dados são persistidos e refletidos nas páginas públicas pertinentes. | |
| ⬜ Não testado | Alterar slug do estúdio. | Slug único é salvo; links públicos passam a funcionar no novo endereço. | |
| ⬜ Não testado | Enviar ou substituir logo. | Logo é exibido corretamente e arquivo anterior é tratado conforme a regra definida. | |
| ⬜ Não testado | Tentar salvar slug reservado/duplicado. | Alteração é bloqueada sem perda dos dados anteriores. | |

## 14. Permissões

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Acessar rotas de manager com usuário manager. | Rotas permitidas carregam normalmente. | |
| ⬜ Não testado | Acessar rotas de manager com usuário artist. | Usuário é redirecionado ao painel permitido. | |
| ⬜ Não testado | Acessar rotas de artista com usuário manager. | Usuário é redirecionado ao dashboard permitido. | |
| ⬜ Não testado | Acessar rota privada sem autenticação. | Usuário é enviado ao login. | |
| ⬜ Não testado | Manipular IDs de cliente, artista, pagamento e entrega na URL. | RLS e aplicação impedem leitura/alteração entre estúdios. | |
| ⬜ Não testado | Acessar painel do artista após convite revogado. | Acesso deixa de ser autorizado. | |

## 15. Storage

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Enviar logo em formato e tamanho permitidos. | Upload é aceito, caminho usa o estúdio correto e URL funciona. | |
| ⬜ Não testado | Enviar imagem de artista, galeria, booking e entrega. | Cada arquivo usa bucket e path esperados. | |
| ⬜ Não testado | Enviar arquivo com extensão, MIME ou tamanho inválido. | Upload é recusado sem criar registro inconsistente. | |
| ⬜ Não testado | Excluir arquivo autorizado. | Arquivo é removido do bucket e a interface é atualizada. | |
| ⬜ Não testado | Tentar gravar/remover arquivo em path de outro estúdio. | Policy de Storage bloqueia a operação. | |
| ⬜ Não testado | Validar leitura pública de assets previstos. | Apenas arquivos públicos planejados ficam acessíveis por URL. | |

## 16. Responsividade

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Validar landing e páginas públicas em 320 px, 768 px e desktop. | Conteúdo permanece legível, navegável e sem sobreposição. | |
| ⬜ Não testado | Validar login, cadastro e onboarding em mobile. | Formulários são utilizáveis, campos visíveis e teclado não bloqueia ações. | |
| ⬜ Não testado | Validar dashboard e sidebar em mobile. | Navegação adapta-se sem ocultar ações essenciais. | |
| ⬜ Não testado | Validar modais de clientes, artistas, agenda, serviços e financeiro. | Modal cabe na viewport, permite rolagem e todos os controles ficam acessíveis. | |
| ⬜ Não testado | Validar tabelas, listas e cartões em telas estreitas. | Dados críticos não ficam truncados ou inacessíveis. | |

## 17. Performance

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Carregar landing e página pública em conexão móvel simulada. | Conteúdo principal aparece em prazo aceitável e sem bloqueios perceptíveis. | |
| ⬜ Não testado | Abrir dashboard com base de dados representativa. | Tela carrega sem travamento e apresenta estados de carregamento adequados. | |
| ⬜ Não testado | Navegar entre módulos internos. | Navegação não provoca erros, recarregamentos indevidos ou latência excessiva. | |
| ⬜ Não testado | Abrir galeria e entregas com várias imagens. | Imagens não impedem a interação; carregamento é progressivo quando aplicável. | |
| ⬜ Não testado | Validar bundle de produção. | Build não apresenta regressão relevante de tamanho ou alertas críticos sem plano de ação. | |

## 18. Segurança

| Status | Descrição | Resultado esperado | Observações |
| --- | --- | --- | --- |
| ⬜ Não testado | Validar headers HTTP em produção/homologação. | CSP, HSTS, proteção contra frame, nosniff e políticas de permissões estão presentes conforme configurado. | |
| ⬜ Não testado | Validar RLS em tabelas principais com usuários de estúdios diferentes. | Nenhum usuário lê ou altera dados de outro estúdio. | |
| ⬜ Não testado | Validar RLS de Storage com paths de estúdios diferentes. | Upload, delete e leitura respeitam as policies configuradas. | |
| ⬜ Não testado | Validar proteção de rotas privadas e sessão expirada. | Conteúdo privado não é renderizado sem acesso válido. | |
| ⬜ Não testado | Validar booking público contra dados inválidos. | Datas passadas, artista/serviço inativo e conflito de horário são recusados. | |
| ⬜ Não testado | Validar uploads maliciosos ou inválidos. | MIME, extensão e limite de tamanho são aplicados. | |
| ⬜ Não testado | Revisar variáveis de ambiente e build público. | Nenhuma chave privilegiada/service role é exposta ao cliente. | |
| ⬜ Não testado | Validar logs de eventos críticos. | Falhas de autenticação, bloqueios e eventos relevantes são registrados conforme a estratégia atual. | |

## Encerramento

| Item | Registro |
| --- | --- |
| Cenários executados | ____ de ____ |
| Cenários OK | ____ |
| Bugs encontrados | ____ |
| Bloqueadores para aceite | ______________________________ |
| Decisão final | ⬜ Aprovado  ⬜ Aprovado com ressalvas  ⬜ Reprovado |
| Responsável pelo aceite | ______________________________ |
| Data do aceite | ____/____/______ |
