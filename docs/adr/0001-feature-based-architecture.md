# Adoção de arquitetura por features com App Router, locales e `shared`

## Status

Aprovado

## Contexto

O HydroRivers cresceu com dashboard, cargas, minhas cargas, rastreio, negociações, impacto, governo, auth, perfil e notificações. A aplicação usa Next.js App Router com segmento de locale (`app/[locale]`) e precisa manter composição previsível sem espalhar regra de domínio por páginas.

## Problema

Quando páginas, componentes visuais, serviços e mocks ficam misturados, a navegação vira um conjunto de exceções. Isso dificulta evolução, manutenção, reuso e onboarding de novos devs.

## Decisão

Manter `app` para rotas, layouts, providers e composição de telas; `features` para estado, serviços, hooks, tipos, mocks e componentes de domínio; e `shared` apenas para UI, layout e utilitários realmente reutilizáveis entre domínios.

## Consequências positivas

- fica mais fácil localizar lógica de negócio;
- reduz duplicação de componentes, hooks e helpers;
- torna os contratos por domínio mais claros;
- melhora a legibilidade de rotas localizadas e de telas públicas/privadas;
- facilita a evolução para backend real sem refatoração ampla.

## Consequências negativas ou trade-offs

- exige disciplina para não transformar `shared` em um depósito genérico;
- pode aparecer algum shim ou reexport temporário durante migrações;
- requer revisão recorrente para evitar imports relativos frágeis.

## Alternativas consideradas

- manter estrutura centrada só em `app`;
- criar uma camada global única para UI e lógica;
- organizar apenas por tipo de arquivo sem fronteira de domínio.

Essas alternativas aumentariam acoplamento e dificultariam a separação entre dashboard público, minhas cargas, negociação e overlays mobile.

## Critérios de revisão futura

- se `shared` começar a concentrar regra de negócio, mover o comportamento de volta para a feature correspondente;
- quando um shim não tiver mais importadores, removê-lo em uma etapa própria;
- revisar se novas features conseguem seguir o mesmo padrão sem exceções especiais.

## Links relacionados

- [ADR 0002](./0002-mobile-first-native-app-experience.md)
- [ADR 0004](./0004-internationalization-strategy.md)
- [ADR 0009](./0009-dashboard-public-cargos-vs-my-cargos.md)
- [application architecture map](../architecture/application-architecture-map.md)

## Data

2026-05-10

## Responsáveis

HydroRivers frontend/product team
