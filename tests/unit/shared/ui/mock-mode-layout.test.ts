import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const mockModeStylesPath = resolve(
  process.cwd(),
  'src/shared/ui/mock-mode/mock-mode.module.scss'
);

describe('shared/ui/mock-mode layout (mobile QA FAB)', () => {
  const styles = readFileSync(mockModeStylesPath, 'utf8');

  it('ancora o FAB acima da bottom nav no mobile com tokens --hy-mock-mode-*', () => {
    expect(styles).toContain('--hy-mock-mode-bottom-nav-clearance');
    expect(styles).toContain('--hy-mock-mode-shell-inset-inline-end');
    expect(styles).toMatch(/@media \(max-width: 860px\)[\s\S]*left:\s*auto/);
    expect(styles).toMatch(/@media \(max-width: 860px\)[\s\S]*right:\s*var\(--hy-mock-mode-shell-inset-inline-end\)/);
  });

  it('remove offsets altos legados que empurravam o FAB sobre a lista', () => {
    expect(styles).not.toContain('14.2rem');
    expect(styles).not.toMatch(/@media \(max-width: 920px\)/);
  });
});
