import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const retiredRouteRoots = [
  'src/app/[locale]/dev',
  'src/app/[locale]/dev-v2',
  'src/app/[locale]/lab',
  'src/app/[locale]/(product-shell)/dev-onboarding',
] as const;

describe('Portfolio-Ready public route surface', () => {
  it.each(retiredRouteRoots)('does not ship the retired route tree %s', (routeRoot) => {
    expect(existsSync(resolve(process.cwd(), routeRoot))).toBe(false);
  });
});
