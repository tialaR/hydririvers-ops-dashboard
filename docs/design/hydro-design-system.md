# Hydro Design System

O Hydro Design System (Hydro DS) e a fonte oficial de identidade visual mobile do app.

## Estrutura oficial

- `src/shared/design-system/tokens`
- `src/shared/design-system/materials`
- `src/shared/design-system/primitives`
- `src/shared/design-system/hydro-design-system-root`

## Tokens

- Brutos: `--hydro-kit-*` em `src/shared/design-system/tokens/generated`
- Semanticos: `--hydro-*` em `src/shared/design-system/tokens/generated/hydro.semantic.module.scss`

## Materials

- `liquid-glass-material` em `src/shared/design-system/materials/liquid-glass-material`

## Primitives oficiais

- Surface, Button, SegmentedControl, SearchField, Toolbar, Sheet, Menu, ScrollEdge, TextField, Progress, Switch, TabBar, Popover, Window

## Como consumir

1. O app aplica `HydroDesignSystemRoot` no layout localizado em `src/app/[locale]/layout.tsx`.
2. Componentes devem consumir tokens Hydro (`--hydro-*` e `--hydro-kit-*`) e primitives oficiais.
3. Novas variaveis fora de `src/shared/design-system` sao proibidas.

## Proibicoes

- Nao criar novos `--ios-*`
- Nao criar novos tokens em `globals.scss`
- Nao usar CSS global para novos tokens
- Nao criar novas primitives fora da lista oficial
