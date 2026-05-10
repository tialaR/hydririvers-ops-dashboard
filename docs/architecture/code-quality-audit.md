# Auditoria de qualidade de código

## Objetivo

Aplicar DRY, Clean Code, SOLID, KISS, performance e convenções modernas sem quebrar as regras de negócio do HydroRivers.

## Problemas encontrados

- formatação monetária duplicada em mais de um ponto da UI;
- muitos componentes já estavam bem separados, mas faltavam contratos públicos claros;
- documentação estrutural ainda estava distribuída em arquivos soltos;
- parte da UI de mapa e dashboard é pesada e exige cuidado com bundle e hidratação.

## Melhorias implementadas

- adição de barrels públicos para `shared` e `features`;
- tipagem pública para componentes base;
- centralização da formatação monetária em um helper compartilhado;
- documentação de árvore, design system, acessibilidade, i18n, testes e features.

## Refatorações por feature

- `dashboard`: uso de helper compartilhado de moeda;
- `shared`: contratos públicos mais claros para UI base;
- `docs`: organização por assunto e por feature.

## Componentes extraídos

- barrels públicos em `shared/ui`, `shared/layout` e features principais.

## Helpers criados

- `formatLocaleCurrency`

## Melhorias de performance

- documentação preparada para lazy loading e Storybook;
- mapa e painéis pesados ficam explícitos como candidatos a split futuro.

## Melhorias de acessibilidade

- documentação dedicada em `docs/accessibility/accessibility-guidelines.md`;
- contratos públicos para componentes base facilitam stories e testes acessíveis.

## Pendências

- isolar mais o mapa e gráficos pesados em imports dinâmicos quando houver oportunidade segura;
- reduzir dependências internas do dashboard conforme novas features forem estabilizadas.

## Comandos executados

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm run build` (interrompido pelo hang conhecido do ambiente)
- `npm test` (falha pré-existente em `tests/integration/api/auth.register.post.test.ts`)
