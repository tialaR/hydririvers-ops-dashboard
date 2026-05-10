# Auditoria de dívida técnica de TypeScript — HydroRivers

## Problemas encontrados

- `any` explícito ainda aparece em testes de integração e unitários legados, principalmente em stubs de `mock-db` e `auth.profile` mocks de teste.
- Vários casts `as` seguem necessários em bordas de integração com `next-intl`, `next/navigation`, storage, mocks e contratos de rede.
- Há shims/compat layers intencionais, como `src/shared/ui/bottom-sheet/bottom-sheet.tsx` e `src/shared/hooks/useLockBodyScroll.ts`.
- Alguns payloads de formulário ainda eram validados manualmente no cliente, sem schema compartilhado.
- `mock-db` e `auth.client` ainda aceitam JSON persistido com parse/shape sem uma camada completa de schema em todos os caminhos.

## Problemas corrigidos

- Criei schemas Zod para a publicação de carga, o perfil e a proposta de negociação:
  - `src/features/cargo-market/domain/new-cargo-form.schema.ts`
  - `src/features/auth/domain/profile.schema.ts`
  - `src/features/cargo-market/domain/cargo-proposal.schema.ts`
- Reaproveitei esses schemas no cliente e no servidor:
  - `src/features/cargo-market/components/new-cargo-form/new-cargo-form.tsx`
  - `src/features/cargo-market/actions/publish-cargo-action.ts`
  - `src/features/cargo-market/components/cargo-detail/cargo-detail.tsx`
  - `src/features/auth/components/profile-panel/profile-panel.tsx`
  - `src/app/api/auth/profile/route.ts`
- Adicionei cobertura unitária dos contratos novos em:
  - `tests/unit/features/forms-validation.test.ts`
- Mantive a UX e os textos i18n existentes, só trocando o mecanismo de validação.

## Problemas deixados para etapa futura

- Login, register e OTP continuam com estado local e validação manual na UI, embora os schemas já existam no domínio.
- A migração para React Hook Form ainda não foi feita porque exigiria uma reorganização mais ampla do fluxo de auth.
- `mock-db`, `auth.client` e alguns handlers de API ainda possuem casts de borda para JSON/mock storage.
- Os compat shims seguem presentes por segurança até provarmos que não há mais dependências.

## Recomendação sobre `noUncheckedIndexedAccess`

- Vale habilitar em uma etapa futura, mas só após uma rodada de endurecimento nos acessos a arrays/records de `mock-db`, `navigation`, `mock-mode` e helpers de i18n.
- Neste momento, ativar globalmente provavelmente geraria um volume alto de ajustes em áreas legadas, sem ganho proporcional imediato.

## Recomendação sobre `exactOptionalPropertyTypes`

- Também deve entrar depois, de forma incremental.
- O projeto ainda tem muitos contratos que aceitam `undefined` de forma implícita em payloads de mock e integração. Ativar agora provavelmente geraria uma migração ampla demais.

## Comandos executados

- `npx vitest run tests/unit/features/forms-validation.test.ts tests/integration/api/auth.profile.put.test.ts tests/integration/api/cargas.post.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run check:i18n`
- `ps -Ao pid,command | rg "next build|Creating an optimized production build|turbopack|webpack"`
- `kill 68051`

## Resultados

- `vitest` parcial: passou, `3` arquivos e `18` testes.
- `typecheck`: passou.
- `lint`: passou.
- `npm test`: passou, `33` arquivos e `212` testes.
- `npm run build`: travou em `Creating an optimized production build ...`; o processo `node /Users/tialarocha/Desktop/hydrorivers-dashboard-v27-sidebar-controls/node_modules/.bin/next build` foi identificado com PID `68051` e encerrado manualmente.
- `check:i18n`: passou, com `1230` chaves alinhadas em `pt-BR`, `en-US` e `es`.

## Arquivos alterados nesta rodada

- `src/features/cargo-market/domain/new-cargo-form.schema.ts`
- `src/features/auth/domain/profile.schema.ts`
- `src/features/cargo-market/domain/cargo-proposal.schema.ts`
- `src/features/cargo-market/components/new-cargo-form/new-cargo-form.tsx`
- `src/features/cargo-market/actions/publish-cargo-action.ts`
- `src/features/cargo-market/components/cargo-detail/cargo-detail.tsx`
- `src/features/auth/components/profile-panel/profile-panel.tsx`
- `src/app/api/auth/profile/route.ts`
- `tests/unit/features/forms-validation.test.ts`
- `docs/audits/typescript-debt-audit.md`

