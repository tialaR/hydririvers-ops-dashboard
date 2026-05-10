# Auditoria de implementação: diferenciação entre Dashboard, Cargas e Minhas cargas

## Problema inicial

Dashboard e Cargas estavam contando uma história parecida demais. O Dashboard usava um conjunto de dados e composição muito próximos do marketplace, o que diminuía a necessidade de manter as duas rotas separadas.

## Decisão de produto

- Dashboard = visão operacional.
- Cargas = marketplace/listagem pública.
- Minhas cargas = área privada do usuário logado.

## O que mudou no Dashboard

- passou a renderizar um resumo operacional dedicado com `DashboardOverview`;
- recebeu CTA explícito para abrir o marketplace;
- ganhou copy própria para deixar claro que a página mostra operação, alertas e corredores, e não uma lista principal de cargas;
- passou a usar um resumo operacional agregado em vez de depender do mesmo fluxo de listagem principal de `Cargas`.

## O que mudou em Cargas

- a rota passou a usar somente cargas públicas;
- a copy da página foi atualizada para “Cargas públicas”;
- a listagem continua com filtros, busca e detalhe público;
- não usa mais a mesma lógica de contexto privado de `Minhas cargas`.

## O que mudou em Minhas cargas

- o fluxo privado continua apontando para a rota correta `/minhas-cargas/[id]`;
- os cards privados continuam reutilizando `CargoCard`, mas com link próprio;
- a listagem permanece escopada ao usuário logado;
- o detalhe privado segue seguro quando a carga não pertence ao usuário.

## Rotas afetadas

- `/[locale]/dashboard`
- `/[locale]/cargas`
- `/[locale]/cargas/[id]`
- `/[locale]/minhas-cargas`
- `/[locale]/minhas-cargas/[id]`

## Services / mocks afetados

- `src/features/marketplace/services/marketplace.service.ts`
- `src/features/cargo/services/cargo.service.ts`
- `src/features/marketplace/services/cargo-visibility.ts`
- `src/features/my-cargos/mocks/myCargos.mock.ts`
- `src/features/cargo/mocks/publicCargos.mock.ts`

## Componentes reutilizados

- `PageShell`
- `DashboardOverview`
- `OperationsBoard`
- `CargoCard`
- `MyCargoesList`

## Componentes criados ou ajustados

- `DashboardPage` passou a usar `DashboardOverview` como foco principal;
- `DashboardOverview` ganhou hero, painel de atenção e corredores mais movimentados;
- `CargoesPage` passou a buscar somente o marketplace público;
- novo serviço agregado `getOperationalDashboardSummary()`;
- novos testes para summary operacional e página do dashboard.

## Testes criados / alterados

- `tests/unit/features/marketplace.service.test.ts`
- `tests/unit/app/dashboard-page.test.tsx`
- `tests/unit/app/cargoes-page.test.tsx`
- `tests/unit/shared/config/navigation.test.ts`

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

- validação visual no navegador para confirmar a diferença entre Dashboard e Cargas em breakpoints reais;
- possível ajuste fino de copy caso o time queira um tom ainda mais executivo no Dashboard;
- o build continua sendo um risco recorrente do ambiente.
