/** ViewBox esquemático compartilhado entre helpers e SVG do mapa. */
export const TRACKING_VIEWBOX = {
  width: 1000,
  height: 470
} as const;

/** Grade horizontal: passo vertical entre linhas (px no viewBox). */
export const TRACKING_GRID_HORIZONTAL_STEP = 52;

/** Deslocamento inicial da primeira linha horizontal. */
export const TRACKING_GRID_HORIZONTAL_OFFSET = 10;

/** Passo da grade vertical (1000 / 20 intervalos). */
export const TRACKING_GRID_VERTICAL_STEP = 50;

/** Linhas verticais da grade (0 … largura, passo fixo). */
export const TRACKING_GRID_VERTICAL_COUNT =
  Math.floor(TRACKING_VIEWBOX.width / TRACKING_GRID_VERTICAL_STEP) + 1;

/** Linhas horizontais da grade. */
export const TRACKING_GRID_HORIZONTAL_COUNT = 10;

/** Fração mínima/máxima do trajeto onde o ícone da embarcação é ancorado (legibilidade). */
export const VESSEL_PATH_PROGRESS_MIN = 0.14;
export const VESSEL_PATH_PROGRESS_MAX = 0.86;
