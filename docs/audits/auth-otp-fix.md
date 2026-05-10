# Auditoria de correção — cadastro/OTP

## Causa raiz

O fluxo de cadastro estava aceitando `000000` como OTP válido em ambiente não-production por causa do helper `acceptsMockOtp()` em `src/features/auth/server/mock-otp-challenges.ts`. Isso criava um bypass amplo demais: qualquer desafio de cadastro podia ser concluído com `000000`, mesmo quando o desafio gerado era outro.

## Regra de negócio validada

- OTP incorreto deve bloquear o cadastro.
- OTP expirado deve bloquear o cadastro.
- OTP ausente continua tratado como payload inválido quando o corpo mistura `challenge` e `otp` de forma inconsistente.
- A flag `HYDRORIVERS_EXPOSE_OTP_CODE=true` continua apenas expondo o código na resposta para E2E/demo, sem autorizar bypass.

## Arquivos alterados

- `src/features/auth/server/mock-otp-challenges.ts`
- `docs/audits/auth-otp-fix.md`

## O que foi corrigido

- Removi o atalho que aceitava `000000` como OTP universal fora de produção.
- Mantive apenas a comparação exata entre o OTP esperado e o recebido.
- Preservei a geração de OTP fixo opcional via `HYDRORIVERS_MOCK_FIXED_OTP=true` para cenários de teste controlados.

## Comandos executados

- `npx vitest run tests/integration/api/auth.register.post.test.ts`
  - Resultado: passou, 1 arquivo / 7 testes.
- `npm run typecheck`
  - Resultado: passou.
- `npm run lint`
  - Resultado: passou.
- `npm test`
  - Resultado: passou, 32 arquivos / 207 testes.

## Pendências

- Nenhuma pendência funcional identificada neste fluxo após a correção.
- Se o time quiser um atalho de OTP para E2E futuro, isso precisa ser feito com uma flag dedicada e claramente documentada, não com bypass universal.
