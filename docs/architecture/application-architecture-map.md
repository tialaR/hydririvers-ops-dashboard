# Mapa de arquitetura da aplicação

## Visão geral

HydroRivers usa Next.js App Router com React 19, TypeScript e `next-intl`. O desenho arquitetural segue uma ideia feature-first: `app` orquestra rotas e providers, `features` concentra domínio e lógica por área, `shared` guarda UI, layouts, hooks e utilidades realmente compartilhadas.

O resultado é um sistema em que a página monta a experiência, a feature fornece a lógica e os componentes, e o shared fornece a fundação comum. Essa divisão é visível em rotas como dashboard, cargas, mapa, auth, perfil, embarcações, impacto, governo e negociações.

## Árvore resumida

```txt
src/
  app/
    [locale]/
      dashboard/
      cargas/
      minhas-cargas/
      negociacoes/
      rastreio/
      embarcacoes/
      impacto/
      governo/
      login/
      cadastro/
      perfil/
      admin/
      not-found.tsx
  features/
    auth/
    cargo/
    cargo-market/
    dashboard/
    negotiations/
    vessels/
    tracking/
    impact/
    government/
    notifications/
    ai-assist/
    home/
  shared/
    components/
    layout/
    ui/
    hooks/
    server/
    routing/
    i18n/
    preferences/
    constants/
    providers/
    qa/
    observability/
```

## Papel de `app`

`app` contém as rotas reais do produto e os elementos de composição de alto nível.

- `src/app/[locale]/layout.tsx` injeta `next-intl`, `ThemeProvider`, `ToastProvider`, `AdminChrome` e `MockMode`.
- Cada página `page.tsx` decide o que buscar e qual feature renderizar.
- `not-found.tsx` fornece a 404 localizada.
- `api/*` expõe os handlers locais da aplicação.

### Rotas principais

| Rota | Objetivo | Componentes centrais | Dados/serviços |
| --- | --- | --- | --- |
| `/[locale]` | Landing/hero institucional | `HydroHero`, `ValuePillars` | conteúdo estático e i18n |
| `/[locale]/dashboard` | cockpit operacional | `PageShell`, `DashboardOverview` | KPI operacionais, atenção agora, corredores, atividade recente |
| `/[locale]/cargas` | marketplace público | `PageShell`, `OperationsBoard` | `getPublicCargos`, `listNegotiations`, `listTrackingEvents`, `listVessels` |
| `/[locale]/minhas-cargas` | carteira do usuário logado | `PageShell`, `Breadcrumb`, `MyCargoesList` | `getSessionUser`, `getCurrentUserCargos` |
| `/[locale]/cargas/nova` | publicar nova carga | `PageShell`, `Breadcrumb`, `NewCargoForm` | `publishCargoAction` |
| `/[locale]/cargas/[id]` | detalhe da carga | `PageShell`, `Breadcrumb`, `CargoDetail` | `getCargoById`, viewer/visibilidade |
| `/[locale]/negociacoes` | lista de negociações | `PageShell`, `NegotiationBoard` | `listNegotiations` |
| `/[locale]/negociacoes/[id]` | detalhe da negociação | `PageShell`, `Breadcrumb`, `NegotiationDetail` | `getNegotiationById` |
| `/[locale]/rastreio` | rastreio/timeline | `PageShell`, `OperationsBoard` | cargas, negociações, tracking events, embarcações |
| `/[locale]/embarcacoes` | listagem de frota | `PageShell`, `VesselList` | `listVessels` |
| `/[locale]/embarcacoes/[id]` | detalhe da embarcação | `PageShell`, `Breadcrumb`, `VesselDetail` | `getVesselById` |
| `/[locale]/impacto` | visão de impacto | `PageShell`, `ImpactStory` | `impact.mock.ts` e i18n |
| `/[locale]/impacto/[id]` | detalhe de impacto | `PageShell`, `ImpactDetail` | indicadores por tema |
| `/[locale]/governo` | dashboard regulatório | `PageShell`, `GovernmentDashboard` | indicadores e workflow |
| `/[locale]/login` | acesso | `AuthForm` | auth client/server e OTP |
| `/[locale]/cadastro` | cadastro | `AuthForm` | auth client/server e OTP |
| `/[locale]/perfil` | perfil do usuário | `ProfilePanel` | `getSessionUser`, `updateProfile` |
| `/[locale]/admin` | console interno | `AdminConsole` | dados e permissões de admin |

## Papel de `features`

`features` concentra domínio, componentes específicos, serviços, schemas, tipos e mocks por área.

### Exemplos por feature

| Feature | Responsabilidade | Componentes principais | Dados/serviços |
| --- | --- | --- | --- |
| `dashboard` | cockpit operacional e leitura agregada da operação | `DashboardOverview`, KPIs, painéis de atenção e atividade | `marketplace.service.ts`, mocks de cargas/negociações/frota |
| `cargo` | domínio central de cargas | `cargo.service.ts`, `cargo.types.ts`, `cargo-priority.types.ts` | filtros, tipo de carga, prioridade |
| `cargo-market` | experiência de marketplace e publicação | `CargoCard`, `CargoDetail`, `CargoList`, `MyCargoesList`, `NewCargoForm` | `publishCargoAction`, `cargo-proposal.schema.ts`, `new-cargo-form.schema.ts` |
| `auth` | login, cadastro, sessão e perfil | `AuthForm`, `AuthActions`, `ProfilePanel`, `LogoutPanel` | `auth.client.ts`, `auth-schemas.ts`, `profile.schema.ts` |
| `negotiations` | board e detalhe de negociação | `NegotiationBoard`, `NegotiationDetail` | `marketplace.service.ts`, domínio de negociação |
| `vessels` | frota e detalhes de embarcação | `VesselList`, `VesselDetail`, `VesselCard` | `marketplace.service.ts`, mocks de frota |
| `tracking` | rastreio e timeline | `TrackingTimeline` | `tracking.helpers.ts`, `trackingEvents` |
| `impact` | leitura de impacto e narrativa territorial | `ImpactStory` | `impact.mock.ts` |
| `government` | painel regulatório | `GovernmentDashboard` | métricas e workflow regulatório |
| `notifications` | estado de notificações | serviços client-side | localStorage + eventos |
| `ai-assist` | assistência contextual | `CargoStatusAssistantCard` | acesso por regra de negócio |
| `home` | landing/institucional | `HydroHero`, `ValuePillars` | conteúdo estático e i18n |

## Papel de `shared`

`shared` deve conter apenas o que é realmente reutilizável entre features.

### Subpastas importantes

- `shared/layout`: `AdminChrome`, `AppHeader`, `AppFooter`.
- `shared/ui`: `Button`, `Card`, `Badge`, `BottomSheet`, `Breadcrumb`, `Tooltip`, `PageShell`, `ThemeToggle`, `LocaleSwitcher`, `HydroIcon`, `Toast`, `MockMode`.
- `shared/hooks`: hooks genéricos como `useLockBodyScroll`.
- `shared/server`: auth, mock-db, mock-scenarios, repositories e api-errors.
- `shared/routing`: `app-routes.ts`, `api-routes.ts`, `route-search-params.ts`, `route-types.ts`.
- `shared/i18n`: helpers para conteúdo mock traduzível e formatação.
- `shared/preferences`: persistência de tema e locale.
- `shared/constants`: tokens globais como z-index.

## Fluxo de dados

1. A página em `app` lê params/locale e decide qual feature renderizar.
2. A feature consulta serviços locais ou mocks via `shared/server` ou `features/*/services`.
3. Componentes específicos recebem dados prontos para renderizar.
4. Interações de escrita vão para API routes ou server actions.
5. A persistência local usa `.mock-data`, cookies, localStorage e schemas.
6. Mudanças relevantes disparam eventos de sincronização como `hydrorivers:mock-changed`, `hydrorivers:auth-changed` e `hydrorivers:notifications-changed`.

## Serviços, hooks e schemas

### Services

- `features/*/services` executam leitura, escrita e regras de domínio.
- `shared/server/*` centraliza persistência mock, sessão e revalidação.
- Os handlers API fazem validação mínima e chamam serviços de domínio.
- `proxy.ts` no root cuida de redirects e guardas de locale quando necessário.

### Hooks

- Hooks ficam próximos da feature quando carregam estado de domínio.
- Hooks compartilhados ficam em `shared/hooks`.
- Exemplo: `useAuthSession`, `useLockBodyScroll`.

### Schemas e tipos

- `auth-schemas.ts` concentra validação de login/cadastro/OTP.
- `profile.schema.ts`, `new-cargo-form.schema.ts` e `cargo-proposal.schema.ts` adicionam validação de formulários críticos.
- Tipos de domínio vivem em `features/*/domain` ou `features/*/types`.

## Estratégia de i18n

- Idiomas suportados: `pt-BR`, `en-US`, `es`.
- `next-intl` fornece `getTranslations`, `useTranslations`, `NextIntlClientProvider` e `setRequestLocale`.
- Rotas e textos usam chaves em `messages/*.json`.
- Conteúdo mockado passa por `translateMock` quando é visível ao usuário.
- `check:i18n` garante alinhamento entre os três idiomas.

## Estratégia de tema

- Tema global controlado por `ThemeProvider`.
- Estado persistido em cookie/localStorage.
- `ThemeToggle` e seletor de idioma ficam no footer/sidebar, não no header.
- A UI usa dark mode como padrão visual, com supporto a light mode sem inverter a identidade do produto.

## Estratégia mobile-first

- Sidebar, header e overlays têm comportamento diferente no mobile.
- Bottom nav, bottom sheets e menu mobile usam portal e lock de scroll.
- O mapa tem versão compacta e fullscreen com orientação landscape como melhor experiência.
- Z-index é padronizado em `src/shared/constants/z-index.ts`.

## Estratégia de testes

- Unitários: validam schemas, helpers, i18n, acesso a dados e regras de domínio.
- Integração: validam handlers API, auth, cargas, negociações, mock-mode.
- E2E: validam login, cargas, tema, rota privada e fluxos críticos.
- Check de i18n: impede desalinhamento de chaves entre idiomas.
- O build de produção ainda é o principal ponto técnico a destravar para confiança total.

## O que ainda não faz

- Não é um sistema com backend real completo para todas as integrações.
- Não tem React Hook Form em todos os formulários.
- Não possui stories reais do Storybook ainda.
- Não substitui uma auditoria visual real em device/browser.
- Não é um mapa de geoprocessamento ou navegação de precisão; é um mapa operacional.
