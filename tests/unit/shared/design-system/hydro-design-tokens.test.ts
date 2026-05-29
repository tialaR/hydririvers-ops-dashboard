import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const generatedDir = path.resolve(
  fileURLToPath(new URL('../../../../src/shared/design-system/tokens/generated', import.meta.url)),
);

async function readGenerated(name: string) {
  return readFile(path.join(generatedDir, name), 'utf8');
}

describe('hydro design tokens (generated)', () => {
  it('uses hydro-kit raw prefix and never emits legacy ios variables', async () => {
    const css = await readGenerated('hydro-kit.css');
    const semantic = await readGenerated('hydro.semantic.module.scss');

    expect(css).toMatch(/--hydro-kit-[a-z0-9-]+:/);
    expect(semantic).toMatch(/--hydro-[a-z0-9-]+:/);
    expect(css).not.toMatch(/--ios-/);
    expect(semantic).not.toMatch(/--ios-/);
  });

  it('includes essential raw kit tokens', async () => {
    const css = await readGenerated('hydro-kit.css');

    const essentialRaw = [
      '--hydro-kit-colors-accents-blue:',
      '--hydro-kit-colors-backgrounds-primary:',
      '--hydro-kit-colors-labels-primary:',
      '--hydro-kit-colors-separators-non-opaque:',
    ];

    for (const token of essentialRaw) {
      expect(css).toContain(token);
    }
  });

  it('includes essential semantic aliases pointing at hydro-kit', async () => {
    const semantic = await readGenerated('hydro.semantic.module.scss');

    expect(semantic).toContain('--hydro-color-accent: var(--hydro-kit-colors-accents-blue);');
    expect(semantic).toContain(
      '--hydro-color-canvas: var(--hydro-kit-colors-backgrounds-grouped-primary);',
    );
    expect(semantic).toContain('--hydro-font-body: var(--hydro-kit-typescale-static-body-medium-size);');
    expect(semantic).toContain('--hydro-radius-card: var(--hydro-kit-shape-corner-large);');
  });

  it('exports hydro-kit token keys from TypeScript barrel', async () => {
    const { hydroKitCssVarNames } = await import('@/shared/design-system/tokens/generated/hydro-kit.tokens');

    expect(hydroKitCssVarNames['hydro-kit-colors-accents-blue']).toBe('--hydro-kit-colors-accents-blue');
    expect(hydroKitCssVarNames['hydro-kit-colors-backgrounds-primary']).toBe(
      '--hydro-kit-colors-backgrounds-primary',
    );
  });
});
