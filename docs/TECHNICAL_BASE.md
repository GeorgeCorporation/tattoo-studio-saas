# Base Tecnica

## Comandos Obrigatorios

Antes de publicar ou enviar mudancas importantes, rode:

```bash
npm ci
npm run check
```

O comando `npm run check` valida:

- TypeScript
- ESLint
- Vitest
- Build de producao

## Deploy

- Node.js: 22.x
- Build command: `npm run build`
- Output: `dist`
- Cloudflare usa SPA fallback pelo `wrangler.jsonc`

## Variaveis De Ambiente

Obrigatorias:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Essas chaves sao publicas do frontend. Nunca adicionar service role key no projeto.

## Seguranca Supabase

- RLS ativo em todas as tabelas principais.
- Dados privados dependem do `studio_id` pertencer ao usuario logado.
- Paginas publicas leem apenas dados publicos de estudio, tatuadores, galeria e reviews.
- Storage tem buckets publicos para imagens; uploads administrativos exigem usuario autenticado.

## Proximos Reforcos Recomendados

- Gerar tipos do Supabase automaticamente via CLI quando houver token de acesso.
- Reforcar policies de Storage validando o caminho com `studioId`.
- Adicionar testes de integracao para onboarding e agendamento com mocks do Supabase.
- Configurar branch protection no GitHub exigindo CI verde antes de merge.
