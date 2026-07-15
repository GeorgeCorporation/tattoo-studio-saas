# Checklist: Performance

## Bundle
- [ ] React.lazy() implementado para páginas?
- [ ] Suspense com fallback?
- [ ] Bundle analisado (tamanho, pacotes grandes)?
- [ ] Imports tree-shakeable?

## Queries
- [ ] Cache implementado (React Query ou manual)?
- [ ] Timeout em queries Supabase?
- [ ] Paginação em listas grandes (clients, appointments)?
- [ ] Sem N+1 queries?
- [ ] Query duplicada evitada (deduplicação)?

## Renderização
- [ ] useMemo para cálculos caros?
- [ ] useCallback para handlers passados para filhos?
- [ ] key correta em listas?
- [ ] Lazy loading de imagens (loading="lazy")?
- [ ] Debounce em inputs de busca?

## Gargalos Conhecidos
- [ ] Dashboard: 6 queries podem ser agregadas?
- [ ] Agenda: appointments do dia podem ser paginados?
- [ ] Sidebar: useMemo implementado?
- [ ] Inputs sem debounce identificados?
