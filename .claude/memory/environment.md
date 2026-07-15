---
name: environment
description: Variáveis de ambiente — .env, modo mock, secrets, tipos
metadata:
  type: project
---

# Environment

## Visão Geral

Variáveis de ambiente no padrão Vite (prefixo `VITE_`). `.env` e `.env.production` commitados com chaves reais. Modo mock via query param.

## Variáveis

| Variável | Presente | Uso |
|----------|---------|-----|
| `VITE_SUPABASE_URL` | `.env`, `.env.production`, wrangler.jsonc | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `.env`, `.env.production`, wrangler.jsonc | Chave anônima Supabase |
| `VITE_USE_MOCK` | Não definido (default false) | Ativa modo mock |
| `SUPABASE_PROJECT_ID` | `.env.example` apenas | Para script de geração de tipos |

## Modo Mock

- Ativado por: query param `?mock=1` ou `VITE_USE_MOCK=true`
- Implementado em: `src/lib/mockMode.ts`
- Quando ativo: UI exibe dados falsos para desenvolvimento sem Supabase
- Segurança: dados reais ainda protegidos por RLS, mas UI não autenticada

## .gitignore

```
.env
```

Apenas `.env` exato é ignorado. `.env.production` é commitado (contém as mesmas chaves).

## Segurança

- Anon key é projetada para ser pública (vai no bundle do navegador)
- Risco real depende da corretude das RLS policies
- Se RLS falhar, anon key expõe dados
- `.env.production` commitado no repositório (cuidado com repositórios públicos)

## Limitações

- **Mesmas chaves em dev e prod** — sem segregação de ambientes
- **`VITE_USE_MOCK` não definido** — se acidentalmente true em produção, ativa modo mock
- **Sem variáveis de analytics** — sem Google Analytics, Sentry, etc.
- **Sem validação de env na inicialização** — app não verifica se vars existem

## Recomendações

- Segregar projetos Supabase para dev e prod (chaves diferentes)
- Definir `VITE_USE_MOCK=false` explicitamente no `.env`
- Adicionar validação de variáveis na inicialização
- Não commitar `.env.production` se repo for público
