# Checklist: Segurança

## Autenticação
- [ ] Rate limit implementado (login, registro)?
- [ ] Senha com requisitos mínimos de complexidade?
- [ ] Sessão expirada tratada (redirect + limpeza)?
- [ ] Token de convite expira? (7 dias OK)

## Autorização
- [ ] PrivateRoute configurada para rota?
- [ ] Manager vs Artist distinto?
- [ ] RLS policy cobre todas as operações na tabela?
- [ ] Função RPC tem grant correto (authenticated vs anon)?

## Dados
- [ ] Dados sensíveis não expostos em logs?
- [ ] Variáveis VITE_ são realmente públicas?
- [ ] Modo mock não ativável em produção?
- [ ] .env.production sem segredos reais?

## Storage
- [ ] Upload validado (tipo, tamanho, extensão)?
- [ ] Path ownership validado (user_owns_storage_studio)?
- [ ] Bucket público? Consciente da decisão?

## Input
- [ ] Validação de entrada nas bordas do sistema?
- [ ] Slug validado (regex + reservados)?
- [ ] Email validado (formato + conflito)?
- [ ] SQL injection? (via cliente Supabase JS, seguro)
