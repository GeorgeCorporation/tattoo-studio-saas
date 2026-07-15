# /review

## Objetivo

Revisar o diff atual (staged + unstaged) contra as regras do projeto.

## Entrada

- Código modificado (git diff)

## Processo

1. Executar `git diff` para staged + unstaged
2. Verificar contra as regras:
   - [ ] Segue camadas Page → Hook → Service?
   - [ ] Cores hardcoded foram evitadas?
   - [ ] Tratamento de erro com getFriendlyErrorMessage?
   - [ ] Queries Supabase têm error handling?
   - [ ] Tipos TypeScript corretos?
   - [ ] Nomes seguem padrão do projeto?
   - [ ] `any` foi evitado?
   - [ ] `window.setTimeout` foi evitado?
   - [ ] Barrel files vazios foram evitados?
   - [ ] Slugs reservados foram considerados?
3. Reportar problemas encontrados

## Saída Esperada

- Lista de problemas categorizados por severidade (🔴 🟠 🟡 🟢)
- Sugestão de correção para cada problema
- OK se nenhum problema encontrado

## Regras

- Revisão técnica, não pessoal
- Foco em regras do projeto, não preferências de estilo
- Sugerir correção, não apenas apontar problema
