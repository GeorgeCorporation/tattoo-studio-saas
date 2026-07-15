# Checklist: Banco de Dados

## Schema
- [ ] Migration versionada em `supabase/migrations/`?
- [ ] UUID como PK com `gen_random_uuid()`?
- [ ] `created_at` com `default now()` em toda tabela?
- [ ] FK com ON DELETE apropriado (CASCADE/SET NULL)?
- [ ] NOT NULL em colunas obrigatórias?
- [ ] CHECK constraints para valores limitados?

## RLS
- [ ] RLS habilitado na tabela?
- [ ] Policies para SELECT, INSERT, UPDATE, DELETE?
- [ ] Manager: `auth.uid()` = `studios.user_id`
- [ ] Artist: via `current_user_artist_id()` (se aplicável)
- [ ] Público: apenas dados que devem ser públicos
- [ ] Funções helper reutilizadas (`user_owns_storage_studio`, etc.)

## Índices
- [ ] Índice para FK (studio_id, auth_user_id, etc.)?
- [ ] Partial unique index para constraints condicionais?
- [ ] Índice composto para queries frequentes?
- [ ] Índice para buscas por status + data?

## RPC
- [ ] Grants explícitos (anon vs authenticated)?
- [ ] Função faz uma coisa só?
- [ ] Nome descritivo (current_user_, get_, etc.)?

## Pós-Migration
- [ ] `npm run db:types` rodou?
- [ ] Tipos TypeScript atualizados?
- [ ] Migration testada localmente?
