import { describe, expect, it } from 'vitest';

import {
  liquidGlassMaterialDefaultStyle,
  liquidGlassMaterialStyles,
} from '@/shared/design-system/materials/liquid-glass-material';

describe('liquid-glass-material', () => {
  it('exporta estilos disponíveis', () => {
    expect(liquidGlassMaterialStyles).toEqual([
      'ultrathin',
      'thin',
      'regular',
      'thick',
      'chrome',
    ]);
  });

  it('default é regular', () => {
    expect(liquidGlassMaterialDefaultStyle).toBe('regular');
  });

  it('lista contém ultrathin, thin, regular, thick e chrome', () => {
    expect(liquidGlassMaterialStyles).toContain('ultrathin');
    expect(liquidGlassMaterialStyles).toContain('thin');
    expect(liquidGlassMaterialStyles).toContain('regular');
    expect(liquidGlassMaterialStyles).toContain('thick');
    expect(liquidGlassMaterialStyles).toContain('chrome');
  });
});
