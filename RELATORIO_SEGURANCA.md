# Relatório de Segurança - Tattoo Studio SaaS

Data: 03/07/2026  
Base analisada: React + Vite + TypeScript + Supabase + Cloudflare Pages/Workers  
Referência: OWASP Top 10:2025, RLS Supabase, Storage Supabase, LGPD básica

## Resumo executivo

Status geral: **bom para MVP controlado, ainda não 100% corporativo**.

Pontuação técnica estimada:
- Antes da auditoria: **7,4/10**
- Depois dos ajustes: **8,6/10**

Principais melhorias aplicadas:
- Headers de segurança via `public/_headers`.
- Validação forte de upload.
- Nome de arquivo não previsível em Storage.
- Proteção simples contra brute force no login.
- Slugs públicos com bloqueio de nomes reservados.
- Validação de tatuador/serviço antes de criar agendamento.
- Rollback básico de cliente quando agendamento falha.
- Logger de segurança.
- Página de privacidade.
- SQL separado de RLS em `src/lib/rls-policies.sql`.
- Mensagens de erro em português.

## Resultado das checagens

Comandos executados:
- `npm run typecheck`: passou.
- `npm run lint`: passou.
- `npm run test`: passou.
- `npm run build`: passou.
- `npm audit --audit-level=high`: passou, 0 vulnerabilidades.

Testes:
- 11 arquivos de teste.
- 41 testes passando.

Observação:
- Build mostra aviso de bundle acima de 500 kB. Não é falha de segurança. Melhorar depois com code splitting.

## A01 - Broken Access Control

Status: **melhorado**

O que está correto:
- Tabelas principais usam RLS.
- Dados privados dependem do dono do estúdio.
- Página pública lê somente dados públicos necessários.
- Criação pública de agendamento exige:
  - status inicial `pending`;
  - data futura;
  - estúdio existente;
  - tatuador ativo;
  - serviço ativo;
  - tatuador e serviço pertencendo ao mesmo estúdio.
- Storage usa path por `studioId`.
- Delete de arquivos exige dono do estúdio.

Arquivos relevantes:
- `src/lib/database.sql`
- `src/lib/rls-policies.sql`
- `src/services/booking.service.ts`
- `src/services/storage.service.ts`

Risco restante:
- Algumas telas internas ainda consultam registros por `id` e confiam no RLS para bloquear IDOR. Está protegido no banco, mas defesa em profundidade pede sempre passar `studioId` também.

Recomendação:
- Aos poucos, ajustar services internos para buscar por `id + studio_id`.

## A02 - Cryptographic Failures

Status: **bom para MVP**

O que está correto:
- Sem `service_role` no frontend.
- Sem chave privada encontrada no código.
- `.env` está ignorado pelo Git.
- Supabase usa HTTPS.
- Senhas ficam no Supabase Auth, não no app.
- Não há criptografia manual fraca.

Ponto de atenção:
- `wrangler.jsonc` contém `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. A anon key é pública por natureza, mas o ideal operacional é configurar no painel da Cloudflare.

Recomendação:
- Manter apenas variáveis públicas no frontend.
- Nunca colocar `service_role` no GitHub, Cloudflare frontend ou `.env` público.

## A03 - Injection

Status: **bom**

O que está correto:
- App usa Supabase SDK, sem SQL raw concatenado no frontend.
- Não foram encontrados comandos perigosos com dados do usuário.
- Slug agora tem validação de formato.
- Slugs reservados são bloqueados.
- Upload bloqueia extensões perigosas.

Ponto de atenção:
- `LandingPage.tsx` usa `style.innerHTML`, mas com CSS estático interno. Não recebe dados do usuário, então risco baixo.

## A04 - Insecure Design

Status: **melhorado**

O que está correto:
- Banco impede conflito de agenda com índice único parcial.
- Booking valida disponibilidade antes de inserir.
- Booking valida tatuador e serviço ativos.
- Onboarding cria base inicial do estúdio.
- Página pública tem fluxo claro.

Risco restante:
- Ainda falta regra avançada de duração real por serviço. Hoje agenda usa intervalo de 1 hora.

Recomendação:
- Próxima melhoria: disponibilidade baseada na duração do serviço.

## A05 - Security Misconfiguration

Status: **melhorado**

O que foi aplicado:
- `public/_headers` com:
  - `X-Frame-Options`;
  - `X-Content-Type-Options`;
  - `Referrer-Policy`;
  - `Permissions-Policy`;
  - `Content-Security-Policy`;
  - `Strict-Transport-Security`.

Ponto de atenção:
- CSP pode precisar ajuste se no futuro forem adicionados novos domínios externos.

## A06 - Vulnerable and Outdated Components

Status: **bom**

Resultado:
- `npm audit --audit-level=high`: 0 vulnerabilidades.

Dependências:
- React, Vite, Supabase, Router, Lucide e libs de teste estão em uso.
- `@testing-library/user-event` é dev dependency. Pode ficar, mas hoje parece pouco usado.

Recomendação:
- Rodar `npm audit --audit-level=high` antes de publicar versões grandes.

## A07 - Identification and Authentication Failures

Status: **melhorado**

O que foi aplicado:
- Login com bloqueio local após 5 falhas.
- Bloqueio por 15 minutos no navegador.
- Logger de tentativa de login.
- Cadastro exige senha mínima de 8 caracteres.
- Logout registrado no logger de segurança.
- Mensagens de auth traduzidas.

Risco restante:
- Bloqueio local não substitui rate limit real no servidor.

Recomendação:
- Ativar proteções de Auth no Supabase quando o projeto sair do MVP.

## A08 - Software and Data Integrity Failures

Status: **melhorado**

O que está correto:
- Upload valida tipo MIME.
- Upload bloqueia extensões perigosas.
- Upload limita tamanho em 5MB.
- Nome final usa UUID, não timestamp previsível.
- Caminhos ficam organizados por estúdio.

Risco restante:
- Ainda não há antivírus/scan de imagem. Para MVP, aceitável.

## A09 - Security Logging and Monitoring Failures

Status: **parcial**

O que foi criado:
- `src/lib/security-logger.ts`

Eventos registrados:
- login com sucesso;
- falha de login;
- login bloqueado;
- logout;
- upload bloqueado;
- slug reservado tentado.

Limite atual:
- Logger só escreve no console em desenvolvimento.

Recomendação:
- Futuro: enviar eventos críticos para tabela `security_events` ou serviço de observabilidade.

## A10 - Server-Side Request Forgery

Status: **baixo risco**

O que foi visto:
- Frontend não faz fetch para URL livre informada pelo usuário.
- Supabase SDK usa domínio fixo do projeto.
- Links externos são Instagram/WhatsApp/Website.

Recomendação:
- Para website do estúdio, validar `https://` antes de salvar.

## LGPD

Status: **básico criado**

Dados pessoais tratados:
- nome;
- telefone/WhatsApp;
- email;
- Instagram;
- observações;
- descrições de tatuagem;
- fotos de referência;
- histórico de agendamentos;
- pagamentos.

O que foi adicionado:
- Página `/privacidade`.
- Link no rodapé da landing.

Risco restante:
- Texto ainda é modelo base, não revisão jurídica.

Recomendação:
- Antes de vender oficialmente, revisar Política de Privacidade e Termos com profissional jurídico.

## Upload e Storage

Status: **melhorado**

Buckets usados:
- `logos`
- `artists`
- `gallery`
- `booking-references`
- `client-deliveries`

Regras atuais:
- leitura pública onde faz sentido para página pública;
- upload/delete autenticado restrito ao dono do estúdio;
- referência de booking pode ser enviada publicamente, mas path precisa ter estúdio válido e appointmentId no formato UUID;
- nome de arquivo usa UUID.

## SQL entregue

Arquivo criado:
- `src/lib/rls-policies.sql`

Função:
- reaplicar políticas RLS;
- reaplicar policies de Storage;
- documentar regra de acesso por dono do estúdio.

Arquivo atualizado:
- `src/lib/database.sql`

Melhorias:
- constraints de slug;
- índice único de horário por artista;
- policies atuais preservadas.

## Correções aplicadas no código

Arquivos principais:
- `public/_headers`
- `src/lib/security-logger.ts`
- `src/lib/slugs.ts`
- `src/lib/error-messages.ts`
- `src/lib/errors.ts`
- `src/lib/database.sql`
- `src/lib/rls-policies.sql`
- `src/services/storage.service.ts`
- `src/services/booking.service.ts`
- `src/services/onboarding.service.ts`
- `src/services/artists.service.ts`
- `src/services/gallery.service.ts`
- `src/services/deliveries.service.ts`
- `src/pages/auth/Login.tsx`
- `src/pages/auth/Register.tsx`
- `src/pages/legal/PrivacyPolicy.tsx`
- `src/routes/index.tsx`

## O que ainda falta para ficar 100%

Prioridade alta:
1. Aplicar `src/lib/database.sql` atualizado no Supabase.
2. Aplicar ou guardar `src/lib/rls-policies.sql` como backup operacional.
3. Testar booking real com dois usuários tentando mesmo horário.
4. Ajustar services internos para sempre consultar por `id + studioId`.

Prioridade média:
1. Code splitting para reduzir bundle.
2. Logger de segurança persistente em tabela.
3. Validação mais forte de website e Instagram.
4. Política LGPD final revisada.

Prioridade futura:
1. Lembretes WhatsApp.
2. Depósito/sinal integrado.
3. Waiver/termo de consentimento.
4. Relatórios de conversão e no-show.

## Conclusão

Sistema ficou mais seguro e mais profissional.  
Para MVP público com poucos estúdios: **pode avançar com teste real controlado**.  
Para venda em escala: ainda falta endurecer logs, LGPD jurídica, code splitting e defesa em profundidade nos services internos.
