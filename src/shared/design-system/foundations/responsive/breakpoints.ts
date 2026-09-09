/** Product-neutral responsive layout thresholds. */
export const responsiveBreakpoints = {
  medium: '48rem',
  wide: '80rem',
} as const;

export type ResponsiveViewport = 'compact' | 'medium' | 'wide';
