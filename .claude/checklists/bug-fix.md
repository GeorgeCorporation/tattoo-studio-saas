# Checklist: Bug Fix

## Pré-Fix
- [ ] Bug reproduzido localmente?
- [ ] Causa raiz identificada?
- [ ] Teste de regressão escrito (falha antes do fix)?

## Fix
- [ ] Correção implementada sem alterar comportamento externo
- [ ] Teste de regressão passa
- [ ] Testes existentes ainda passam
- [ ] Verificar se o mesmo bug existe em outros lugares

## Pós-Fix
- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] `npm run test` passa
- [ ] `npm run build` passa
- [ ] 1 commit (não misturar com features)
