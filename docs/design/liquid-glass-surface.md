# LiquidGlassSurface

Primitive reutilizável do Design System HydroRivers para **containers de UI** com aparência *Liquid Glass* dinâmica, derivada dos anexos **Dynamic UI Surface** (frames Light / Dark do Figma).

## Origem

- PNGs de referência: superfícies sobre barras de cor (stress test de translucidez).
- CSS exportado do Figma: camadas *Fill + Shadow* e *Glass Effect* para **Small**, **Medium** e **Large** UI em modos **light** e **dark**, mais variante **Tinted** nos pills pequenos.

## Material vs Surface

| Conceito | O que é | Exemplo |
| --- | --- | --- |
| **Material** | Densidade de vidro com blur (`backdrop-filter`) | `liquidGlassMaterial` + `materialRegular` |
| **Surface** | Container com receita de fill/blend/sombra por tamanho | `LiquidGlassSurface` |

Materials descrevem **camadas de fundo translúcidas**; surfaces descrevem **painéis e cápsulas** com gradientes e blend modes do kit Dynamic UI. Primitives de interação (botão, sheet, tab bar) **podem compor** uma surface no futuro; esta primitive **não** substitui botão nem sheet.

## O que foi removido do CSS bruto

- Barras `_Colors/Dark` e `_Colors/Light` usadas só para teste visual
- `left`, `top`, `width`/`height` de artboard (600×860, 1000×860)
- `position: absolute` de frames de demonstração
- Labels de amostra (*Small UI Dynamic…*, *Medium UI Light Mode*)
- `order`, `flex-grow`, padding de canvas (`30px 10px`, `gap: 50px`)
- Fundo `#FFFFFF` / `#000000` do frame raiz Light/Dark

## O que foi mantido

- Gradientes e `background-blend-mode` por tamanho e tom
- Sombra `0 8px 40px rgba(0, 0, 0, 0.12)` quando `elevated`
- Raios: pill (1000px) para small; card (34px) para medium/large
- Overlay *Glass Effect* (`rgba(0,0,0,.004)` ou screen no small dark)
- Opacidade visual `.67` nas receitas dark de small/medium/large

## Implementação

| Figma | Código |
| --- | --- |
| *Fill + Shadow* | `::before` |
| *Glass Effect* | `::after` |
| Conteúdo | `.content` com `z-index: 2` |

Pseudo-elementos usam `border-radius: inherit` da raiz. A surface **não** captura clique nem define `role` — é layout/visual apenas.

## API

```tsx
import { LiquidGlassSurface } from '@/shared/design-system';

<LiquidGlassSurface size="medium" variant="dynamic" tone="auto">
  …conteúdo…
</LiquidGlassSurface>
```

### Props

| Prop | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Conteúdo acima das camadas de vidro |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Receita de fill + `min-height` de referência |
| `variant` | `'dynamic' \| 'tinted' \| 'plain'` | `'dynamic'` | Receita visual |
| `tone` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Tom light/dark da receita dynamic/plain |
| `radius` | `'pill' \| 'md' \| 'lg' \| 'xl'` | `'xl'` | Raio da borda (34px em `xl`) |
| `elevated` | `boolean` | `true` | Sombra de elevação no `::before` |
| `className` | `string` | — | Classe adicional na raiz |
| `as` | `'div' \| 'section' \| 'article' \| 'aside'` | `'div'` | Elemento semântico |

## Tamanhos (Figma → `size`)

| `size` | Uso | `min-height` fallback |
| --- | --- | --- |
| `small` | Pills, chips, cápsulas compactas | 48px |
| `medium` | Cards, painéis médios | 180px |
| `large` | Painéis altos, hero containers | 300px |

Largura é **fluida** (não fixa em 80px / 585px do Figma).

## Variantes

| `variant` | Descrição |
| --- | --- |
| `dynamic` | Receita light/dark por `size` (gradientes do anexo) |
| `tinted` | Pill azul `#0091FF` com blend `plus-darker, overlay, saturation` |
| `plain` | Fill tokenizado `--hydro-color-surface` sem receita de vidro |

## Tom e tema

- `data-tone="light" | "dark" | "auto"` na raiz
- Ancestral com `data-theme="light" | "dark"` ajusta `auto` via `:global([data-theme='…'])`
- `auto` sem tema: segue `prefers-color-scheme`

## Tokens e fallbacks

| Token / variável local | Uso |
| --- | --- |
| `--hydro-color-accent` | Referência em tinted (fallback `#0091FF`) |
| `--hydro-color-surface` | Variant `plain` light |
| `--hydro-color-surface-elevated` | Variant `plain` dark |
| `--hydro-radius-pill` | `radius="pill"` |
| `--hydro-radius-card` | `radius="xl"` (34px) |
| `--hydro-motion-control` | Transições de sombra/opacidade |
| `--hydro-motion-easing-standard` | Easing |
| `--surface-shadow` | `0 8px 40px rgba(0,0,0,.12)` |
| `--surface-radius-pill` | 1000px |
| `--surface-radius-card` | 34px |
| `--surface-*-min-height` | 48 / 180 / 300px |

## Usos futuros (não implementados neste PR)

- Cards e list items mobile
- Panels e sidebars
- Fundos de `LiquidGlassSheet` / popover
- Toolbars e tab bars (como wrapper, não substituindo os primitives)
- Containers do lab `mobile-cargo-list-lab`

## Não usar como

- **Botão** — use `LiquidGlassButton` (foco, `disabled`, `aria-*`)
- **Sheet / modal** — use `LiquidGlassSheet`
- **Link ou controle** — envolva com elemento interativo apropriado

## Arquivos

- `src/shared/design-system/primitives/liquid-glass-surface/liquid-glass-surface.tsx`
- `src/shared/design-system/primitives/liquid-glass-surface/liquid-glass-surface.module.scss`
- `tests/unit/shared/design-system/liquid-glass-surface.test.tsx`
