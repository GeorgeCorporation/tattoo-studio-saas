# Checklist: Deploy

## Pré-Deploy
- [ ] Branch atualizada com main
- [ ] `npm run check` passa (typecheck + lint + test + build)
- [ ] Nenhum TODO/FIXME crítico no código a ser deployado
- [ ] Variáveis de ambiente verificadas
- [ ] Secrets configurados no Cloudflare

## Deploy
- [ ] Push para main (trigger CI/CD)
- [ ] CI/CD verde em todos os 5 jobs
- [ ] Cloudflare Pages build successful

## Pós-Deploy
- [ ] Aplicação carrega (navegador)
- [ ] Login funcional
- [ ] Rotas principais funcionam
- [ ] Nenhum erro 500/404 inesperado
- [ ] Observability não mostra erros novos
