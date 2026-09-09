import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { vessels } from '@/features/marketplace/data/marketplace.mock';

export type VesselVisualTreatment =
  | 'real-water-dark'
  | 'studio-treated'
  | 'port-sunset'
  | 'foggy-cinematic';

export type VesselVisual = {
  src: string;
  alt: string;
  treatment: VesselVisualTreatment;
  objectPosition: string;
  vesselName: string;
};

const VESSEL_PRESETS = [
  { src: '/mock/vessels/hr-vessel-hero-01.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-02.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-03.webp', treatment: 'foggy-cinematic' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-04.webp', treatment: 'foggy-cinematic' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-05.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-06.webp', treatment: 'port-sunset' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-07.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-08.webp', treatment: 'foggy-cinematic' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-09.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-10.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-11.webp', treatment: 'foggy-cinematic' as const, objectPosition: 'center right' },
  { src: '/mock/vessels/hr-vessel-hero-12.webp', treatment: 'real-water-dark' as const, objectPosition: 'center right' }
] as const;

export function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function positiveModulo(value: number, modulo: number): number {
  if (modulo <= 0) return 0;
  return ((value % modulo) + modulo) % modulo;
}

function pickPresetIndex(cargo: Cargo): number {
  const idPart = stableHash(cargo.id);
  const routePart = stableHash(`${cargo.origin}|${cargo.destination}`);
  const kindPart = stableHash(
    `${cargo.cargoType}|${cargo.serviceType ?? ''}|${cargo.mainRiver ?? ''}|${cargo.corridor ?? ''}`
  );

  return positiveModulo(idPart ^ routePart ^ kindPart, VESSEL_PRESETS.length);
}

export function getVesselVisual(cargo: Cargo): VesselVisual {
  const idx = pickPresetIndex(cargo);
  const preset = VESSEL_PRESETS[idx] ?? VESSEL_PRESETS[0];
  const vessel = vessels[positiveModulo(idx, vessels.length)];
  const vesselName = vessel?.name ?? 'Embarcação';

  return {
    src: preset.src,
    alt: `${vesselName} — ${cargo.origin} – ${cargo.destination} · ${cargo.id}`,
    treatment: preset.treatment,
    objectPosition: preset.objectPosition,
    vesselName
  };
}
