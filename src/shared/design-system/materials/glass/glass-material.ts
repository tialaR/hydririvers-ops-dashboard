export const glassMaterialStyles = ['ultrathin', 'thin', 'regular', 'thick', 'chrome'] as const;

export type GlassMaterialStyle = (typeof glassMaterialStyles)[number];

export const glassMaterialDefaultStyle: GlassMaterialStyle = 'regular';
