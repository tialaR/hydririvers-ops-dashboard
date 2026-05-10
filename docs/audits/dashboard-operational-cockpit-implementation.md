# Auditoria de implementação: Dashboard como cockpit operacional

## Problema inicial

O Dashboard estava parecido demais com a tela de Cargas. Isso enfraquecia a separação de rotas e fazia a navegação contar a mesma história em duas páginas diferentes.

## Decisão aplicada

- Dashboard = cockpit operacional.
- Cargas = marketplace público.
- Minhas cargas = área privada do usuário logado.

## Diferenças antes/depois

- Antes, o Dashboard podia ser lido como listagem de cargas.
- Depois, ele passou a priorizar KPIs, atenção agora, corredores, atividade recente e CTAs.
- Antes, a intenção de produto ficava implícita.
- Depois, a intenção ficou explícita em copy, docs, ADR e testes.

## Componentes criados/reutilizados

- `DashboardOverview`
- `PageShell`
- `Card`
- `HydroIcon`
- `Link`

## Services criados/alterados

- `getOperationalDashboardSummary()` em `src/features/marketplace/services/marketplace.service.ts`

## Mocks criados/alterados

- resumo operacional derivado de cargas, negociações e frota existentes;
- conteúdo do Dashboard agora é determinístico e orientado por contexto.

## i18n alterado

- `pt-BR`
- `en-US`
- `es`

## Testes criados/alterados

- `tests/unit/features/marketplace.service.test.ts`
- `tests/unit/app/dashboard-page.test.tsx`
- `tests/unit/app/cargoes-page.test.tsx`
- `tests/unit/shared/config/navigation.test.ts`

## Docs criados/alterados

- `docs/product/dashboard-operational-cockpit.md`
- `docs/architecture/dashboard-architecture.md`
- `docs/automation/dashboard-quality-workflow.md`
- `docs/audits/dashboard-current-state-audit.md`
- `docs/product/dashboard-cargas-minhas-cargas-decision.md`
- `docs/adr/0016-dashboard-cargas-minhas-cargas-boundaries.md`
- `docs/adr/0017-dashboard-as-operational-cockpit.md`

## ADR criado

- `docs/adr/0017-dashboard-as-operational-cockpit.md`

## Comandos executados

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm test`
- `npm run build`

## Resultados

- `typecheck` — passou.
- `lint` — passou.
- `check:i18n` — passou.
- `test` — passou.
- `build` — travou em `Creating an optimized production build ...`; o processo `next build` foi encerrado manualmente após identificação.

## Pendências

- validar visualmente o cockpit operacional em browser/dispositivos reais;
- continuar evitando que o Dashboard volte a parecer uma listagem de Cargas;
- destravar o build recorrente do ambiente para confiança total de release.
