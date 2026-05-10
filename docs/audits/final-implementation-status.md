# Estado final de implementação — HydroRivers

## Resumo executivo

O projeto está funcionalmente forte em Dashboard, Cargas, Minhas cargas, notificações, tema, i18n e bottom sheets principais. A base de arquitetura e documentação também está bem consolidada. O que ainda impede considerar o estado “pronto sem ressalvas” é o travamento recorrente do `build`, a necessidade de QA visual manual em várias rotas e a adoção ainda parcial de Zod/RHF e endurecimento de TypeScript em fluxos legados.

## Tabela por área

| Área | Status | Evidência no código | Observações reais | QA manual |
| --- | --- | --- | --- | --- |
| Dashboard | Implementado | `src/app/[locale]/dashboard/page.tsx`, `src/features/dashboard/components/*` | Fluxo principal consolidado, com prioridade, overview e operações | Sim, para conferir paridade visual por breakpoint |
| Cargas | Implementado | `src/app/[locale]/cargas/page.tsx`, `src/features/cargo/services/cargo.service.ts` | Marketplace/listagem pública com regras de negócio estáveis | Sim, para checar densidade e mobile |
| Minhas cargas | Implementado | `src/app/[locale]/minhas-cargas/page.tsx`, `src/app/[locale]/cargas/minhas-cargas/page.tsx`, `src/features/my-cargos/mocks/myCargos.mock.ts` | Rota principal e alias coexistem por compatibilidade | Sim, para confirmar navegação e cards em mobile |
| Rastreio/mapa | Implementado parcial | `src/features/dashboard/components/operations-board/operations-board.tsx`, `docs/ux/mobile-map-experience.md` | Há fullscreen, camadas, resumo e direção clara; a validação visual completa ainda é necessária | Sim, obrigatória |
| Negociações | Implementado parcial | `src/app/[locale]/negociacoes/page.tsx`, `src/features/negotiations/components/*`, `src/app/api/negociacoes/route.ts` | Fluxo de listas e detalhes consistente, mas o form de proposta ainda é manual | Sim |
| Embarcações | Implementado parcial | `src/app/[locale]/embarcacoes/page.tsx`, `src/features/vessels/components/*` | Estrutura e dados existem, mas a confirmação visual de todas as telas não foi concluída nesta fase | Sim |
| Impacto | Implementado parcial | `src/app/[locale]/impacto/page.tsx`, `src/features/impact/components/*` | Tema e conteúdo consolidado, porém revisão visual completa ainda pendente | Sim |
| Governo | Implementado | `src/app/[locale]/governo/page.tsx`, `src/features/government/components/government-dashboard/*` | Área consistente com o dashboard operacional | Sim |
| Nova carga | Implementado | `src/app/[locale]/cargas/nova/page.tsx`, `src/features/cargo-market/components/new-cargo-form/new-cargo-form.tsx`, `src/features/cargo-market/domain/new-cargo-form.schema.ts` | Validação agora é Zod compartilhado no cliente/servidor | Sim, para confirmar UX do formulário |
| Auth/Login/Register/OTP | Implementado parcial | `src/features/auth/components/auth-form/auth-form.tsx`, `src/features/auth/domain/auth-schemas.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/login/route.ts` | Domínio sólido com Zod; UI ainda usa estado local e fluxo manual | Sim |
| Perfil | Implementado | `src/features/auth/components/profile-panel/profile-panel.tsx`, `src/features/auth/domain/profile.schema.ts`, `src/app/api/auth/profile/route.ts` | Validação Zod compartilhada e persistência alinhada | Sim |
| Notificações | Implementado | `src/shared/layout/admin-chrome/admin-chrome.tsx`, `src/features/notifications/services/notifications.client.ts` | Desktop usa portal; mobile usa bottom sheet | Sim, para validar posição/overlay |
| BottomSheet | Implementado parcial | `src/shared/components/bottom-sheet/BottomSheet.tsx`, `src/shared/hooks/use-lock-body-scroll.ts`, `src/shared/ui/bottom-sheet/bottom-sheet.tsx` | Base central está presente, mas compat shims ainda existem | Sim |
| Tema dark/light | Implementado | `src/shared/ui/theme-toggle/theme-toggle.tsx`, `src/shared/layout/admin-chrome/admin-chrome.tsx`, `docs/design-system/theme-controls.md` | Controle compacto e persistência ok | Sim |
| i18n | Implementado | `messages/pt-BR.json`, `messages/en-US.json`, `messages/es.json`, `scripts/check-i18n.mjs` | Chaves alinhadas; copy hardcoded mais visível foi reduzida | Sim, para leitura contextual |
| Mobile-first | Implementado parcial | `src/app/globals.scss`, `src/shared/constants/z-index.ts`, `docs/ux/mobile-bottom-sheets.md` | Base forte, mas sempre exige revisão visual por viewport real | Sim, obrigatória |
| Serviços | Implementado parcial | `src/features/*/services/*`, `src/shared/server/*` | Boa separação, mas alguns serviços ainda usam casts/JSON legados | Sim |
| Hooks | Implementado parcial | `src/shared/hooks/use-lock-body-scroll.ts`, `src/features/auth/hooks/*` | Hook central existe, mas a padronização total ainda não está fechada | Sim |
| UI compartilhada | Implementado | `src/shared/ui/*`, `src/shared/layout/*` | Componentes base e layout global bem organizados | Sim |
| Arquitetura | Implementado | `docs/architecture/project-tree.md`, `docs/architecture/code-quality-audit.md`, `docs/adr/*` | Base documental e feature-first consistente | Não crítico |
| Testes | Implementado parcial | `tests/unit/*`, `tests/integration/*`, `tests/e2e/*` | Boa cobertura, mas ainda há um teste de OTP historicamente sensível e build que impede validação total | Sim |
| Build | Risco técnico | `npm run build` | Repetidamente trava em `Creating an optimized production build ...` | Não, o bloqueio é técnico |

## Comandos e resultados

- `npm run typecheck` — passou.
- `npm run lint` — passou.
- `npm run check:i18n` — passou, `1230` chaves alinhadas em `pt-BR`, `en-US`, `es`.
- `npm test` — passou, `33` arquivos e `212` testes.
- `npm run build` — travou em `Creating an optimized production build ...`; o processo `node /Users/tialarocha/Desktop/hydrorivers-dashboard-v27-sidebar-controls/node_modules/.bin/next build` foi identificado com PID `68585` e encerrado manualmente.

## Riscos

- Travamento recorrente do build impede afirmar prontidão de produção.
- Adoção parcial de Zod/RHF em auth deixa a experiência consistente no domínio, mas ainda manual na UI.
- Compat shims de `BottomSheet` e `useLockBodyScroll` continuam por segurança.
- Vários pontos ainda dependem de validação visual manual em mobile e landscape.

## Próximos passos recomendados

1. Resolver a causa raiz do travamento do `next build`.
2. Fazer uma rodada visual por rota/breakpoint, com foco em mapa, overlays e telas antigas.
3. Migrar auth para React Hook Form se o time decidir investir na padronização completa.
4. Endurecer TypeScript progressivamente, especialmente em bordas de storage, URL e mocks.
5. Remover shims/aliases legados somente depois de provar que não existem mais dependências.

## Go/No-Go para refinamento visual

**Go com ressalvas.**

O produto está estável o suficiente para refinamentos visuais incrementais, mas ainda não é um “go total” para encerramento porque o build não está validando produção e algumas áreas críticas continuam pedindo QA manual antes de qualquer conclusão de estabilidade final.

