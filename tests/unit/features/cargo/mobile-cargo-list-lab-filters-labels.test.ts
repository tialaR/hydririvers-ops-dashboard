import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const labSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx',
);

describe('mobile cargo list lab filter labels', () => {
  it('usa labels i18n curtos e chips com scroll horizontal', () => {
    const source = readFileSync(labSourcePath, 'utf8');

    expect(source).toContain("labelKey: 'filters.all'");
    expect(source).toContain("labelKey: 'filters.quote'");
    expect(source).toContain("labelKey: 'filters.operation'");
    expect(source).toContain('filterChips');
    expect(source).toContain('cargo-lab-filter-scroll');
    expect(source).not.toContain('LiquidGlassSegmentedControl');
  });
});
