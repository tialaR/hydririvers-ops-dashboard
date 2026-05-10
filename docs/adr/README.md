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
- [0010 - Mapa visual com alternativa textual acessível](./0010-map-accessibility-and-alternative-route-summary.md)
- [0012 - Priority Tab Operational Design](./0012-priority-tab-operational-design.md)
- [0013 - Feature Mocks and Business Scope](./0013-feature-mocks-and-business-scope.md)

## Qualidade, validação e performance

- [0011 - Code quality and performance guidelines](./0011-code-quality-and-performance-guidelines.md)
- [0014 - Form Validation with Zod and React Hook Form](./0014-form-validation-zod-react-hook-form.md)
- [0015 - Estratégia de validação e testes para mudanças críticas](./0015-validation-and-test-strategy.md)

## Overlays e mobile

- [ADR-mobile-bottom-sheet-and-map-pattern](./ADR-mobile-bottom-sheet-and-map-pattern.md)

## Template

- [0000 - Template](./0000-template.md)

## Observações

- Quando uma decisão mudar de forma significativa, prefira atualizar o ADR existente em vez de criar uma cópia paralela.
- Se um comportamento ainda estiver em fase de transição, documente o estado atual e o próximo passo em vez de prometer conclusão.
