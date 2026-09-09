import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('useHydrowayMapRuntime route overview', () => {
  it('handleFitRoute reutiliza applyRouteOverviewCamera (mesma função do FAB)', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/features/waterway-map/hooks/use-hydroway-map-runtime.ts'),
      'utf8',
    );

    expect(source).toContain('const handleFitRoute = applyRouteOverviewCamera;');
    expect(source).toContain('const applyRouteOverviewCamera = useCallback');
    expect(source).toContain('tryApplyMobileInitialRouteOverview');
    expect(source).not.toContain('MOBILE_INITIAL_FIT_MAX_ATTEMPTS');
    expect(source).not.toContain('runMobileInitialRouteFit');
  });
});
