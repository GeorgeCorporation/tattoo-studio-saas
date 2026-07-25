# Correções da revisão final — Important

Base revisada: `6044247`.

## Escopo entregue

- O dashboard financeiro agora redefine pagamentos, resumo, comissões e dados gerenciais para os valores padrão ao trocar `studioId`, ano, mês ou papel. Requisições e snapshots do escopo anterior continuam invalidados; uma nova tentativa no mesmo escopo preserva seus dados como antes.
- A ativação do artista deixou de congelar a expiração na abertura. Um relógio de estado atualiza a interface no vencimento e a hora atual é revalidada antes de iniciar autenticação, antes de aceitar uma sessão já existente e antes de aceitar o convite após autenticação.

## TDD

1. O teste com promessa adiada carregou julho, trocou para agosto e rejeitou a carga de agosto. Antes da correção, `payment-1` continuava renderizado; após a correção, pagamentos e comissões ficam vazios e o resumo volta a `0`.
2. Os testes de ativação avançaram o relógio depois de abrir um convite válido. Antes da correção, o fluxo ainda prosseguia; após a correção, nenhum `signUp`, `signInWithPassword` ou `acceptArtistInvite` é chamado. Há também cobertura específica para uma sessão já existente que só resolve após o vencimento.

## Verificação

- `npm.cmd run test -- src/hooks/useFinancialDashboard.test.tsx src/pages/public/ArtistActivationPage.test.tsx` — 14 testes aprovados.
- `npm.cmd run typecheck` — aprovado.
- `npm.cmd run lint` — aprovado sem avisos.
- `git diff --check` — aprovado.

## Limites preservados

Não houve alteração em RPC pública, `capValue` histórico, auth/RLS, rotas, banco, dependências ou branding.
