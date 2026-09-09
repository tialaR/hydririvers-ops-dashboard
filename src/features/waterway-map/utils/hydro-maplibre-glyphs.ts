/**
 * Font stacks compatíveis com o endpoint de glyphs do OpenFreeMap Bright.
 * @see https://tiles.openfreemap.org/styles/bright
 */
export const HYDRI_MAPLIBRE_TEXT_FONT: string[] = ['Noto Sans Regular'];

export const HYDRI_MAPLIBRE_TEXT_FONT_BOLD: string[] = ['Noto Sans Bold'];

/** Layout fragment para symbol layers com `text-field`. */
export const HYDRI_MAPLIBRE_TEXT_FONT_LAYOUT = {
  'text-font': HYDRI_MAPLIBRE_TEXT_FONT,
};
