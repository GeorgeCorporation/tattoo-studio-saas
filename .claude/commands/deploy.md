# /deploy

## Objetivo

Preparar e verificar deploy para produção.

## Entrada

- Branch a ser deployada (geralmente main)

## Processo

1. Verificar que branch está atualizada com main/master
2. Rodar `npm run check` (typecheck + lint + test + build)
3. Verificar variáveis de ambiente em `wrangler.jsonc`
4. Verificar secrets no Cloudflare Dashboard
5. Fazer push para main (triggers CI/CD)

## Saída Esperada

- CI/CD passa verde
- Deploy publicado no Cloudflare Pages
- Smoke test: página carrega, login funcional

## Regras

- Sempre rodar `npm run check` antes
- Não deployar com testes falhando
- Verificar ambiente de produção (não staging acidental)
- Monitorar erros pós-deploy (observability)
