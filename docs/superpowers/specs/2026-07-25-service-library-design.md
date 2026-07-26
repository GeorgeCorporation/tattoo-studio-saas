# Biblioteca de Serviços — Especificação Funcional

> **Status:** aprovado para implementação.  
> **Escopo:** Sprint 2, Bloco 2 — item S2.01.  
> **Superfícies:** Onboarding e módulo Serviços.  
> **Restrição:** este documento não autoriza implementação.

## Decisão de experiência

Foram consideradas três abordagens:

1. **Seletor compartilhado dentro do fluxo atual de criação — escolhida.** Mantém o usuário no contexto, reaproveita os formulários existentes e não cria nova rota.
2. **Tela ou etapa exclusiva para a biblioteca.** Dá mais espaço ao catálogo, mas aumenta navegação e complexidade para um catálogo inicial pequeno.
3. **Lista suspensa simples.** Tem implementação visual menor, porém dificulta comparar nome, duração e descrição dos modelos.

A solução escolhida será um único seletor reutilizável, exibido no início da criação de serviço. O catálogo, os dados emitidos e as regras de seleção serão os mesmos no Onboarding e no módulo Serviços.

O catálogo será definido como dados independentes da interface. Adicionar um novo modelo exigirá apenas incluir um item nessa coleção, sem alterar a lógica do seletor ou dos formulários consumidores.

# 1. Objetivo da Biblioteca de Serviços

A Biblioteca de Serviços reduz o esforço necessário para configurar um catálogo inicial. Hoje o usuário precisa conhecer e preencher manualmente nome e duração mesmo para serviços comuns.

A biblioteca oferecerá modelos prontos como ponto de partida, sem transformar modelos em regras obrigatórias.

Benefícios esperados:

- acelerar o primeiro cadastro;
- reduzir dúvidas sobre duração inicial;
- diminuir erros de preenchimento;
- manter liberdade para personalização;
- oferecer a mesma experiência no Onboarding e no módulo Serviços;
- preservar todas as validações criadas na Sprint 1.

# 2. Fluxo do usuário

## 2.1 Criação a partir de um modelo

1. O usuário seleciona **Adicionar serviço**.
2. O sistema apresenta:
   - **Começar do zero**;
   - os modelos disponíveis na Biblioteca de Serviços.
3. Cada modelo mostra nome e duração sugerida.
4. O usuário seleciona um modelo.
5. O sistema preenche:
   - nome;
   - duração média;
   - descrição, quando existente.
6. O preço inicial permanece vazio, pois não faz parte do modelo.
7. O usuário pode alterar qualquer campo preenchido.
8. O usuário salva.
9. O formulário utiliza as validações e o fluxo de persistência já existentes.

## 2.2 Criação manual

1. O usuário seleciona **Adicionar serviço**.
2. Seleciona **Começar do zero** ou ignora os modelos.
3. Preenche manualmente nome, duração, preço opcional e descrição opcional.
4. Salva utilizando as mesmas regras atuais.

## 2.3 Troca de modelo

- Selecionar outro modelo substitui somente nome, duração e descrição.
- O preço informado pelo usuário não é apagado ou alterado.
- Se nome, duração ou descrição já tiverem sido personalizados, o sistema solicita confirmação antes de substituí-los.
- Após a substituição, todos os campos continuam editáveis.

## 2.4 Edição de serviço existente

- A biblioteca não será exibida ao editar um serviço existente.
- A edição continuará utilizando o formulário e as regras atuais.
- Essa restrição evita substituir acidentalmente um serviço já cadastrado.

# 3. Interface proposta

```text
Adicionar serviço
        ↓
Como deseja começar?
┌──────────────────────┐
│ Começar do zero      │
└──────────────────────┘

Modelos sugeridos
┌──────────────────────┐  ┌──────────────────────┐
│ Fine Line            │  │ Blackwork            │
│ Duração: 90 min      │  │ Duração: 180 min     │
└──────────────────────┘  └──────────────────────┘
        ↓
Modelo selecionado
        ↓
Nome              [Fine Line             ]
Duração média     [90                   ] min
Preço inicial     [                     ] opcional
Descrição         [Traços finos...       ] opcional
        ↓
Usuário ajusta os campos
        ↓
Salvar
```

## Comportamento do componente compartilhado

- Mesmo catálogo nos dois fluxos.
- Mesma ordem dos modelos.
- Mesmos nomes, durações e descrições.
- Mesmo estado visual para modelo selecionado.
- Mesma ação **Começar do zero**.
- Mesma regra de confirmação antes de substituir campos personalizados.
- Seleção acessível por mouse e teclado.
- O componente apenas entrega os valores sugeridos ao formulário.
- O componente não salva dados nem acessa Supabase.

## Compatibilidade com o Onboarding simplificado

- O Onboarding continua priorizando nome, duração e preço.
- A descrição permanece opcional.
- Quando um modelo contém descrição, ela é preenchida e pode ser editada.
- Sem modelo selecionado, o usuário pode manter a descrição vazia.
- A biblioteca não torna nenhum novo campo obrigatório.

# 4. Catálogo inicial

Todos os tempos são sugestões iniciais e respeitam a regra atual de duração inteira mínima de 30 minutos.

| Nome | Duração sugerida | Descrição opcional |
| --- | ---: | --- |
| Fine Line | 90 min | Tatuagem com linhas finas, delicadas e detalhes precisos. |
| Blackwork | 180 min | Tatuagem desenvolvida predominantemente com tinta preta e áreas de alto contraste. |
| Old School | 180 min | Tatuagem com traços marcados, composição clássica e cores sólidas. |
| Realismo | 240 min | Tatuagem focada em profundidade, luz, sombra e reprodução detalhada da referência. |
| Aquarela | 240 min | Tatuagem com transições de cor e efeitos visuais inspirados em pintura aquarelada. |
| Cover Up | 240 min | Projeto desenvolvido para cobrir ou transformar uma tatuagem existente. |
| Fechamento | 300 min | Sessão destinada à composição ou continuidade de uma área extensa do corpo. |
| Lettering | 90 min | Tatuagem de palavras, frases ou letras com desenho tipográfico personalizado. |
| Minimalista | 60 min | Tatuagem de composição simples, poucos elementos e acabamento limpo. |
| Tribal | 180 min | Tatuagem composta por formas marcadas, padrões e linhas de alto contraste. |

O catálogo não contém preço nem categoria.

# 5. Regras

## 5.1 Regras funcionais

- O uso de modelo é opcional.
- O usuário pode editar qualquer campo.
- O usuário pode criar um serviço totalmente manual.
- Os modelos são sugestões e não representam valores obrigatórios.
- O preço inicial nunca é definido pelo modelo.
- Selecionar um modelo não salva o serviço automaticamente.
- Somente a ação **Salvar** persiste os dados.
- Modelos não são registros do banco e não aparecem na listagem como serviços cadastrados.
- O catálogo inicial é igual para todos os estúdios.
- A biblioteca aparece apenas na criação, não na edição de serviço existente.

## 5.2 Regras de domínio preservadas

- Nome continua obrigatório.
- Duração continua inteira, finita e com mínimo de 30 minutos.
- Preço continua opcional, finito e maior ou igual a zero quando informado.
- Preço `0` continua válido.
- Descrição continua opcional.
- As validações existentes de `service-domain.ts` permanecem como fonte de verdade.
- O Service continua validando os dados antes da persistência.
- Não serão criadas regras de duplicidade de nome nesta entrega.

## 5.3 Regra sobre `category`

- `category` não será incluída no catálogo.
- `category` não será exibida na interface.
- `category` não será adicionada a tipos, estados, helpers ou payloads.
- A coluna existente no banco permanece intocada por compatibilidade.

## 5.4 Dados e segurança

- Nenhum modelo acessa Supabase.
- Nenhum modelo contém dado de usuário ou estúdio.
- Nenhuma migration é necessária.
- RLS e políticas atuais não serão alteradas.
- A persistência continuará limitada pelo `studioId` e pelo Service existente.

# 6. Impacto técnico

## Arquivos novos prováveis

| Arquivo | Responsabilidade |
| --- | --- |
| `src/lib/service-templates.ts` | Catálogo imutável, tipo do modelo e obtenção dos dados sugeridos. |
| `src/lib/service-templates.test.ts` | Validar catálogo, durações e ausência de preço/categoria. |
| `src/components/services/ServiceTemplatePicker.tsx` | Componente reutilizável de seleção. |
| `src/components/services/ServiceTemplatePicker.test.tsx` | Validar seleção, modo manual, teclado e confirmação de substituição. |

## Arquivos existentes provavelmente alterados

| Arquivo | Alteração prevista |
| --- | --- |
| `src/pages/services/ServiceModal.tsx` | Exibir o seletor somente durante a criação e aplicar a sugestão aos campos. |
| `src/pages/services/ServiceModal.test.tsx` | Cobrir preenchimento por modelo, edição posterior e preservação do preço. |
| `src/pages/onboarding/OnboardingPage.tsx` | Usar o mesmo seletor e aplicar os mesmos valores ao serviço inicial. |
| `src/pages/onboarding/OnboardingPage.test.tsx` | Cobrir comportamento idêntico e preservação das regras da Sprint 1. |
| `src/components/index.ts` | Exportar o componente, somente se o padrão atual exigir. |

## Arquivos que não devem ser alterados

- `src/lib/database.sql`;
- migrations;
- políticas RLS;
- autenticação;
- Agenda;
- Financeiro;
- `src/types/database.types.ts`;
- `services.category`.

## Fluxo técnico preservado

```text
Catálogo puro em src/lib
          ↓
ServiceTemplatePicker compartilhado
          ↓
Formulário do Onboarding ou ServiceModal
          ↓
service-domain.ts
          ↓
services.service.ts / onboarding.service.ts
          ↓
Supabase
```

O seletor não duplica validação nem persistência. Ele apenas fornece valores iniciais.

# 7. Plano de implementação

## Etapa 1 — Catálogo e contrato

1. Criar testes para o catálogo.
2. Confirmar falha inicial dos testes.
3. Criar o tipo `ServiceTemplate`.
4. Criar o catálogo imutável com os dez modelos aprovados.
5. Garantir por tipos e testes que preço e categoria não fazem parte do contrato.

## Etapa 2 — Componente reutilizável

1. Criar testes de comportamento do seletor.
2. Implementar o componente compartilhado.
3. Cobrir:
   - seleção de modelo;
   - começar do zero;
   - navegação por teclado;
   - estado selecionado;
   - confirmação antes de substituir campos personalizados.

## Etapa 3 — Integração no módulo Serviços

1. Criar testes no `ServiceModal`.
2. Exibir o seletor apenas em **Adicionar serviço**.
3. Preencher nome, duração e descrição.
4. Preservar preço atual.
5. Garantir que o usuário consiga editar todos os campos.
6. Manter criação manual e edição existentes.

## Etapa 4 — Integração no Onboarding

1. Criar testes no Onboarding.
2. Usar o mesmo seletor da Etapa 2.
3. Aplicar exatamente os mesmos valores do modelo.
4. Manter descrição opcional.
5. Garantir persistência no draft isolado implementado no Bloco 1.
6. Preservar criação manual, múltiplos serviços e agenda pública opcional.

## Etapa 5 — Regressão e aceite

1. Executar testes específicos do catálogo, componente, Serviços e Onboarding.
2. Executar suíte completa.
3. Executar typecheck.
4. Executar lint.
5. Executar build.
6. Verificar que nenhum arquivo de banco, migration, RLS ou outro bloco foi alterado.

## Critérios de aceite

- Biblioteca visível na criação do Onboarding e do módulo Serviços.
- Um único componente e um único catálogo são reutilizados.
- Selecionar o mesmo modelo produz os mesmos valores nos dois fluxos.
- Usuário pode editar qualquer valor sugerido.
- Criação manual continua disponível.
- Preço não é preenchido nem apagado pelo modelo.
- Edição de serviço existente continua inalterada.
- Regras atuais do domínio continuam válidas.
- `category` não aparece em código da aplicação relacionado à funcionalidade.
- Nenhuma migration ou alteração de banco é criada.
- Todos os testes, typecheck, lint e build passam.
