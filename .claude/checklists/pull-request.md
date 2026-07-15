# Checklist: Pull Request

## Descrição
- [ ] Título claro (máx 70 caracteres)
- [ ] Descrição com contexto: o que foi feito e por quê?
- [ ] Link para issue/ticket (se existir)
- [ ] Mudanças resumidas (bullet points)

## Código
- [ ] Segue padrão de camadas (Page → Hook → Service → Supabase)
- [ ] Nomes de variáveis/funções descritivos
- [ ] Cores Tailwind (nunca hardcoded)
- [ ] Tratamento de erro com `getFriendlyErrorMessage`
- [ ] `any` evitado (exceções documentadas)
- [ ] Nenhum console.log esquecido
- [ ] Nenhum barrel file vazio adicionado

## Testes
- [ ] Testes escritos para código novo
- [ ] Testes existentes passam
- [ ] `npm run check` passa

## Revisão
- [ ] Auto-revisão feita (ler o diff completo)
- [ ] Pontos de atenção destacados para o revisor
- [ ] Documentação atualizada (se aplicável)

## Checklist Final
- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] `npm run test` passa
- [ ] `npm run build` passa
