/** Sombras e elevação para surfaces flutuantes. */
export const elevation = {
  soft: '0 8px 24px rgba(0, 0, 0, 0.12)',
  medium: '0 12px 32px rgba(0, 0, 0, 0.18)',
  strong: '0 16px 40px rgba(0, 0, 0, 0.24)',
} as const;

export type ElevationToken = keyof typeof elevation;
