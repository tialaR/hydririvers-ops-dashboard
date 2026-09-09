/**
 * Semantic HydroRivers tokens → raw `--hydro-kit-*` variables.
 * Visual source: Figma iOS Kit; code identity: HydriRivers (`hydro` / `hydro-kit`).
 */

export const SEMANTIC_COLOR_ALIASES = {
  'hydro-color-canvas': 'hydro-kit-colors-backgrounds-grouped-primary',
  'hydro-color-surface': 'hydro-kit-colors-backgrounds-primary',
  'hydro-color-surface-elevated': 'hydro-kit-colors-backgrounds-secondary',
  'hydro-color-surface-grouped': 'hydro-kit-colors-backgrounds-grouped-secondary',
  'hydro-color-label-primary': 'hydro-kit-colors-labels-primary',
  'hydro-color-label-secondary': 'hydro-kit-colors-labels-secondary',
  'hydro-color-label-tertiary': 'hydro-kit-colors-labels-tertiary',
  'hydro-color-separator': 'hydro-kit-colors-separators-non-opaque',
  'hydro-color-fill-primary': 'hydro-kit-colors-fills-primary',
  'hydro-color-fill-secondary': 'hydro-kit-colors-fills-secondary',
  'hydro-color-accent': 'hydro-kit-colors-accents-blue',
  'hydro-color-warning': 'hydro-kit-colors-accents-orange',
  'hydro-color-success': 'hydro-kit-colors-accents-green',
  'hydro-color-danger': 'hydro-kit-colors-accents-red',
  'hydro-color-overlay': 'hydro-kit-colors-grays-black',
};

export const SEMANTIC_RADIUS_ALIASES = {
  'hydro-radius-control': 'hydro-kit-shape-corner-small',
  'hydro-radius-card': 'hydro-kit-shape-corner-large',
  'hydro-radius-sheet': 'hydro-kit-sheet-iphone-top-radius',
  'hydro-radius-pill': 'hydro-kit-shape-corner-full',
};

export const SEMANTIC_SIZE_ALIASES = {
  'hydro-size-touch-target': 'hydro-kit-size-space-1200',
  'hydro-size-search-height': 'hydro-kit-size-icon-large',
  'hydro-size-tabbar-height': 'hydro-kit-size-space-1200',
};

/** Motion primitives are not exported by the iOS Kit JSON yet; literals are app semantics. */
export const SEMANTIC_MOTION_LITERALS = {
  'hydro-motion-tap': '120ms',
  'hydro-motion-control': '220ms',
  'hydro-motion-sheet': '320ms',
  'hydro-motion-easing-standard': 'cubic-bezier(0.2, 0, 0, 1)',
};

export const SEMANTIC_FONT_ALIASES = {
  'hydro-font-large-title': 'hydro-kit-typescale-static-display-small-size',
  'hydro-font-title': 'hydro-kit-typescale-static-title-medium-size',
  'hydro-font-headline': 'hydro-kit-typescale-static-headline-medium-size',
  'hydro-font-body': 'hydro-kit-typescale-static-body-medium-size',
  'hydro-font-footnote': 'hydro-kit-typescale-static-label-medium-size',
  'hydro-font-caption': 'hydro-kit-typescale-static-body-small-size',
};

export const SEMANTIC_FONT_LITERALS = {
  'hydro-font-family-system':
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", sans-serif',
};

export function collectSemanticAliases() {
  const entries = [];

  for (const [semantic, raw] of Object.entries(SEMANTIC_COLOR_ALIASES)) {
    entries.push({ semantic, raw, category: 'color' });
  }
  for (const [semantic, raw] of Object.entries(SEMANTIC_RADIUS_ALIASES)) {
    entries.push({ semantic, raw, category: 'radius' });
  }
  for (const [semantic, raw] of Object.entries(SEMANTIC_SIZE_ALIASES)) {
    entries.push({ semantic, raw, category: 'size' });
  }
  for (const [semantic, raw] of Object.entries(SEMANTIC_FONT_ALIASES)) {
    entries.push({ semantic, raw, category: 'font' });
  }

  return entries;
}
