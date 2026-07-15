# Checklist: Code Review

## Arquitetura
- [ ] Segue camadas Page → Hook → Service → Supabase?
- [ ] Altera banco? RLS policy foi considerada?
- [ ] Altera rota? Slugs reservados considerados?
- [ ] Nova dependência? Discutida e justificada?

## Correção
- [ ] Lógica faz sentido para o domínio?
- [ ] Tratamento de erro adequado?
- [ ] Casos de borda considerados? (empty state, erro, loading)
- [ ] Concorrência considerada? (booking, slots)
- [ ] Tipos TypeScript corretos (não `any`)?

## Qualidade
- [ ] Código duplicado evitado?
- [ ] Nomes descritivos?
- [ ] Complexidade acidental evitada?
- [ ] Testes adequados?

## Segurança
- [ ] RLS policy correta para nova tabela/coluna?
- [ ] Rate limit necessário?
- [ ] Dados sensíveis expostos?
- [ ] Validação de entrada adequada?
- [ ] Acesso público via anon key controlado?

## Performance
- [ ] Queries têm índice apropriado?
- [ ] Sem N+1 queries?
- [ ] Paginação considerada (se lista grande)?
- [ ] Lazy loading considerado (se página nova)?
