# Workflow de documentação

## Objetivo

Manter a documentação do HydroRivers viva, rastreável e útil para onboarding, revisão arquitetural e auditorias.

## O que revisar sempre

- `docs/adr/README.md` e ADRs afetadas;
- `docs/audits/*`;
- `docs/product/*`;
- `docs/architecture/*`;
- `docs/features/*`;
- `docs/testing/*`;
- `docs/i18n/*`;
- `docs/design-system/*`;
- `docs/ONBOARDING.md`.

## Checklist prático

- a mudança precisa estar documentada em uma página existente ou nova?
- existe ADR que explique a decisão?
- há screenshots, exemplos ou links para o código real?
- a documentação evita prometer algo que o código ainda não entrega?
- a mudança altera onboarding, scripts ou rotas e precisa de atualização adicional?

## Como automatizar sem exagero

- usar `npm run audit:docs` para checar a presença dos documentos base;
- usar `npm run check:onboarding` para detectar perda de artefatos essenciais;
- manter os ADRs como fonte de decisão, não como repetição do código.

## Boa prática

Se a alteração for arquitetural, atualizar a doc no mesmo PR. Se a alteração for pequena, pelo menos registrar o impacto em um audit ou ADR relacionado.
