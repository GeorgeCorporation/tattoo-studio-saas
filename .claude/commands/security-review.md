# /security-review

## Objetivo

Revisar alterações sob perspectiva de segurança.

## Entrada

- Código modificado (git diff)
- Ou área específica (auth, RLS, storage)

## Processo

1. Verificar:
   - [ ] RLS policy cobre todas as operações?
   - [ ] PrivateRoute configurada para rotas protegidas?
   - [ ] Rate limit em ações públicas (login, booking, upload)?
   - [ ] Validação de upload (tipo, tamanho, extensão)?
   - [ ] Dados sensíveis nos logs?
   - [ ] Variáveis VITE_ expostas corretamente?
   - [ ] Modo mock ativável acidentalmente?
   - [ ] INSERT público via anon key?
2. Reportar vulnerabilidades

## Saída Esperada

- Achados de segurança categorizados
- Recomendações de mitigação

## Regras

- Toda alteração em auth, RLS ou storage requer security review
- Confirmar que RLS é a barreira final (não confiar no frontend)
- Verificar grants de funções RPC (anon vs authenticated)
