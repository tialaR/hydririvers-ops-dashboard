# HydriRivers v2 design tokens (Sass)

Shared CSS custom properties for Design System v2, extracted from `/pt-BR/dev-v2` (light mode).

## Files

| File | Scope |
| --- | --- |
| `_hy-v2-light.scss` | Mixin `hy-v2-light-tokens` — light mode only |
| `_hy-v2-dark.scss` | Planned — dark mode (future PR) |

## Usage

Import in a **CSS Module** or feature SCSS (not `globals.scss`):

```scss
@use '../../../shared/styles/tokens/hy-v2-light' as hyV2Light;

.mySurface {
  @include hyV2Light.hy-v2-light-tokens;

  color: var(--hy-color-text-primary);
  background: var(--hy-color-background-app);
}
```

Tokens are not applied anywhere until a consumer includes the mixin (PR-2 will alias `--v2-*` in the lab).

## Prefix

- `--hy-*` — semantic DS v2 tokens (this folder)
- `--hx-*` — legacy BottomSheet contract (see `BottomSheet.module.scss`)
