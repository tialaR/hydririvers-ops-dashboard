/**
 * Portable public API for the UI system.
 *
 * Product applications should converge on this neutral vocabulary.
 * Themes, material-specific adapters and product patterns stay behind this boundary.
 */
export * from './core';
export {
  glassMaterialDefaultStyle,
  glassMaterialStyles,
  type GlassMaterialStyle,
} from './materials/glass';
export * from './components/bottom-navigation';
export * from './components/bottom-sheet';
