# Checklist: Release

## Preparação
- [ ] Versão atualizada em package.json?
- [ ] CHANGELOG.md atualizado?
- [ ] Roadmap atualizado?
- [ ] Documentação relevante atualizada?

## Verificação
- [ ] `npm run check` passa (typecheck + lint + test + build)
- [ ] Todos os testes de regressão passam
- [ ] Bug críticos conhecidos estão documentados
- [ ] Variáveis de ambiente configuradas no Cloudflare
- [ ] Secrets atualizados no Cloudflare Dashboard

## Pós-Release
- [ ] Deploy publicado no Cloudflare Pages
- [ ] Smoke test: página carrega, login funcional
- [ ] Monitoramento de erros ativo
- [ ] Observability verificado
