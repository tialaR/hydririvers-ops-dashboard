# ADRs do HydroRivers

Esta pasta reúne decisões arquiteturais reais do projeto, priorizando o que já está refletido no código, na arquitetura e nos fluxos de produto.

## Como ler

- `Aprovado` / `Aceito`: decisão já adotada no projeto.
- `Proposto`: decisão recomendada, mas ainda sujeita a implementação.
- ADRs legados sem numeração podem existir como precursoras de uma decisão depois formalizada.

## Fundacionais

- [0001 - Adoção de arquitetura por features com App Router, locales e `shared`](./0001-feature-based-architecture.md)
- [0002 - Mobile-first com identidade de app nativo](./0002-mobile-first-native-app-experience.md)
- [0003 - Sistema de temas dark/light com tokens globais](./0003-theme-system-dark-light.md)
- [0004 - Estratégia de i18n para pt-BR, en-US e es-ES](./0004-internationalization-strategy.md)
- [0005 - Services por domínio usando mocks/localStorage](./0005-mock-first-domain-services.md)
- [0006 - Padrão mínimo de acessibilidade da HydroRivers](./0006-accessibility-baseline.md)

## Produto e experiência

- [0007 - Linguagem humanizada para públicos com baixa familiaridade digital](./0007-humanized-language-for-low-literacy-users.md)
- [0008 - Timeline gamificada sem perder clareza operacional](./0008-gamified-operational-timeline.md)
- [0009 - Dashboard exibe cargas públicas; Minhas Cargas exibe cargas do usuário logado](./0009-dashboard-public-cargos-vs-my-cargos.md) _(superseded by 0016)_
- [0016 - Fronteiras entre Dashboard, Cargas e Minhas cargas](./0016-dashboard-cargas-minhas-cargas-boundaries.md)
- [0017 - Dashboard como cockpit operacional](./0017-dashboard-as-operational-cockpit.md)
- [0019 - Home navigation boundaries](./0019-home-navigation-boundaries.md)
- [0020 - Matriz central de papéis e permissões](./0020-roles-permissions-access-control.md)
- [0021 - Role-based access e QA personas (mock-friendly)](./0021-role-based-access-and-qa-personas.md)
- [0022 - Minhas cargas: mock data por perfil (shipper vs carrier)](./0022-my-cargoes-role-based-mock-data.md)
- [0023 - Padrão de layout mobile (bottom nav aware + bottom sheets)](./0023-mobile-layout-and-bottom-navigation-pattern.md)
- [0024 - Dashboard como resumo operacional guiado](./0024-dashboard-as-guided-operational-summary.md)
- [0025 - Header responsivo (busca nao pode esmagar acoes)](./0025-header-responsive-actions-pattern.md)
- [0026 - Negociações como central de decisões comerciais](./0026-negotiations-as-commercial-decision-center.md)
- [0027 - Detalhe de negociação como guia de decisão](./0027-negotiation-detail-as-decision-guide.md)
- [0028 - Impacto com storytelling baseado em evidências](./0028-impact-page-evidence-based-storytelling.md)
- [0001-desktop-expanded-map-route - Rota própria do mapa desktop expanded](./0001-desktop-expanded-map-route.md) _(Proposto; ver também [0001 feature-based](./0001-feature-based-architecture.md))_
- [0010 - Mapa visual com alternativa textual acessível](./0010-map-accessibility-and-alternative-route-summary.md)
- [0012 - Priority Tab Operational Design](./0012-priority-tab-operational-design.md)
- [0013 - Feature Mocks and Business Scope](./0013-feature-mocks-and-business-scope.md)

## Qualidade, validação e performance

- [0011 - Code quality and performance guidelines](./0011-code-quality-and-performance-guidelines.md)
- [0014 - Form Validation with Zod and React Hook Form](./0014-form-validation-zod-react-hook-form.md)
- [0015 - Estratégia de validação e testes para mudanças críticas](./0015-validation-and-test-strategy.md)
- [0029 - Dados mock fictícios e determinísticos](./0029-mock-data-fictional-deterministic.md)

## Mapa hidroviário (desktop expanded V2)

- [0030 - Provider profissional do mapa hidroviário (MapLibre + fallback SVG)](./0030-professional-hydroway-map-provider.md) _(Proposto)_
- [0031 - Pipeline geográfico do mapa hidroviário (GeoJSON mock → dados oficiais)](./0031-hydroway-geodata-pipeline.md) _(Proposto)_
- [Plano operacional V2](../workflows/professional-hydroway-map-v2-plan.md)

## Overlays e mobile

- [ADR-mobile-bottom-sheet-and-map-pattern](./ADR-mobile-bottom-sheet-and-map-pattern.md)

## Template

- [0000 - Template](./0000-template.md)

## Observações

- Quando uma decisão mudar de forma significativa, prefira atualizar o ADR existente em vez de criar uma cópia paralela.
- Se um comportamento ainda estiver em fase de transição, documente o estado atual e o próximo passo em vez de prometer conclusão.
