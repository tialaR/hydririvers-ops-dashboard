# 0032 - Hydro Design System as source of truth for mobile visual identity

## Status

Accepted

## Context

O projeto acumulou tentativas paralelas de tokens e primitives (`--ios-*`, `--ds-*`, `--hx-*`, labs mobile), gerando risco de regressao, inconsistencias e acoplamento em estilos globais.

Era necessario definir uma fonte unica para identidade visual mobile sem quebrar App Router, Server Components e i18n.

## Decision

1. O Hydro Design System em `src/shared/design-system` passa a ser a fonte oficial.
2. Tokens brutos oficiais sao `--hydro-kit-*`.
3. Tokens semanticos oficiais sao `--hydro-*`.
4. Novos tokens `--ios-*` ficam proibidos.
5. Novos tokens em CSS global (`globals.scss`) ficam proibidos.
6. Consumo de tokens deve acontecer via CSS Modules e primitives oficiais.
7. Materials e primitives oficiais ficam sob:
   - `src/shared/design-system/materials`
   - `src/shared/design-system/primitives`
8. O app aplica tokens oficiais por `HydroDesignSystemRoot` no layout localizado (`src/app/[locale]/layout.tsx`), mantendo compatibilidade com Server Components.

## Consequences

- Positivas:
  - fonte unica de verdade para tokens;
  - menor risco de divergencia entre features;
  - validacao automatica via `ds:check`.
- Custos:
  - legado com `--hx-*` e `--ds-*` ainda exige migracao incremental;
  - docs antigas e experimentos precisam ser mantidos sob controle.

## Migration plan

1. Remover artefatos mortos e backups.
2. Bloquear regressao com `tools/design-system/validate-hydro-design-system.mjs`.
3. Migrar componentes legados de `--ds-*` e `--hx-*` para `--hydro-*` por lotes pequenos.
4. Eliminar aliases legados quando a cobertura de migracao atingir 100%.
