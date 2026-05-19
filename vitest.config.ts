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
      'tests/integration/**/*.test.ts'
    ]
  }
});
