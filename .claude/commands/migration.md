# /migration

## Objetivo

Criar migration SQL versionada para o Supabase.

## Entrada

- Descrição da mudança (ex: "adicionar coluna bio em studios")

## Processo

1. Nomear arquivo: `YYYYMMDDHHMMSS_descricao.sql`
2. Criar em `supabase/migrations/`
3. Incluir:
   - `CREATE TABLE` ou `ALTER TABLE`
   - RLS policies (se nova tabela)
   - Índices necessários
   - Comentários descritivos
4. Rodar `npm run db:types` para gerar tipos TS
5. Testar localmente (se possível)

## Saída Esperada

- Arquivo de migration versionado
- Tipos TS atualizados
- RLS policies configuradas

## Template

```sql
-- Migration: descricao
-- Date: YYYY-MM-DD HH:MM

-- UP
ALTER TABLE studios ADD COLUMN IF NOT EXISTS bio text;

-- Índices
CREATE INDEX IF NOT EXISTS studios_bio_idx ON studios (bio);

-- RLS
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
-- (se aplicável)
```

## Regras

- Sempre versionar (nunca alterar SQL diretamente no console Supabase)
- Migrations são irreversíveis? Criar também script de rollback
- Toda nova tabela precisa de RLS policy
- Toda FK precisa de ON DELETE apropriado
