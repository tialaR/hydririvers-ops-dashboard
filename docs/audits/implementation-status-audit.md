# Auditoria de implementação — HydroRivers

## Resumo executivo

O projeto avançou bastante em arquitetura, mobile-first, i18n e Design System, com várias entregas já consolidadas em código e documentação. Os maiores pontos ainda em aberto são a falha recorrente no teste de OTP do cadastro, o `build` travando em `next build`, a coexistência de caminhos legados para bottom sheet e a adoção ainda parcial de Zod/React Hook Form e endurecimento total de TypeScript.

## Matriz de status

| Área | Status | Evidência no código | Problemas encontrados | Próximo passo |
| ---- | ------ | ------------------ | --------------------- | ------------- |
| BottomSheet | Implementado parcial | `src/shared/components/bottom-sheet/BottomSheet.tsx`, `src/shared/hooks/use-lock-body-scroll.ts`, `src/shared/ui/bottom-sheet/bottom-sheet.tsx` | Existe base única com portal, lock de scroll e foco, mas ainda há ponte/compatibilidade com caminho legado | Eliminar a duplicidade de exportes legados quando seguro |
| Dashboard vs Cargas vs Minhas cargas | Implementado | `src/app/[locale]/dashboard/page.tsx`, `src/app/[locale]/cargas/page.tsx`, `src/app/[locale]/minhas-cargas/page.tsx`, `src/features/cargo/services/cargo.service.ts`, `src/features/my-cargos/mocks/myCargos.mock.ts` | Nenhum bloqueio funcional relevante identificado; `minhas-cargas` tem alias de rota para compatibilidade | Manter separação de escopo e revisar paridade visual em PRs futuros |
| Notificações desktop | Implementado | `src/shared/layout/admin-chrome/admin-chrome.tsx`, `src/features/notifications/services/notifications.client.ts` | Popover foi portado para `document.body`, reduzindo risco de ficar atrás do mapa | Validar visualmente em navegador real após mudanças no mapa |
| Notificações mobile | Implementado | `src/shared/layout/admin-chrome/admin-chrome.tsx`, `src/shared/components/bottom-sheet/BottomSheet.tsx` | Dependente da base global de sheets, mas o fluxo está definido | Manter usando o componente base e evitar overlay improvisado |
| Tema / idioma no footer | Implementado | `src/shared/layout/admin-chrome/admin-chrome.tsx`, `src/shared/ui/theme-toggle/theme-toggle.tsx`, `src/shared/ui/locale-switcher/locale-switcher.tsx`, `docs/design-system/theme-controls.md` | Controles estão centralizados no footer/sidebar; o padrão está consistente | Revisar só refinamentos visuais menores quando necessário |
| Priority tab | Implementado | `src/features/dashboard/components/priority-tab/priority-tab.tsx`, `src/features/cargo/utils/cargo-priority.ts`, `docs/features/cargo-priority.md` | Sem bloqueio funcional observado | Nenhum imediato |
| Mapa hidroviário | Implementado parcial | `src/features/dashboard/components/operations-board/operations-board.tsx`, `src/shared/components/bottom-sheet/BottomSheet.tsx`, `docs/ux/mobile-map-experience.md` | Há evolução clara de UX e fullscreen, mas o mapa ainda depende de verificações visuais manuais contínuas | Validar em dispositivos reais e reduzir qualquer sobreposição remanescente |
| Filtros mobile | Implementado parcial | `src/features/cargo-market/components/cargo-list/cargo-list.tsx`, `src/shared/components/bottom-sheet/BottomSheet.tsx` | O padrão mudou para sheets/portais, mas há múltiplos overlays e fluxos específicos para manter | Consolidar sub-sheets e remover qualquer dropdown solto remanescente |
| Header / Sidebar | Implementado | `src/shared/layout/admin-chrome/admin-chrome.tsx`, `src/shared/layout/app-header/app-header.tsx` | Header e sidebar agora concentram a navegação e o footer de preferências | Manter compatibilidade de rotas e foco em acessibilidade |
| Mobile-first geral | Implementado parcial | `src/app/globals.scss`, `src/shared/constants/z-index.ts`, `docs/ux/mobile-bottom-sheets.md` | A fundação mobile está forte, mas o audit visual completo em todas as rotas ainda pode encontrar ajustes finos | Executar mais uma passada de QA visual por rota |
| Roteamento / 404 / Minhas cargas | Implementado | `src/app/[locale]/minhas-cargas/page.tsx`, `src/app/[locale]/cargas/minhas-cargas/page.tsx`, `src/shared/routing/app-routes.ts` | Nenhum 404 crítico encontrado para o fluxo atual | Remover alias apenas se não houver links legados dependentes |
| Not-found / rotas antigas | Implementado parcial | `src/app/[locale]/not-found.tsx`, várias rotas em `src/app/[locale]` | Há legado espalhado por várias páginas e temas; nem todas as telas foram auditadas visualmente nesta etapa | Revisar telas antigas em uma sprint dedicada |
| Timeline / Documents / Cost / Overviews | Implementado parcial | `docs/features/*`, `src/features/dashboard/components/*` | Existem docs e implementações, mas a auditoria visual completa por tela não foi concluída nesta passagem | Fazer review visual por aba, com foco mobile e acessibilidade |
| Acessibilidade | Implementado parcial | `src/shared/components/bottom-sheet/BottomSheet.tsx`, `src/shared/layout/admin-chrome/admin-chrome.tsx`, `docs/accessibility/accessibility-guidelines.md` | Há foco, `aria-modal` e labels importantes, mas a conformidade total em todas as telas não foi verificada ponta a ponta | Rodar checklist manual por rota e overlay |
| i18n | Implementado | `messages/pt-BR.json`, `messages/en-US.json`, `messages/es.json`, `scripts/check-i18n.mjs`, `docs/i18n/i18n-guidelines.md` | Sem divergência de chaves no check atual | Continuar bloqueando textos hardcoded em novas mudanças |
| TypeScript | Implementado parcial | `tsconfig.json`, `src/shared/preferences/client-preferences.ts`, `src/features/auth/domain/auth-schemas.ts` | `strict` está ligado, mas ainda faltam flags mais duras e há casts/compat shims em várias camadas | Endurecer progressivamente sem quebrar runtime |
| Zod / React Hook Form | Implementado parcial | `src/features/auth/domain/auth-schemas.ts`, `src/shared/preferences/client-preferences.ts`, `docs/adr/0014-form-validation-zod-react-hook-form.md` | Schemas existem, mas a adoção de RHF não está homogênea no app | Migrar os formulários prioritários por domínio |
| Performance / Core Web Vitals | Implementado parcial | `src/features/dashboard/components/operations-board/operations-board.tsx`, `docs/architecture/code-quality-audit.md`, `docs/engineering/typescript-guidelines.md` | Há esforço de lazy/render controlado, mas o build travando impede validação completa de produção | Revisar mapas/gráficos pesados e executar build estável |
| Storybook readiness | Implementado parcial | `docs/design-system/storybook-readiness.md`, `src/shared/ui/*`, `src/shared/layout/*` | A documentação e a separação base existem, mas não há stories reais ainda | Criar stories quando a prioridade de implementação permitir |
| Arquitetura / docs / ADRs | Implementado | `docs/architecture/project-tree.md`, `docs/architecture/code-quality-audit.md`, `docs/adr/*` | Cobertura documental ampla; pode haver ajustes pontuais conforme features mudem | Manter docs em paridade com qualquer alteração estrutural |

## Implementado

- `Dashboard`, `Cargas` e `Minhas cargas` estão separados em fluxo e escopo, com `dashboard` usando cargas públicas e `minhas-cargas` usando o mock/serviço do usuário logado.
  - Evidência: `src/app/[locale]/dashboard/page.tsx`, `src/app/[locale]/cargas/page.tsx`, `src/app/[locale]/minhas-cargas/page.tsx`, `src/features/cargo/services/cargo.service.ts`, `src/features/my-cargos/mocks/myCargos.mock.ts`.
- O painel de notificações do desktop foi movido para `Portal` e não depende mais do stacking context do mapa.
  - Evidência: `src/shared/layout/admin-chrome/admin-chrome.tsx`.
- O footer da sidebar concentra tema, idioma e sessão, com tema compacto e idioma em accordion.
  - Evidência: `src/shared/layout/admin-chrome/admin-chrome.tsx`, `src/shared/ui/theme-toggle/theme-toggle.tsx`, `docs/design-system/theme-controls.md`.
- A tab `Prioridade` foi redesenhada com score, cards de resumo, checklist e ações operacionais.
  - Evidência: `src/features/dashboard/components/priority-tab/priority-tab.tsx`, `src/features/cargo/utils/cargo-priority.ts`, `docs/features/cargo-priority.md`.
- A documentação estrutural e de produto está extensa e atualizada.
  - Evidência: `docs/architecture/project-tree.md`, `docs/architecture/code-quality-audit.md`, `docs/features/*`, `docs/adr/*`, `docs/design-system/*`, `docs/ux/*`, `docs/engineering/*`.
- A validação de i18n está saudável no estado atual.
  - Evidência: `npm run check:i18n` retornou `1230 keys aligned in pt-BR, en-US, es`.

## Parcialmente implementado

- O sistema de bottom sheet já tem uma base central, mas ainda convive com caminhos de compatibilidade legados.
  - O que existe: componente central em `src/shared/components/bottom-sheet/BottomSheet.tsx`.
  - O que falta: reduzir a ponte de exportes antigos sem quebrar imports.
  - Risco: duplicidade semântica e manutenção mais custosa.
- A adoção de Zod e React Hook Form está avançada, mas não homogênea em todos os formulários.
  - O que existe: schemas em auth e validação de preferências em `src/shared/preferences/client-preferences.ts`.
  - O que falta: migrar os formulários prioritários para RHF onde faz sentido.
  - Risco: estados duplicados e validações espalhadas.
- A tipagem geral está boa, porém ainda há casts e contratos tolerados por compatibilidade.
  - O que existe: `tsconfig.json` em `strict`, schemas e tipos explícitos em várias features.
  - O que falta: endurecer regras progressivamente e reduzir `as` desnecessários.
  - Risco: bugs silenciosos em payloads legados ou storage/URL.
- A experiência mobile está bem mais madura, mas a verificação visual fim a fim em todas as rotas ainda é incompleta.
  - O que existe: sheets, z-index e bottom nav padronizados.
  - O que falta: revisão visual por página e por breakpoint.
  - Risco: regressões pontuais em telas antigas.

## Pendente

### Crítico

- Corrigir o teste de integração de cadastro/OTP.
  - Arquivo: `tests/integration/api/auth.register.post.test.ts`.
  - Sintoma: espera `401`, recebe `201` quando o OTP está incorreto.

### Alto

- Estabilizar o `next build`, que trava no passo `Creating an optimized production build ...`.
  - Evidência: `npm run build` não termina e exigiu encerramento manual do processo travado.
- Remover gradualmente a duplicidade de pontes legadas em bottom sheet e hook de lock.
  - Arquivos: `src/shared/components/bottom-sheet/BottomSheet.tsx`, `src/shared/ui/bottom-sheet/bottom-sheet.tsx`, `src/shared/hooks/use-lock-body-scroll.ts`, `src/shared/hooks/useLockBodyScroll.ts`.

### Médio

- Completar a migração de formulários complexos para Zod + RHF quando a UX justificar.
- Fazer QA visual em todas as rotas antigas que ainda dependem de layout historicamente diferente.
- Reduzir casts e pontos de tipagem tolerada por compatibilidade.

### Baixo

- Criar stories reais para os componentes já documentados como Storybook-ready.
- Refino fino de espaçamentos e microinterações em telas já funcionalmente estáveis.

## Bugs encontrados

1. Falha persistente no fluxo de cadastro/OTP.
   - Reprodução: executar `npm test`.
   - Resultado: `tests/integration/api/auth.register.post.test.ts` falha em `retorna 401 quando OTP está incorreto na conclusão`.
   - Provável causa: regra de status na rota de conclusão ainda devolve `201` no caso inválido.
   - Arquivos envolvidos: `tests/integration/api/auth.register.post.test.ts`, rota de auth correspondente.
   - Sugestão: revisar a validação e o retorno HTTP do passo de conclusão do OTP.

2. Build de produção travando.
   - Reprodução: executar `npm run build`.
   - Resultado: Next para em `Creating an optimized production build ...`.
   - Provável causa: travamento do pipeline/compilação em ambiente local, não necessariamente regressão funcional.
   - Arquivos envolvidos: pipeline Next/Turbopack; o travamento aconteceu sem stack útil.
   - Sugestão: investigar com profiling do build e reduzir a área de superfície do bundle se o travamento persistir.

## Inconsistências de regra de negócio

- Dashboard usa cargas públicas.
  - Status: consistente.
  - Evidência: `src/app/[locale]/dashboard/page.tsx`, `getPublicCargos()`.
- Minhas cargas usa usuário logado.
  - Status: consistente.
  - Evidência: `src/app/[locale]/minhas-cargas/page.tsx`, `getCurrentUserCargos(user.id)`.
- Cargas funciona como listagem pública/marketplace.
  - Status: consistente.
  - Evidência: `src/app/[locale]/cargas/page.tsx`, `src/features/cargo/services/cargo.service.ts`.
- Rastreio não parece duplicar dashboard.
  - Status: sem conflito evidente nos arquivos checados.
- Perfil/auth mantêm fronteiras razoáveis.
  - Status: consistente, mas ainda com bastante lógica local em auth.

## Inconsistências visuais

- A identidade dark do Dashboard já foi propagada para componentes-chave, mas algumas rotas antigas ainda precisam de revisão visual completa.
- O mapa e os overlays estão mais consistentes, porém seguem dependentes de inspeção manual em viewport real para garantir ausência total de sobreposição.
- O tema light foi preservado nas bases principais, mas não houve uma inspeção visual exaustiva de todas as telas nesta auditoria.

## Acessibilidade

### Implementado

- Sheets e dialogs principais usam `role="dialog"` e `aria-modal="true"`.
  - Evidência: `src/shared/components/bottom-sheet/BottomSheet.tsx`, `src/shared/layout/admin-chrome/admin-chrome.tsx`, `src/shared/layout/app-header/app-header.tsx`.
- Há foco inicial/retorno de foco e fechamento via `Escape` na base de sheet.
- Controles de tema/idioma e notificações têm labels e interações acessíveis.

### Pendente

- Checklist ponta a ponta de acessibilidade em todas as rotas e overlays.
- Verificação de contraste e foco visível em cada componente legado.
- Alternativa textual completa para toda interação complexa de mapa, se ainda houver pontos não cobertos.

### Problemas críticos

- Nenhum problema crítico novo foi confirmado além do bug de auth test e da necessidade de revisão visual/a11y em rotas antigas.

## i18n

### Implementado

- Arquivos sincronizados entre `pt-BR`, `en-US` e `es`.
- Check atual passou com alinhamento total de chaves.
- Rotas, tabs, menus, notificações, prioridade e controles globais já usam mensagens traduzidas em boa parte da UI.

### Hardcoded strings / pendências

- Ainda existem pontos legados com textos locais/constantes técnicas no código, principalmente em áreas de compatibilidade e serviços.
- Recomenda-se continuar bloqueando novos textos hardcoded e revisar os pontos críticos por tela.

## TypeScript e qualidade

### Implementado

- `tsconfig.json` está em `strict`.
- Há tipagem e contratos explícitos em várias features.
- Preferência por `zod` em schemas e validações centrais.
- Mocks relevantes estão tipados e, em boa parte, conectados a serviços.

### Pendente / risco

- `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes` ainda não estão habilitados.
- Ainda existem casts com `as` e outros pontos de compatibilidade.
- Formulários ainda não estão totalmente padronizados em Zod + React Hook Form.
- Alguns serviços e helpers ainda dependem de leitura de mocks/estado com controles legados.

## Documentação e ADRs

### Docs existentes

- Arquitetura: `docs/architecture/project-tree.md`, `docs/architecture/code-quality-audit.md`.
- Design system: `docs/design-system/*`.
- Acessibilidade: `docs/accessibility/accessibility-guidelines.md`.
- i18n: `docs/i18n/i18n-guidelines.md`.
- Performance/UX mobile: `docs/ux/*`, `docs/engineering/z-index-scale.md`.
- Features: `docs/features/*`.

### ADRs existentes

- `docs/adr/0001-feature-based-architecture.md`
- `docs/adr/0002-mobile-first-native-app-experience.md`
- `docs/adr/0003-theme-system-dark-light.md`
- `docs/adr/0004-internationalization-strategy.md`
- `docs/adr/0005-mock-first-domain-services.md`
- `docs/adr/0006-accessibility-baseline.md`
- `docs/adr/0007-humanized-language-for-low-literacy-users.md`
- `docs/adr/0008-gamified-operational-timeline.md`
- `docs/adr/0009-dashboard-public-cargos-vs-my-cargos.md`
- `docs/adr/0010-map-accessibility-and-alternative-route-summary.md`
- `docs/adr/0011-code-quality-and-performance-guidelines.md`
- `docs/adr/0012-priority-tab-operational-design.md`
- `docs/adr/0013-feature-mocks-and-business-scope.md`
- `docs/adr/0014-form-validation-zod-react-hook-form.md`
- `docs/adr/ADR-mobile-bottom-sheet-and-map-pattern.md`

### Faltas / próximos documentos

- Não identifiquei lacunas documentais críticas nesta auditoria; a maior recomendação é manter as docs sincronizadas com qualquer mudança de rota, overlay ou contrato de dados.

## Recomendação de próxima sprint

1. Corrigir o bug de OTP do cadastro para fechar o teste de integração.
2. Investigar e destravar o `next build`.
3. Consolidar os overlays mobile sobre a base única de `BottomSheet`, removendo dependências legadas quando seguro.
4. Completar a migração de formulários prioritários para Zod + React Hook Form.
5. Endurecer TypeScript progressivamente e reduzir `as`/compat shims.
6. Fazer QA visual por rota/breakpoint, especialmente em telas antigas e no mapa.
7. Criar stories reais para os componentes que já estão documentados como Storybook-ready.

## Comandos executados

- `npm run typecheck`
  - Resultado: passou.
- `npm run lint`
  - Resultado: passou.
- `npm run check:i18n`
  - Resultado: passou. `1230 keys aligned in pt-BR, en-US, es`.
- `npm test`
  - Resultado: falhou em `tests/integration/api/auth.register.post.test.ts` com `expected 201 to be 401` no cenário de OTP incorreto.
- `npm run build`
  - Resultado: travou em `Creating an optimized production build ...`; processo precisou ser encerrado manualmente para não deixar build órfão.

## Resultado

O projeto está em um bom patamar de evolução: a maior parte das entregas de arquitetura, mobile-first, i18n, tema, notificações, prioridade e separação de escopo já está implementada. O que mais pressiona a próxima sprint é a correção do teste de auth, a estabilização do build e a limpeza gradual dos caminhos legados que ainda coexistem com as implementações novas.
