# Liquid Glass Materials

Base reutilizável de **Material / Glass Density** do Design System HydroRivers, derivada dos anexos **iOS and iPadOS 26 (Community)** — frames `_Materials`, `_Materials / Mode Options` e variantes Ultrathin → Chrome (Light / Dark / IC Light / IC Dark).

## Origem

- ZIPs/PNGs do kit Figma (Materials).
- CSS exportado filtrado: apenas `background`, `background-blend-mode`, `backdrop-filter` e opacidades por densidade — sem `left`/`top`, wallpaper, bordas tracejadas de debug ou textos de amostra.

## Material vs component

| Conceito | O que é | Exemplo |
| --- | --- | --- |
| **Material** | Tokens + classes CSS de densidade do vidro | `liquidGlassMaterial` + `materialRegular` |
| **Primitive** | Componente React com API, a11y e layout | `LiquidGlassSheet`, `LiquidGlassPopover` |

Primitives **consomem** materials; features **não** devem copiar receitas de vidro quando existir primitive adequado.

## Densidades

| Classe | Uso recomendado |
| --- | --- |
| `materialUltrathin` | Fundo quase invisível, hints sutis |
| `materialThin` | Áreas leves, secondary chrome |
| `materialRegular` | **Padrão** — sheets, popovers, painéis |
| `materialThick` | Overlays fortes, modais empilhados |
| `materialChrome` | Barras, controles especiais (blur 25px light / 50px dark) |

## Valores (Figma → tokens)

### Blur (`--hydro-material-blur-*`)

| Densidade | Valor |
| --- | --- |
| ultrathin, thin, regular, thick | `50px` |
| chrome (light) | `25px` (`--hydro-material-blur-chrome`) |
| chrome (dark) | `50px` (via regra de tom escuro) |

### Light backgrounds

| Densidade | Background | Blend |
| --- | --- | --- |
| ultrathin | gradient `.03` + `rgba(255,255,255,.07)` | `color-dodge, normal` |
| thin | gradient `.4` + `rgba(255,255,255,.05)` | `color-dodge, normal` |
| regular | gradient `.6` + `rgba(255,255,255,.25)` | `color-dodge, plus-lighter` |
| thick | gradient `.84` + `rgba(255,255,255,.34)` | `color-dodge, plus-lighter` |
| chrome | `rgba(255,255,255,.75)` | `hard-light` |

### Dark backgrounds

| Densidade | Background | Blend |
| --- | --- | --- |
| ultrathin | `rgba(0,0,0,.02)` | `normal` |
| thin | `rgba(0,0,0,.26)` | `normal` |
| regular | `rgba(0,0,0,.41)` | `normal` |
| thick | `rgba(0,0,0,.6)` | `normal` |
| chrome | gradient `#7C7C7C` + `rgba(28,28,28,.9)` | `overlay, normal` |

Tokens completos vivem em `liquid-glass-material.module.scss` com prefixo `--hydro-material-*`.

## Tom (light / dark / auto)

- `data-tone="light" | "dark" | "auto"` no elemento com `.liquidGlassMaterial`
- `data-theme="light" | "dark"` no ancestral (ex.: shell mobile) — respeitado via `:global([data-theme='…'])`
- `auto`: segue `prefers-color-scheme` quando não há tema explícito no ancestral

Sem classe de densidade, o material ativo equivale a **regular** (light por padrão, dark com tema/`data-tone`).

## Como consumir

```tsx
import materialStyles from '@/shared/design-system/materials/liquid-glass-material/liquid-glass-material.module.scss';

<div
  className={`${materialStyles.liquidGlassMaterial} ${materialStyles.materialRegular}`}
  data-tone="auto"
/>;
```

TypeScript (validação de props futuras):

```ts
import {
  liquidGlassMaterialStyles,
  liquidGlassMaterialDefaultStyle,
  type LiquidGlassMaterialStyle,
} from '@/shared/design-system/materials/liquid-glass-material';
```

## Integração com primitives (futuro)

```tsx
// Exemplo — ainda não implementado nos primitives
<LiquidGlassSheet material="regular" />
<LiquidGlassPopover material="thick" />
```

## Regras

1. Não editar valores de material em features; ajustar tokens no módulo de materials e revisar impacto nos primitives.
2. Não colar CSS bruto do Figma (posicionamento de artboard, wallpaper, labels de demo).
3. Não usar `globals.scss` — apenas CSS Modules que importem/combinem estas classes.

## Arquivos

- `src/shared/design-system/materials/liquid-glass-material/liquid-glass-material.module.scss`
- `src/shared/design-system/materials/liquid-glass-material/liquid-glass-material.ts`
- `src/shared/design-system/materials/liquid-glass-material/index.ts`
