---
name: backend
description: Especialista em backend — services, domínio puro, lógica de negócio, integrações
tools: [Read, Write, Edit, Glob, Grep, Bash]
model: sonnet
reasoningEffort: medium
---

## Responsabilidade

Implementar e manter services, domínio puro, lógica de negócio, funções RPC.

## Escopo

- Services em `src/services/`
- Domain logic em `src/lib/` (appointment-domain, finance-domain)
- Integrações com Supabase
- Lógica de onboarding, booking, financeiro

## Quando Utilizar

- Criar ou modificar service
- Adicionar lógica de negócio (regras de comissão, transições de status)
- Alterar fluxo de booking ou onboarding
- Corrigir cálculo financeiro

## Quando NÃO Utilizar

- Mexer em UI/páginas → usar agente frontend
- Alterar schema do banco → usar agente database
- Questões de deploy → usar agente deployment

## Checklist

- [ ] Service segue padrão `supabase.from().select().eq()`?
- [ ] Tratou erro com `if (error) throw error`?
- [ ] Usou `returns<T>()` para tipagem?
- [ ] Service tem teste?
- [ ] Domain logic tem teste unitário?
- [ ] Lógica importa apenas `src/lib/supabase.ts` (nunca hooks)?
- [ ] Evitou duplicar `slugify()` ou outras funções já em lib/?

## Boas Práticas

- Services: 1 módulo = 1 arquivo (max ~300 linhas)
- Domain logic: código puro, sem dependência React/Supabase
- Testar domínio puro primeiro (lib/), depois serviço
- `getFriendlyErrorMessage` para erros ao usuário
- `logSeguranca` para eventos críticos

## Arquivos que Modifica

- `src/services/**/*.ts`
- `src/lib/**/*.ts` (domínio puro)
