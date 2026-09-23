import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('Page 61 anti-false-positive contract', () => {
  it('does not allow the Page 61 fixture to replace the real operational map', () => {
    const map = read('src/features/waterway-map/components/owned-cargo-operation-map/owned-cargo-operation-map.tsx');
    const fallback = read('src/features/waterway-map/components/owned-cargo-operation-map/owned-cargo-operation-map-fallback.tsx');

    expect(map).not.toContain("'page-61-219-254'");
    expect(map).not.toContain('usesCanonicalPage61Composition');
    expect(fallback).not.toContain("'page-61-219-254'");
    expect(fallback).not.toContain('isPage61Fixture');
  });

  it('keeps detail-tab fixture data injectable instead of branching on the URL', () => {
    const tabs = read('src/features/cargo/owned/components/owned-cargo-detail-tabs.tsx');

    expect(tabs).not.toContain('useSearchParams');
    expect(tabs).not.toContain('PAGE_61_219_254_VISUAL_FIXTURE_ID');
    expect(tabs).toContain('labels?:');
    expect(tabs).toContain('labelsOverride ??');
  });

  it('keeps Page 61 semantic tokens wired to the real screen styles', () => {
    const tokens = read('src/shared/design-system/foundations/page-61-contract-tokens.css');
    const screen = read('src/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass');

    expect(tokens).toContain('--hy-page61-shell-sidebar: 17rem');
    expect(tokens).toContain('--hy-page61-master-width: 25rem');
    expect(tokens).toContain('--hy-page61-map-height: 28rem');
    expect(screen).toContain('var(--hy-page61-shell-sidebar');
    expect(screen).toContain('var(--hy-page61-master-width');
    expect(screen).toContain('var(--hy-page61-map-height');
  });

  it('requires Page 61 contract stories to remain documented', () => {
    const storyPaths = [
      'src/features/cargo/owned/components/owned-cargo-shipment-card.stories.tsx',
      'src/features/cargo/owned/components/owned-cargo-attention-panel.stories.tsx',
      'src/features/cargo/owned/components/owned-cargo-detail-tabs.stories.tsx',
      'src/features/cargo/owned/components/owned-cargo-detail-summary.stories.tsx',
      'src/shared/design-system/foundations/page-61-contract-tokens.stories.tsx',
    ];

    for (const storyPath of storyPaths) {
      const story = read(storyPath);
      expect(story).toContain("tags: ['autodocs']");
      expect(story).toContain('description');
    }
  });
});
