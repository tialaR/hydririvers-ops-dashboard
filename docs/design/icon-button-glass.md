# IconButton — glass control (DS v2)

Global icon-only button for mobile light chrome. Lives in `src/shared/components/icon-button/`.

**Validation status (2026-06-11):** IconButton glass was validated via UI Visual Lab; the temporary lab route (`/hy-ui-lab/icon-button`), Playwright gate, and versioned screenshots were **removed** after production approval. Future visual QA recreates a disposable lab per `docs/agents/AGENTS-WORKFLOW.md` → **UI Visual Lab — automated workflow**.

## Usage

```tsx
import { IconButton } from '@/shared/components/icon-button';

<IconButton
  ariaLabel="Abrir filtros"
  iconName="filter"
  iconButtonRole="field"
  onClick={openFilters}
/>
```

- **Shell:** default `variant="v2"` — `data-icon-button-variant="glass-compact-production"` (~52px `size="md"`).
- **Glass:** `background-color: rgba(255,255,255,0.3)`, `border: 1px solid rgba(255,255,255,0.2)`, `backdrop-filter: blur(10px)`, inset + drop `box-shadow` via `--hy-icon-button-shadow`.
- **Legacy variants** (`default`, `map`, `theme`, …) keep the dark admin surface; they do not use the glass press hook.

## Architecture

| Layer | File |
|-------|------|
| Dumb UI | `icon-button.tsx` |
| Press logic | `use-icon-button-press.ts` |
| Styles + tokens | `icon-button.module.sass` |
| Icons | `icon-button-icons.tsx` |

Press feedback is driven by `data-press="idle|pressed|release"` on the `<button>`. Decorative layers:

- `span.bubbleGlow` — inner glow (`aria-hidden`)
- `span.icon` — glyph (`aria-hidden`)

## Press behavior

1. **Pointer down** (primary button) → `pressed` — button scales down, icon lifts slightly, glow appears.
2. **Pointer up / leave / cancel** → `release` briefly, then `idle` after ~180ms.
3. **Keyboard** — `Space` / `Enter` on focus mirrors press/release.
4. **Disabled / loading** — no press state changes; pointer events blocked.

## Tokens (`--hy-icon-button-*`)

Defined on the v2 shell in `icon-button.module.sass`:

| Token | Role |
|-------|------|
| `--hy-icon-button-size` | Hit target |
| `--hy-icon-button-icon-size` | SVG size |
| `--hy-icon-button-radius` | Corner radius |
| `--hy-icon-button-glass-border` | Border (`1px solid rgba(255,255,255,0.2)`) |
| `--hy-icon-button-glass-surface` | Fill (`rgba(255,255,255,0.3)`) |
| `--hy-icon-button-glass-blur` | Backdrop filter (`blur(10px)`) |
| `--hy-icon-button-shadow` | Inset rim + drop shadow (`inset 0 1px #ffffff7a`, `inset 0 -1px #ffffff1a`, `0 .5625rem 1.5rem #0000003d`) |
| `--hy-icon-button-shadow` | Outer + inset shadows |
| `--hy-icon-button-press-scale` | Button scale while pressed (default `0.945`) |
| `--hy-icon-button-icon-press-y` | Icon lift (default `-0.1875rem`) |
| `--hy-icon-button-icon-press-scale` | Icon scale (default `1.02`) |
| `--hy-icon-button-glow-opacity` | Glow strength when pressed |
| `--hy-icon-button-motion-press-duration` | Press-in transition |
| `--hy-icon-button-motion-release-duration` | Release transition |
| `--hy-icon-button-motion-easing` | Easing curve |

Legacy global tokens (`--hy-size-icon-button`, `--hy-radius-icon-button`, …) in `_hy-v2-light.scss` remain fallbacks.

## Accessibility

- Real `<button type="button">`.
- **`ariaLabel` required** on icon-only usage (typed prop).
- Decorative icon and glow: `aria-hidden`.
- Visible `:focus-visible` ring on keyboard focus.
- `disabled` + `aria-busy` when `loading`.
- `aria-pressed` when `active`.

## Reduced motion

- Hook skips the `release` animation and returns to `idle` immediately when `prefers-reduced-motion: reduce`.
- Sass removes scale, translate, and glow transitions in the same media query.
- Focus ring and contrast feedback remain.

## Overflow

`overflow: visible` on the root button so the glow and icon lift are not clipped. Badges stay at `z-index: 3`.

## Visual regression — `/pt-BR/cargas` filter (2026-06-11)

### DOM audit (proved on route)

| Check | Result |
|-------|--------|
| Component | `IconButton` from `src/shared/components/icon-button/icon-button.tsx` |
| Import in list | `@/shared/components/icon-button` (not design-system `DsIconButton`) |
| DOM tag | `<button data-icon-button-global="true" data-mobile-cargas-filter-button="true">` |
| Style module | `icon-button.module.sass` (`variant_v2` + `shell` + `glassControl`) |
| External `className` | `.filterSquare` on `layoutHost` (`display: contents`) — layout only |
| Icon wrapper | `span.icon` (aria-hidden) |
| Press hook | `data-press` via `use-icon-button-press.ts` |

### Why earlier fixes looked unchanged

1. **Wrong layer blamed:** cargo mixin on `.filterSquare` was removed, but the real button already used the global v2 shell — removal alone did not change the painted surface much.
2. **Opaque v2 tokens:** `--hy-icon-button-glass-surface` and stacked white gradients (~0.52–0.96 alpha) read as a solid pill, not glass.
3. **Blue press flash:** `bubbleGlow` used `rgba(105, 167, 255, …)`; `:active` pseudo re-painted surface and `::after` highlight in parallel with `data-press`.
4. **Subtle icon lift:** `-3px` / `scale(1.02)` was below perceptual threshold on device.

### Fix (2026-06-11)

- `.filterSquare` stays layout-only in `public-cargas-mobile-list.module.scss`.
- Removed dead `cargas-mobile-glass-icon-button.module.sass` and unused `cargo-v2-light-icon-button-surfaces` mixin.
- Removed filter-sheet close-button glass overrides in cargas SCSS; sheet close uses global IconButton only.
- `icon-button.module.sass`: lower glass surface alpha, white-only glow, remove `:hover`/`:active` surface overrides (press = `data-press` only), stronger icon lift (`-5px`, `scale(1.05)`).

### Legacy parallel (out of mobile shell scope)

| Item | Status |
|------|--------|
| `DsIconButton` (`src/shared/design-system/components/icon-button`) | Exported only; no mobile/production consumers — do not use for shell |
| `hx-icon-button` (`globals.scss`) | Desktop/admin operations board — out of scope this round |
| `IconButtonLegacyVariant` (`default`, `filter`, `theme`, …) | Desktop/admin dark surfaces only; mobile uses `v2` + `iconButtonRole` |

**Consumer rule:** never pass `background`, `border`, `box-shadow`, `transform`, or `:active` overrides onto IconButton v2 `className` — only external layout (grid slot, flex shrink, spacing).
