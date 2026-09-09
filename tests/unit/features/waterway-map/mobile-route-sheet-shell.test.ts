import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('MobileRouteSheet shell', () => {
  it('usa BottomSheet global e mantém conteúdo na feature', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/features/waterway-map/components/mobile/mobile-route-sheet.tsx'),
      'utf8',
    );

    expect(source).toContain("from '@/shared/components/bottom-sheet/BottomSheet'");
    expect(source).toContain('<MobileRouteSheetContent');
    expect(source).toContain('viewportAnchor="flush"');
    expect(source).not.toContain('createPortal');
  });
});
