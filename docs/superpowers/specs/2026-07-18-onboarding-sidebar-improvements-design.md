# Onboarding e Sidebar — Design das Melhorias

**Data:** 2026-07-18

## Objetivo

Corrigir o limite da descrição do estúdio, simplificar o cadastro inicial de serviços e aplicar a identidade do estúdio na área autenticada, sem alterar banco de dados nem refatorar módulos fora do escopo.

## Escopo

### 1. Descrição do estúdio

- O limite é de exatamente 200 caracteres visuais (grapheme clusters), incluindo texto colado, emojis e acentos combinados.
- O contador e o valor aceito usam a mesma função de contagem.
- O `maxLength` nativo será removido porque ele conta unidades UTF-16 e pode bloquear antes de 200 caracteres visuais.
- Um utilitário pequeno e testável limitará o texto no `onChange`, usando `Intl.Segmenter` nos navegadores suportados. Um fallback por pontos de código evitará falha em navegadores antigos, sem prometer segmentação visual perfeita nesses ambientes fora do suporte.
- Texto acima do limite será truncado em 200 caracteres visuais, sem cortar um emoji ou caractere combinado no meio.

### 2. Serviços no onboarding

- O formulário inicial mostrará somente:
  - nome do serviço;
  - duração média em minutos;
  - preço inicial opcional.
- Categoria, descrição e modelos rápidos não aparecerão no onboarding. Esses dados continuam disponíveis no módulo completo de serviços.
- Novos serviços do onboarding usarão a categoria padrão `Outro` e descrição vazia, preservando o contrato atual do serviço de persistência.
- A duração continuará iniciando em 120 minutos e, quando um serviço for informado, deverá ser um valor válido de pelo menos 30 minutos.
- Com a agenda pública ativa, será obrigatório ter ao menos um tatuador e um serviço válido.
- Com a agenda pública desligada, o onboarding poderá terminar sem tatuador e sem serviço.
- Não haverá desligamento automático da agenda. Se ela estiver ativa sem os dados necessários, o avanço será bloqueado com a mensagem atual orientando o usuário a cadastrar os dados ou desmarcar a opção.
- Rascunhos e setups parciais existentes continuarão sendo carregados. Campos antigos ocultos não serão descartados de serviços já persistidos.

### 3. Identidade do estúdio na sidebar

- A sidebar desktop e o cabeçalho mobile mostrarão `studioName` e `studioLogoUrl` já fornecidos por `getCurrentUserAccess`.
- Quando não houver logo, será exibido um fallback com as iniciais do nome do estúdio.
- Os textos fixos `Inkora` e `Studio SaaS` serão removidos da área autenticada.
- Para tatuadores, a identidade principal continuará sendo a do estúdio; a função do usuário permanece representada pela navegação e permissões existentes.
- `DashboardLayout` será a única origem dos dados de acesso e os passará à `Sidebar`, evitando chamadas duplicadas do hook `useAccess`.
- A marca Inkora continuará no onboarding, login, suporte e demais áreas institucionais.

## Arquitetura e fluxo de dados

1. `useAccess` carrega o contexto do usuário uma vez em `DashboardLayout`.
2. `DashboardLayout` entrega nome, logo e papel do usuário à `Sidebar` e usa os mesmos dados no cabeçalho mobile.
3. O onboarding mantém estado local e rascunho no `localStorage`, como hoje.
4. A validação de obrigatoriedade da agenda permanece em `validateOnboardingStep`.
5. `createStudioOnboarding` continua recebendo serviços no contrato atual; nenhuma migration ou alteração no Supabase será necessária.
6. `studio-brand.service.ts` não precisa ser alterado: o upload e a persistência da URL da logo já estão corretos.

## Componentes e arquivos previstos

- Modificar `src/pages/onboarding/OnboardingPage.tsx`.
- Modificar `src/pages/onboarding/OnboardingPage.test.tsx`.
- Modificar `src/services/onboarding.service.ts` para validar a duração dos serviços informados.
- Modificar `src/services/onboarding.service.test.ts`.
- Criar `src/lib/text-limit.ts` e `src/lib/text-limit.test.ts`.
- Modificar `src/components/layout/Sidebar.tsx`.
- Modificar `src/components/layout/DashboardLayout.tsx`.
- Criar testes de layout/sidebar no padrão Vitest + Testing Library existente.

## Tratamento de erros e estados

- O contador nunca exibirá número superior a 200.
- Texto excedente será limitado imediatamente, inclusive quando colado.
- Agenda ativa sem serviço ou tatuador exibirá erro de validação e não avançará.
- Agenda desligada permitirá finalizar sem criar registros vazios.
- Ausência de logo não quebrará imagem: as iniciais serão usadas.
- Enquanto o acesso estiver carregando, a interface usará o nome padrão `Seu estúdio`, sem reintroduzir a marca institucional no dashboard.

## Testes

O desenvolvimento seguirá TDD, com cada teste observado falhando antes da implementação.

- Utilitário de texto: 200 caracteres simples, emojis, acentos combinados, truncamento e fallback sem erro.
- Onboarding: contador sincronizado, limite exato, colagem acima do limite e serviço com apenas os três campos previstos.
- Validação: agenda ativa exige serviço válido; agenda desligada aceita lista vazia; duração inválida é bloqueada quando há serviço.
- Sidebar/layout: logo e nome do estúdio no desktop e mobile; fallback por iniciais; ausência de `Inkora` e `Studio SaaS` na área autenticada.
- Verificação final: testes direcionados, suíte completa, typecheck, lint e build.

## Fora do escopo

- CEP automático.
- Favicon personalizado.
- Biblioteca de serviços prontos.
- Duplicação de serviços entre tatuadores.
- Menu avançado na logo.
- Alterações de banco de dados.
- Refatorações não necessárias para estes comportamentos.

## Critérios de aceite

- O usuário consegue inserir exatamente 200 caracteres visuais na descrição.
- O contador representa o conteúdo visual real e não bloqueia antes do limite.
- O onboarding exibe apenas nome, duração e preço opcional para o serviço inicial.
- O onboarding termina sem serviço quando a agenda pública está desligada.
- A agenda pública ativa não avança sem tatuador e serviço válidos.
- Dashboard desktop e mobile mostram identidade do estúdio, sem `Inkora` ou `Studio SaaS`.
- Nenhuma regressão nos testes, typecheck, lint ou build.
