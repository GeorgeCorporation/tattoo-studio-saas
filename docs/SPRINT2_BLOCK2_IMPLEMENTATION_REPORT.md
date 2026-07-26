# Sprint 2 — Bloco 2: Biblioteca de Serviços

## Status

Concluído e validado em 25/07/2026.

## Entrega

- Catálogo inicial com 10 modelos de serviços.
- Um único componente reutilizável entre Onboarding e módulo Serviços.
- Preenchimento sugerido de nome, duração e descrição.
- Todos os campos sugeridos permanecem editáveis antes do salvamento.
- Preço informado pelo usuário é preservado ao escolher um modelo.
- Confirmação antes de substituir campos personalizados.
- Opção de começar do zero.
- Catálogo orientado a dados: novos modelos podem ser adicionados sem alterar a lógica da interface.
- Campo `category` não foi reintroduzido.
- Nenhuma alteração em banco, migrations, autenticação, permissões ou arquitetura principal.

## Arquivos da implementação

### Criados

- `src/lib/service-templates.ts`
- `src/lib/service-templates.test.ts`
- `src/components/services/ServiceTemplatePicker.tsx`
- `src/components/services/ServiceTemplatePicker.test.tsx`

### Alterados

- `src/pages/services/ServiceModal.tsx`
- `src/pages/services/ServiceModal.test.tsx`
- `src/pages/onboarding/OnboardingPage.tsx`
- `src/pages/onboarding/OnboardingPage.test.tsx`
- `docs/superpowers/specs/2026-07-25-service-library-design.md`

## Testes adicionados

- Integridade e conteúdo do catálogo.
- Ausência de `category` e preço nos modelos.
- Seleção e emissão de uma sugestão.
- Expansão do catálogo por dados, sem mudança na lógica do componente.
- Confirmação antes de substituir campos personalizados.
- Fluxo “Começar do zero”.
- Aplicação do modelo no módulo Serviços com preservação do preço.
- Edição de nome, duração e descrição antes de salvar.
- Biblioteca restrita à criação, sem interferir na edição de serviço existente.
- Aplicação e personalização do modelo no Onboarding.
- Persistência da descrição personalizada no rascunho do Onboarding.
- Proteção de uma duração personalizada restaurada antes da troca de modelo.
- Confirmação aceita e estado acessível do modelo selecionado.
- Envio dos valores personalizados no payload final.

## Riscos e controles

| Risco | Controle aplicado |
|---|---|
| Duplicação entre Onboarding e Serviços | Componente e catálogo únicos |
| Perda de dados já digitados | Confirmação antes da substituição |
| Sobrescrever preço | O seletor não altera preço |
| Reintroduzir `category` | Tipo, catálogo, interface e testes sem o campo |
| Regressão da Sprint 1 | Suíte completa executada |
| Catálogo difícil de ampliar | Modelos isolados em coleção tipada |

## Validação final

| Verificação | Resultado |
|---|---|
| TypeScript (`npm.cmd run typecheck`) | Aprovado |
| ESLint (`npm.cmd run lint`) | Aprovado |
| Testes (`npm.cmd run test`) | 37 arquivos e 193 testes aprovados |
| Build (`npm.cmd run build`) | Aprovado |
| Integridade do diff (`git diff --check`) | Aprovado |

O build apresenta o aviso não bloqueante já conhecido de chunk JavaScript acima de 500 kB. A otimização de bundle pertence ao backlog de performance e não faz parte do Bloco 2.

## Conclusão

O Bloco 2 está concluído, compatível com a Sprint 1 e limitado ao escopo aprovado. Nenhum outro bloco da Sprint 2 foi implementado.
