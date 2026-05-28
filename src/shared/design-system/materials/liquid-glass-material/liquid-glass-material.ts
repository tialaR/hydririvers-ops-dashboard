export const liquidGlassMaterialStyles = [
  'ultrathin',
  'thin',
  'regular',
  'thick',
  'chrome',
] as const;

export type LiquidGlassMaterialStyle = (typeof liquidGlassMaterialStyles)[number];

export const liquidGlassMaterialDefaultStyle: LiquidGlassMaterialStyle = 'regular';
