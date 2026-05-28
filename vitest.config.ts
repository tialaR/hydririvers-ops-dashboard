import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vitest/config';

/** Trata artefatos `.mock.geojson` como JSON importável (ADR 0031). */
function hydrowayMockGeoJsonPlugin(): Plugin {
  return {
    name: 'hydroway-mock-geojson',
    transform(code, id) {
      if (!id.endsWith('.mock.geojson')) {
        return null;
      }
      return { code: `export default ${code}`, map: null };
    },
  };
}

export default defineConfig({
  plugins: [hydrowayMockGeoJsonPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: [
      'tests/unit/**/*.test.ts',
      'tests/unit/features/negotiations/negotiation-board-render.test.tsx',
      'tests/unit/features/cargo/mobile-cargo-card.test.tsx',
      'tests/unit/features/cargo/mobile-cargo-empty-state.test.tsx',
      'tests/unit/app/mobile-cargo-list-lab-page.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-button.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-popover.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-sheet.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-tab-bar.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-segmented-control.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-switch.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-search-field.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-text-field.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-toolbar.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-window.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-progress.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-scroll-edge.test.tsx',
      'tests/unit/shared/design-system/liquid-glass-surface.test.tsx',
      'tests/unit/shared/design-system/hydro-design-system-boundaries.test.ts',
      'tests/integration/**/*.test.ts'
    ]
  }
});
