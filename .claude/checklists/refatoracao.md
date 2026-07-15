# Checklist: Refatoração

## Pré-Refatoração
- [ ] Testes existentes cobrem o código a ser refatorado?
- [ ] Se não, testes escritos primeiro (cobrindo comportamento atual)
- [ ] Comportamento externo claramente definido (o que NÃO vai mudar)

## Durante
- [ ] Refatoração em etapas pequenas e verificáveis
- [ ] `npm run typecheck` passa após cada etapa
- [ ] `npm run test` passa após cada etapa
- [ ] Imports atualizados em todos os arquivos dependentes
- [ ] Nomes de função/variável descritivos

## Pós-Refatoração
- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] `npm run test` passa
- [ ] `npm run build` passa
- [ ] Código duplicado removido
- [ ] Comportamento externo preservado
- [ ] 1 commit (não misturar com features)
