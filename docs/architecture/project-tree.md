# Árvore da aplicação

## Visão geral

HydroRivers usa uma organização feature-first com um núcleo `shared` para componentes, layout, utilitários e providers reutilizáveis. A camada `app` orquestra rotas, layout global, providers e APIs. As features concentram regra de negócio, mocks, serviços e componentes específicos de domínio.

## Estrutura

```txt
src/
  app/
    [locale]/
    api/
    globals.scss
  shared/
    ui/
    layout/
    routing/
    server/
    providers/
    config/
    lib/
    hooks/
    utils/
  features/
    auth/
    dashboard/
    cargo/
    cargo-market/
    cargo-agent/
    negotiations/
    tracking/
    vessels/
    impact/
    government/
    marketplace/
    notifications/
    onboarding/
    home/
    ai-assist/
  docs/
    adr/
    architecture/
    features/
    design-system/
    accessibility/
    i18n/
    testing/
```

## Pastas principais

### app

Responsável por composição de rotas, layouts de página, providers globais, endpoints e shell da aplicação.

### shared

Responsável pelo que pode ser reutilizado em mais de uma feature: botões, cards, bottom sheets, header, sidebar, tema, navegação, utilitários, roteamento e serviços comuns.

### features

Responsável por telas e capacidades de negócio específicas. Cada feature deve carregar seus próprios componentes, hooks, services, mocks, types e testes quando fizer sentido.

## Regras de uso

- Se não conhece o domínio, vai para `shared/ui` ou `shared/layout`.
- Se depende de carga, negociação, embarcação, perfil, governo ou rastreio, fica na feature.
- `shared` nunca deve importar `features`.
- `features` podem importar `shared`, mas não devem depender do interior de outra feature.

## Features em uso no HydroRivers

### auth

Login, cadastro, OTP, perfil e sessão mockada.

### dashboard

Visão operacional pública com cargas públicas, mapa e detalhes da carga selecionada.

### cargo

Regras e mocks de cargas públicas e cargas do usuário.

### cargo-market

Fluxos operacionais de listagem, detalhe, nova carga e minhas cargas.

### cargo-agent

Assistente operacional mockado para apoiar leitura e ações sobre cargas.

### negotiations

Board e detalhe de negociação.

### tracking

Linha do tempo operacional da carga.

### vessels

Listagem e detalhe de embarcações.

### impact

Indicadores e histórias de impacto.

### government

Painéis e visões institucionais.

### marketplace

Helpers e tipos de mercado/corredor.

### notifications

Serviço de notificações mockadas e persistência local.

### onboarding

Fluxos internos de introdução e contexto de mock.

### home

Hero e proposta de valor da aplicação pública.

### ai-assist

Camada de assistência textual já usada em cards e prompts de status.

## Quando criar nova feature

Crie uma nova feature quando houver:

- regra de negócio própria;
- permissões próprias;
- telas próprias;
- mocks próprios;
- estados vazios próprios;
- documentação própria.

## Quando usar shared

Use `shared` quando o componente ou utilitário:

- não conhece domínio;
- pode ser renderizado em qualquer feature;
- tem comportamento e API genéricos;
- precisa ser preparado para Storybook.
