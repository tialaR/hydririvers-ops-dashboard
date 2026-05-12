import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getVesselVisual, stableHash } from '@/features/cargo-market/components/cargo-detail/cargo-vessel-visual';
import { cargoes } from '@/features/marketplace/data/marketplace.mock';

const VESSEL_FILES = [
  'cargo-vessel-real-water-01.webp',
  'cargo-container-aerial-blue-01.webp',
  'cargo-container-open-water-01.webp',
  'trade-boat-river-01.webp',
  'cargo-vessel-port-01.jpg',
  'rustic-fishing-boat-dusk-01.avif',
  'vessel-foggy-cinematic-01.avif'
] as const;

describe('cargo-vessel-visual', () => {
  it('all helper asset files exist under public/mock/vessels', () => {
    for (const name of VESSEL_FILES) {
      expect(existsSync(join(process.cwd(), 'public', 'mock', 'vessels', name))).toBe(true);
    }
  });
  it('returns identical output for the same cargo on repeated calls', () => {
    const cargo = cargoes[0]!;
    expect(getVesselVisual(cargo)).toEqual(getVesselVisual(cargo));
  });

  it('stableHash is deterministic', () => {
    expect(stableHash('cargo-004')).toBe(stableHash('cargo-004'));
  });

  it('maps to approved mock paths and a known treatment union member', () => {
    const v = getVesselVisual(cargoes[0]!);
    expect(v.src.startsWith('/mock/vessels/')).toBe(true);
    expect(/\.(webp|jpg|jpeg|avif)$/i.test(v.src)).toBe(true);
    expect(['real-water-dark', 'studio-treated', 'port-sunset', 'foggy-cinematic']).toContain(v.treatment);
    expect(v.objectPosition.length).toBeGreaterThan(0);
    expect(v.vesselName.length).toBeGreaterThan(0);
    expect(v.alt).toContain(cargoes[0]!.id);
  });
});
