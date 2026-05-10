# Arquitetura do Dashboard

## Visão geral

O Dashboard é o cockpit operacional do HydroRivers. Ele não usa a mesma composição dominante de `Cargas`; em vez disso, consolida KPIs, atenção agora, corredores, atividade recente e atalhos para as rotas certas.

## Componentes principais

- `src/app/[locale]/dashboard/page.tsx` compõe a página.
- `src/features/dashboard/components/dashboard-overview/dashboard-overview.tsx` monta a experiência operacional.
- `src/features/dashboard/components/dashboard-overview/dashboard-overview.module.scss` cuida da apresentação.

## Service de apoio

- `src/features/marketplace/services/marketplace.service.ts`
  - `getOperationalDashboardSummary()`
  - deriva KPIs, itens de atenção, corredores e atividade recente a partir dos mocks existentes.

## Mocks usados

- `src/.mock-data` e `src/shared/server/mock-db.ts` fornecem os dados base.
- As entidades reaproveitadas incluem cargas, negociações e frota.

## Fluxo de dados

1. A página do Dashboard carrega a tradução da rota.
2. O componente `DashboardOverview` pede o resumo operacional.
3. O service agrega os dados em uma visão curta e determinística.
4. A UI renderiza KPIs, atenção agora, corredores e atividade recente.
5. CTAs levam a `Cargas` e `Minhas cargas`.

## Relação com outras rotas

- `Cargas` continua sendo marketplace público.
- `Minhas cargas` continua sendo a carteira privada do usuário.
- `Dashboard` é a torre de controle da operação.

## i18n

- Texto da página e da visão operacional usa `next-intl`.
- As chaves ficam alinhadas em `pt-BR`, `en-US` e `es`.

## Testes

- teste de página do Dashboard;
- teste do service operacional;
- teste de navegação ativa;
- check de i18n.

## Pontos de extensão

- novos KPIs;
- novos corredores;
- preview de mapa mais rico;
- filtros de atenção agora;
- métricas operacionais adicionais.
