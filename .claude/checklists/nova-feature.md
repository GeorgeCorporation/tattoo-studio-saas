# Checklist: Nova Feature

## Pré-Implementação
- [ ] Requisitos claros e documentados?
- [ ] Quais camadas serão afetadas? (page, hook, service, lib, banco)
- [ ] Existe código similar que pode ser reutilizado?
- [ ] Nenhuma dependência nova necessária? (discutir se sim)
- [ ] Plano de implementação revisado?

## Implementação
- [ ] Domain logic em `src/lib/` (código puro testável)
- [ ] Service em `src/services/` seguindo padrão Supabase
- [ ] Hook em `src/hooks/` encapsulando estado e efeitos
- [ ] Página/componente em `src/pages/` ou `src/components/`
- [ ] Rota registrada em `src/routes/index.tsx` (se aplicável)
- [ ] Slugs reservados considerados (se rota pública)
- [ ] Cores Tailwind (nunca hardcoded)
- [ ] Tratamento de erro com `getFriendlyErrorMessage`

## Pós-Implementação
- [ ] Testes escritos (mínimo: domain logic)
- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] `npm run test` passa
- [ ] `npm run build` passa
- [ ] `npm run check` passa (pipeline completa)
