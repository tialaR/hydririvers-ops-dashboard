import maplibregl, { type Map } from 'maplibre-gl';

import {
  HYDRI_ROUTE_DESTINATION_MARKER_SVG_URL,
  HYDRI_ROUTE_ORIGIN_MARKER_SVG_URL,
  HYDRI_ROUTE_VESSEL_MARKER_SVG_URL,
} from '../constants/hydro-route-marker-assets';

export type RouteMarkerKind = 'origin' | 'destination' | 'vessel';

export type RouteMarkerAriaLabels = Partial<Record<RouteMarkerKind, string>>;

const ROUTE_MARKER_SVG_URL: Record<RouteMarkerKind, string> = {
  origin: HYDRI_ROUTE_ORIGIN_MARKER_SVG_URL,
  destination: HYDRI_ROUTE_DESTINATION_MARKER_SVG_URL,
  vessel: HYDRI_ROUTE_VESSEL_MARKER_SVG_URL,
};

const ROUTE_MARKER_ROOT_CLASS: Record<RouteMarkerKind, string> = {
  origin:
    'hydriRouteMarker hydriRouteMarkerOrigin routeMarker originMarker originRouteMarker',
  destination:
    'hydriRouteMarker hydriRouteMarkerDestination routeMarker destinationMarker destinationRouteMarker',
  vessel:
    'hydriRouteMarker hydriRouteMarkerVessel routeMarker vesselMarker hydriCurrentCargoMarker vesselRouteMarker',
};

/**
 * Radar SVGs use viewBox 0 0 64 64 but the pulse core sits at cy=40 (not 32).
 * Wrapper class shifts artwork so MapLibre anchor:center hits the visible dot.
 */
const ROUTE_MARKER_SVG_ANCHOR_CLASS: Record<RouteMarkerKind, string> = {
  origin: 'hydriRouteMarkerSvgAnchor hydriRouteMarkerSvgAnchorOrigin',
  destination: 'hydriRouteMarkerSvgAnchor hydriRouteMarkerSvgAnchorDestination',
  vessel: 'hydriRouteMarkerSvgAnchor hydriRouteMarkerSvgAnchorVessel',
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
        // Fallback text in syncRouteMarkers remains.
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

function decorateMarkerSvg(element: HTMLDivElement, ariaLabel: string | undefined): void {
  const svg = element.querySelector('svg');
  if (!svg) return;
  if (ariaLabel) {
    svg.setAttribute('aria-hidden', 'true');
    svg.removeAttribute('role');
    svg.removeAttribute('aria-labelledby');
  }
}

function appendMarkerGraphic(
  iconWrap: HTMLElement,
  kind: RouteMarkerKind,
  options: { svgHtml?: string | null },
): void {
  const anchor = document.createElement('span');
  anchor.className = ROUTE_MARKER_SVG_ANCHOR_CLASS[kind];
  anchor.setAttribute('aria-hidden', 'true');

  const markup = options.svgHtml?.trim();
  if (markup) {
    anchor.insertAdjacentHTML('beforeend', markup);
    iconWrap.appendChild(anchor);
    return;
  }

  const img = document.createElement('img');
  img.className = 'hydriRouteMarkerImg';
  img.src = ROUTE_MARKER_SVG_URL[kind];
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');
  img.decoding = 'async';
  anchor.appendChild(img);
  iconWrap.appendChild(anchor);
}

export function createRoutePointerMarkerElement(
  kind: RouteMarkerKind,
  options: {
    svgHtml?: string | null;
    ariaLabel?: string;
  },
): HTMLDivElement {
  const element = document.createElement('div');
  element.className = ROUTE_MARKER_ROOT_CLASS[kind];
  element.style.pointerEvents = 'none';
  element.style.position = 'relative';
  element.style.transformOrigin = 'center center';

  const ariaLabel = options.ariaLabel?.trim();
  if (ariaLabel) {
    element.setAttribute('role', 'img');
    element.setAttribute('aria-label', ariaLabel);
  } else {
    element.setAttribute('aria-hidden', 'true');
  }

  const iconWrap = document.createElement('span');
  iconWrap.className = 'markerIcon hydriRouteMarkerIcon';
  iconWrap.setAttribute('aria-hidden', 'true');

  const fallback = document.createElement('span');
  fallback.className = 'hydriRouteMarkerFallback';
  fallback.setAttribute('aria-hidden', 'true');
  iconWrap.appendChild(fallback);

  appendMarkerGraphic(iconWrap, kind, { svgHtml: options.svgHtml });
  decorateMarkerSvg(element, ariaLabel);

  element.appendChild(iconWrap);
  return element;
}

export type SyncRouteMarkersInput = {
  map: Map;
  origin: GeoJSON.Position | null;
  destination: GeoJSON.Position | null;
  vessel: GeoJSON.Position | null;
  ariaLabels?: RouteMarkerAriaLabels;
  visibleKinds?: ReadonlySet<RouteMarkerKind>;
};

/**
 * Keeps origin / destination / vessel HTML markers in sync (create once, update lngLat).
 * Uses `maplibregl.Marker({ element })` so inline SVG/CSS animations stay alive.
 */
export class HydroMapLibreRouteMarkers {
  private readonly slots: Partial<Record<RouteMarkerKind, MarkerSlot>> = {};
  private readonly svgHtml: Partial<Record<RouteMarkerKind, string>> = {};
  private ariaLabels: RouteMarkerAriaLabels = {};
  private visibleKinds = new Set<RouteMarkerKind>(['origin', 'destination', 'vessel']);

  setAriaLabels(labels: RouteMarkerAriaLabels): void {
    this.ariaLabels = { ...labels };
    for (const kind of ['origin', 'destination', 'vessel'] as const) {
      const slot = this.slots[kind];
      const label = this.ariaLabels[kind]?.trim();
      if (!slot) continue;
      if (label) {
        slot.element.setAttribute('role', 'img');
        slot.element.setAttribute('aria-label', label);
        slot.element.removeAttribute('aria-hidden');
      } else {
        slot.element.removeAttribute('role');
        slot.element.removeAttribute('aria-label');
        slot.element.setAttribute('aria-hidden', 'true');
      }
      decorateMarkerSvg(slot.element, label);
    }
  }

  setVisibleKinds(kinds: ReadonlySet<RouteMarkerKind>): void {
    this.visibleKinds = new Set(kinds);
    this.applyVisibility();
  }

  destroy(): void {
    this.removeAll();
    this.ariaLabels = {};
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
    if (input.ariaLabels) {
      this.setAriaLabels(input.ariaLabels);
    }
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

    const iconWrap = slot.element.querySelector('.hydriRouteMarkerIcon, .markerIcon');
    if (!iconWrap || iconWrap.querySelector('.hydriRouteMarkerSvgAnchor svg')) return;

    iconWrap.querySelector('.hydriRouteMarkerSvgAnchor')?.remove();
    appendMarkerGraphic(iconWrap as HTMLElement, kind, { svgHtml: markup });
    decorateMarkerSvg(slot.element, this.ariaLabels[kind]);
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
      const element = createRoutePointerMarkerElement(kind, {
        svgHtml: this.svgHtml[kind],
        ariaLabel: this.ariaLabels[kind],
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
