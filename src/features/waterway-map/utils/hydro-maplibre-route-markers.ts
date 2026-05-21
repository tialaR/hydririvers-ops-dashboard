import maplibregl, { type Map } from 'maplibre-gl';

import {
  HYDRIRIVERS_CURRENT_CARGO_SVG_URL,
  HYDRIRIVERS_DESTINATION_RADAR_SVG_URL,
  HYDRIRIVERS_ORIGIN_RADAR_SVG_URL,
} from '../constants/hydro-route-marker-assets';

export type RouteMarkerKind = 'origin' | 'destination' | 'vessel';

export type RouteMarkerAriaLabels = Partial<Record<RouteMarkerKind, string>>;

const ROUTE_MARKER_SVG_URL: Record<RouteMarkerKind, string> = {
  origin: HYDRIRIVERS_ORIGIN_RADAR_SVG_URL,
  destination: HYDRIRIVERS_DESTINATION_RADAR_SVG_URL,
  vessel: HYDRIRIVERS_CURRENT_CARGO_SVG_URL,
};

const ROUTE_MARKER_ROOT_CLASS: Record<RouteMarkerKind, string> = {
  origin: 'hydriRouteIdentificationMarker hydriRouteIdentificationMarkerOrigin',
  destination:
    'hydriRouteIdentificationMarker hydriRouteIdentificationMarkerDestination',
  vessel: 'hydriRouteIdentificationMarker hydriRouteIdentificationMarkerCurrentCargo',
};

/** Classes CSS dos marcadores HTML (spike MapLibre viewport). */
export const HYDROWAY_ROUTE_MARKER_CLASSES = {
  originClassName: ROUTE_MARKER_ROOT_CLASS.origin,
  vesselClassName: ROUTE_MARKER_ROOT_CLASS.vessel,
  destinationClassName: ROUTE_MARKER_ROOT_CLASS.destination,
} as const;

export type HydrowayRouteMarkerSvgs = {
  originSvg?: string;
  vesselSvg?: string;
  destinationSvg?: string;
};

export async function prefetchHydrowayRouteMarkerSvgs(): Promise<HydrowayRouteMarkerSvgs> {
  const kinds: RouteMarkerKind[] = ['origin', 'destination', 'vessel'];
  const svgs: HydrowayRouteMarkerSvgs = {};

  await Promise.all(
    kinds.map(async (kind) => {
      try {
        const response = await fetch(ROUTE_MARKER_SVG_URL[kind]);
        if (!response.ok) return;
        const markup = await response.text();
        if (!markup.trim()) return;
        if (kind === 'origin') svgs.originSvg = markup;
        if (kind === 'vessel') svgs.vesselSvg = markup;
        if (kind === 'destination') svgs.destinationSvg = markup;
      } catch {
        // img fallback remains in syncRouteMarkers.
      }
    }),
  );

  return svgs;
}

type MarkerSlot = {
  marker: maplibregl.Marker;
  element: HTMLDivElement;
};

function isValidLngLat(coordinates: GeoJSON.Position | null | undefined): coordinates is GeoJSON.Position {
  if (!coordinates || coordinates.length < 2) return false;
  const [lng, lat] = coordinates;
  return Number.isFinite(lng) && Number.isFinite(lat);
}

function decorateMarkerSvg(element: HTMLDivElement): void {
  const svg = element.querySelector('svg');
  if (!svg) return;
  svg.setAttribute('aria-hidden', 'true');
  svg.removeAttribute('role');
  svg.removeAttribute('aria-labelledby');
}

function appendMarkerGraphic(
  element: HTMLDivElement,
  kind: RouteMarkerKind,
  options: { svgHtml?: string | null },
): void {
  const markup = options.svgHtml?.trim();
  if (markup) {
    element.insertAdjacentHTML('beforeend', markup);
    return;
  }

  const img = document.createElement('img');
  img.src = ROUTE_MARKER_SVG_URL[kind];
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');
  img.decoding = 'async';
  element.appendChild(img);
}

export function createRouteIdentificationMarkerElement(
  kind: RouteMarkerKind,
  options: {
    svgHtml?: string | null;
  } = {},
): HTMLDivElement {
  const element = document.createElement('div');
  element.className = ROUTE_MARKER_ROOT_CLASS[kind];
  element.setAttribute('aria-hidden', 'true');
  element.style.pointerEvents = 'none';

  appendMarkerGraphic(element, kind, { svgHtml: options.svgHtml });
  decorateMarkerSvg(element);

  return element;
}

/** @deprecated Prefer `createRouteIdentificationMarkerElement`. */
export const createRoutePointerMarkerElement = createRouteIdentificationMarkerElement;

export type SyncRouteMarkersInput = {
  map: Map;
  origin: GeoJSON.Position | null;
  destination: GeoJSON.Position | null;
  vessel: GeoJSON.Position | null;
  visibleKinds?: ReadonlySet<RouteMarkerKind>;
};

/**
 * Keeps origin / destination / current-cargo HTML markers in sync (create once, update lngLat).
 * Uses `maplibregl.Marker({ element })` so inline SVG/CSS animations stay alive.
 */
export class HydroMapLibreRouteMarkers {
  private readonly slots: Partial<Record<RouteMarkerKind, MarkerSlot>> = {};
  private readonly svgHtml: Partial<Record<RouteMarkerKind, string>> = {};
  private visibleKinds = new Set<RouteMarkerKind>(['origin', 'destination', 'vessel']);

  getMarker(kind: RouteMarkerKind): maplibregl.Marker | null {
    return this.slots[kind]?.marker ?? null;
  }

  destroy(): void {
    this.removeAll();
  }

  setPrefetchedSvgs(svgs: HydrowayRouteMarkerSvgs): void {
    if (svgs.originSvg?.trim()) this.svgHtml.origin = svgs.originSvg;
    if (svgs.vesselSvg?.trim()) this.svgHtml.vessel = svgs.vesselSvg;
    if (svgs.destinationSvg?.trim()) this.svgHtml.destination = svgs.destinationSvg;

    for (const kind of ['origin', 'destination', 'vessel'] as const) {
      this.upgradeMarkerSvg(kind);
    }
  }

  async prefetchSvgAssets(): Promise<void> {
    const svgs = await prefetchHydrowayRouteMarkerSvgs();
    this.setPrefetchedSvgs(svgs);
  }

  sync(input: SyncRouteMarkersInput): void {
    const { map } = input;
    if (input.visibleKinds) {
      this.visibleKinds = new Set(input.visibleKinds);
    }

    this.syncKind(map, 'origin', input.origin);
    this.syncKind(map, 'destination', input.destination);
    this.syncKind(map, 'vessel', input.vessel);
    this.applyVisibility();
  }

  private upgradeMarkerSvg(kind: RouteMarkerKind): void {
    const slot = this.slots[kind];
    const markup = this.svgHtml[kind];
    if (!slot || !markup) return;
    if (slot.element.querySelector('svg')) return;

    slot.element.replaceChildren();
    appendMarkerGraphic(slot.element, kind, { svgHtml: markup });
    decorateMarkerSvg(slot.element);
  }

  private syncKind(
    map: Map,
    kind: RouteMarkerKind,
    coordinates: GeoJSON.Position | null,
  ): void {
    if (!isValidLngLat(coordinates)) {
      this.removeKind(kind);
      return;
    }

    const [lng, lat] = coordinates;
    const existing = this.slots[kind];

    if (!existing) {
      const element = createRouteIdentificationMarkerElement(kind, {
        svgHtml: this.svgHtml[kind],
      });
      const marker = new maplibregl.Marker({ element, anchor: 'center', offset: [0, 0] })
        .setLngLat([lng, lat])
        .addTo(map);
      this.slots[kind] = { marker, element };
      return;
    }

    try {
      existing.marker.setLngLat([lng, lat]);
    } catch {
      this.removeKind(kind);
    }
  }

  private applyVisibility(): void {
    for (const kind of ['origin', 'destination', 'vessel'] as const) {
      const slot = this.slots[kind];
      if (!slot) continue;
      slot.element.style.display = this.visibleKinds.has(kind) ? '' : 'none';
    }
  }

  private removeKind(kind: RouteMarkerKind): void {
    const slot = this.slots[kind];
    if (!slot) return;
    try {
      slot.marker.remove();
    } catch {
      // Marker may already be detached during map teardown.
    }
    delete this.slots[kind];
  }

  removeAll(): void {
    for (const kind of ['origin', 'destination', 'vessel'] as const) {
      this.removeKind(kind);
    }
  }
}

export function resolveRouteMarkerVisibleKinds(
  visibleLayers: ReadonlySet<'cargo-route' | 'vessel' | string>,
): Set<RouteMarkerKind> {
  const kinds = new Set<RouteMarkerKind>();
  if (visibleLayers.has('cargo-route')) {
    kinds.add('origin');
    kinds.add('destination');
  }
  if (visibleLayers.has('cargo-route') || visibleLayers.has('vessel')) {
    kinds.add('vessel');
  }
  return kinds;
}
