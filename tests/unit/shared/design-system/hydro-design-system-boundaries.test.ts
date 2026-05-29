import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(__dirname, '../../../..');
const srcDir = path.join(rootDir, 'src');
const designSystemDir = path.join(srcDir, 'shared', 'design-system');

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return [fullPath];
  });
}

describe('Hydro design system boundaries', () => {
  it('official primitives have index.ts', () => {
    const primitiveDirs = [
      'liquid-glass-surface',
      'liquid-glass-button',
      'liquid-glass-segmented-control',
      'liquid-glass-search-field',
      'liquid-glass-toolbar',
      'liquid-glass-sheet',
      'liquid-glass-menu',
      'liquid-glass-scroll-edge',
      'liquid-glass-text-field',
      'liquid-glass-progress',
      'liquid-glass-switch',
      'liquid-glass-tab-bar',
      'liquid-glass-popover',
      'liquid-glass-window',
    ];

    for (const dir of primitiveDirs) {
      expect(existsSync(path.join(designSystemDir, 'primitives', dir, 'index.ts'))).toBe(true);
    }
  });

  it('official materials have index.ts', () => {
    expect(
      existsSync(path.join(designSystemDir, 'materials', 'liquid-glass-material', 'index.ts')),
    ).toBe(true);
  });

  it('generated tokens exist', () => {
    expect(existsSync(path.join(designSystemDir, 'tokens', 'generated', 'index.ts'))).toBe(true);
    expect(existsSync(path.join(designSystemDir, 'tokens', 'generated', 'hydro-kit.css'))).toBe(true);
    expect(existsSync(path.join(designSystemDir, 'tokens', 'generated', 'hydro.semantic.module.scss'))).toBe(
      true,
    );
  });

  it('does not use --ios-* in src', () => {
    const files = walk(srcDir).filter((file) => /\.(ts|tsx|scss|css|md|mjs|js)$/.test(file));
    for (const file of files) {
      const raw = readFileSync(file, 'utf8');
      expect(raw.includes('--ios-')).toBe(false);
    }
  });

  it('does not keep backup files in src/app', () => {
    const appDir = path.join(srcDir, 'app');
    const files = walk(appDir);
    for (const file of files) {
      const normalized = file.split(path.sep).join('/');
      expect(normalized.includes('.backup-') || normalized.includes('.before')).toBe(false);
    }
  });

  it('ds:check passes', () => {
    const output = execSync('npm run ds:check', { cwd: rootDir, encoding: 'utf8' });
    expect(output).toContain('Hydro DS check passou.');
  });

  it('design-system files are not empty', () => {
    const files = walk(designSystemDir);
    for (const file of files) {
      expect(statSync(file).size).toBeGreaterThan(0);
    }
  });
});
