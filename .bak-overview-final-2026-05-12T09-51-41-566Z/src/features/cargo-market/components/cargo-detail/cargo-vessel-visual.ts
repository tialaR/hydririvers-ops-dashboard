import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { vessels } from '@/features/marketplace/data/marketplace.mock';

/**
 * Presets visuais suportados pelo CSS do hero (`data-treatment`).
 * O manifest do kit inclui `rustic-moody`; aqui mapeamos esses casos para
 * `foggy-cinematic` até existir regra dedicada na Fase 3.
 */
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
  /** Nome de embarcação mock alinhado ao índice visual (para texto no hero). */
  vesselName: string;
};

/** Ordem alinhada a `hydririvers-vessel-hero-kit/manifest/vessel-assets.manifest.json` (entradas `decision: use`). */
const VESSEL_PRESETS = [
  {
    src: '/mock/vessels/cargo-vessel-real-water-01.webp',
    treatment: 'real-water-dark' as const,
    objectPosition: 'center right'
  },
  {
    src: '/mock/vessels/cargo-container-aerial-blue-01.webp',
    treatment: 'real-water-dark' as const,
    objectPosition: 'center'
  },
  {
    src: '/mock/vessels/cargo-container-open-water-01.webp',
    treatment: 'real-water-dark' as const,
    objectPosition: 'center right'
  },
  {
    src: '/mock/vessels/trade-boat-river-01.webp',
    treatment: 'foggy-cinematic' as const,
    objectPosition: 'center'
  },
  {
    src: '/mock/vessels/cargo-vessel-port-01.jpg',
    treatment: 'port-sunset' as const,
    objectPosition: 'center right'
  },
  {
    src: '/mock/vessels/rustic-fishing-boat-dusk-01.avif',
    treatment: 'foggy-cinematic' as const,
    objectPosition: 'center'
  },
  {
    src: '/mock/vessels/vessel-foggy-cinematic-01.avif',
    treatment: 'foggy-cinematic' as const,
    objectPosition: 'center'
  }
] as const;

/** FNV-1a 32-bit — determinístico em SSR e cliente. */
export function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickPresetIndex(cargo: Cargo): number {
  const idPart = stableHash(cargo.id);
  const routePart = stableHash(`${cargo.origin}|${cargo.destination}`);
  const kindPart = stableHash(
    `${cargo.cargoType}|${cargo.serviceType ?? ''}|${cargo.mainRiver ?? ''}|${cargo.corridor ?? ''}`
  );

  // Bitwise XOR trabalha com inteiro assinado de 32 bits; >>> 0 garante índice positivo em SSR e client.
  return ((idPart ^ routePart ^ kindPart) >>> 0) % VESSEL_PRESETS.length;
}

/**
 * Visual de embarcação para mock: sempre o mesmo para o mesmo `cargo`
 * (combina id, rota, tipo de carga e metadados de rio/corredor).
 */
export function getVesselVisual(cargo: Cargo): VesselVisual {
  const idx = pickPresetIndex(cargo);
  const preset = VESSEL_PRESETS[idx] ?? VESSEL_PRESETS[0];
  const vessel = vessels[idx % vessels.length];
  const vesselName = vessel?.name ?? 'Embarcação';

  const alt = `${vesselName} — ${cargo.origin} – ${cargo.destination} · ${cargo.id}`;

  return {
    src: preset.src,
    alt,
    treatment: preset.treatment,
    objectPosition: preset.objectPosition,
    vesselName
  };
}
