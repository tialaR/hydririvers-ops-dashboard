import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('CargoActionSheetBridge', () => {
  it('compõe a casca global BottomSheet sem portal legado', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/features/cargo/components/cargo-action-sheet/cargo-action-sheet-bridge.tsx'),
      'utf8',
    );

    expect(source).toContain("from '@/shared/components/bottom-sheet/BottomSheet'");
    expect(source).toContain('<BottomSheet');
    expect(source).toContain('article[data-cargo-id]');
    expect(source).not.toContain('createPortal');
    expect(source).not.toContain('cargoActionSheetOverlayIn');
  });
});
