import type {
  HydrowayMapCamera,
  HydrowayMapLayerId,
  HydrowayMapPoint,
  HydrowayMapProvider,
  HydrowayMapProviderInit,
} from './map-provider.types';
import {
  cameraToSvgViewBox,
  HYDRO_MAP_INITIAL_CAMERA,
  HYDRO_MAP_VIEWBOX,
  hydroMapStyleTokens,
} from '../utils/hydro-map-style';

const ALL_LAYERS: HydrowayMapLayerId[] = [
  'waterway-main',
  'waterway-tributary',
  'cargo-route',
  'ports',
  'vessel',
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string | number | undefined> = {},
): SVGElementTagNameMap[K] {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined) continue;
    element.setAttribute(key, String(value));
  }
  return element;
}

export class SvgSchematicHydrowayProvider implements HydrowayMapProvider {
  readonly kind = 'svg-schematic' as const;

  private container: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private camera: HydrowayMapCamera = { ...HYDRO_MAP_INITIAL_CAMERA };
  private visibleLayers = new Set<HydrowayMapLayerId>(ALL_LAYERS);
  private layerGroups = new Map<HydrowayMapLayerId, SVGGElement>();
  private scene: HydrowayMapProviderInit['scene'] | null = null;
  private uid = 'hydroway-spike';

  mount(init: HydrowayMapProviderInit): void {
    this.destroy();
    this.container = init.container;
    this.scene = init.scene;
    this.camera = init.camera ? { ...init.camera } : { ...HYDRO_MAP_INITIAL_CAMERA };
    this.uid = `hydroway-${Math.abs(hashString(init.scene.route.cargoId))}`;

    const svg = createSvgElement('svg', {
      class: 'hydroway-map-spike-svg',
      role: 'img',
      'aria-label': `${init.scene.route.originLabel} → ${init.scene.route.destinationLabel}`,
    });
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    this.svg = svg;

    this.appendDefs(svg);
    this.appendBackdrop(svg);
    this.appendGrid(svg);

    this.layerGroups.set('waterway-main', this.buildCorridorLayer(init, 0));
    this.layerGroups.set('waterway-tributary', this.buildCorridorLayer(init, 1));
    this.layerGroups.set('ports', this.buildCitiesLayer(init));
    this.layerGroups.set('cargo-route', this.buildRouteLayer(init));
    this.layerGroups.set('vessel', this.buildVesselLayer(init));

    for (const group of this.layerGroups.values()) {
      svg.appendChild(group);
    }

    init.container.replaceChildren(svg);
    this.applyViewBox();
    this.syncLayerVisibility();
  }

  setCamera(camera: Partial<HydrowayMapCamera>): void {
    this.camera = { ...this.camera, ...camera };
    this.applyViewBox();
  }

  fitBounds(points: HydrowayMapPoint[], padding = 72): void {
    if (!points.length) return;

    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;

    this.setCamera({
      x: clamp(minX, 0, HYDRO_MAP_VIEWBOX.width),
      y: clamp(minY, 0, HYDRO_MAP_VIEWBOX.height),
      width: clamp(maxX - minX, HYDRO_MAP_VIEWBOX.width * 0.2, HYDRO_MAP_VIEWBOX.width * 1.2),
      height: clamp(maxY - minY, HYDRO_MAP_VIEWBOX.height * 0.2, HYDRO_MAP_VIEWBOX.height * 1.2),
      zoom: HYDRO_MAP_VIEWBOX.width / clamp(maxX - minX, 1, HYDRO_MAP_VIEWBOX.width),
    });
  }

  setLayers(layers: HydrowayMapLayerId[]): void {
    this.visibleLayers = new Set(layers);
    this.syncLayerVisibility();
  }

  getCamera(): HydrowayMapCamera {
    return { ...this.camera };
  }

  destroy(): void {
    this.container?.replaceChildren();
    this.container = null;
    this.svg = null;
    this.scene = null;
    this.layerGroups.clear();
    this.camera = { ...HYDRO_MAP_INITIAL_CAMERA };
    this.visibleLayers = new Set(ALL_LAYERS);
  }

  private applyViewBox(): void {
    if (!this.svg) return;
    this.svg.setAttribute('viewBox', cameraToSvgViewBox(this.camera));
  }

  private syncLayerVisibility(): void {
    for (const [layerId, group] of this.layerGroups.entries()) {
      group.style.display = this.visibleLayers.has(layerId) ? '' : 'none';
    }
  }

  private appendDefs(svg: SVGSVGElement): void {
    const defs = createSvgElement('defs');

    const corridorGradient = createSvgElement('linearGradient', {
      id: `${this.uid}-corridor`,
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '0%',
    });
    corridorGradient.append(
      createStop('0%', hydroMapStyleTokens.corridorGlow),
      createStop('50%', hydroMapStyleTokens.corridorStroke),
      createStop('100%', hydroMapStyleTokens.corridorGlow),
    );

    const routeGradient = createSvgElement('linearGradient', {
      id: `${this.uid}-route`,
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '0%',
    });
    routeGradient.append(
      createStop('0%', 'rgba(47, 224, 208, 0.35)'),
      createStop('100%', hydroMapStyleTokens.routeActive),
    );

    defs.append(corridorGradient, routeGradient);
    svg.appendChild(defs);
  }

  private appendBackdrop(svg: SVGSVGElement): void {
    svg.appendChild(
      createSvgElement('rect', {
        x: 0,
        y: 0,
        width: HYDRO_MAP_VIEWBOX.width,
        height: HYDRO_MAP_VIEWBOX.height,
        fill: hydroMapStyleTokens.background,
      }),
    );
  }

  private appendGrid(svg: SVGSVGElement): void {
    const grid = createSvgElement('g', { 'aria-hidden': 'true', opacity: 0.55 });
    for (let index = 0; index <= 20; index += 1) {
      grid.appendChild(
        createSvgElement('line', {
          x1: index * 80,
          y1: 0,
          x2: index * 80,
          y2: HYDRO_MAP_VIEWBOX.height,
          stroke: hydroMapStyleTokens.gridLine,
        }),
      );
    }
    for (let index = 0; index <= 11; index += 1) {
      grid.appendChild(
        createSvgElement('line', {
          x1: 0,
          y1: index * 80,
          x2: HYDRO_MAP_VIEWBOX.width,
          y2: index * 80,
          stroke: hydroMapStyleTokens.gridLine,
        }),
      );
    }
    svg.appendChild(grid);
  }

  private buildCorridorLayer(init: HydrowayMapProviderInit, index: number): SVGGElement {
    const group = createSvgElement('g');
    const corridor = init.scene.corridors[index];
    if (!corridor) return group;

    group.appendChild(
      createSvgElement('path', {
        d: corridor.pathD,
        fill: 'none',
        stroke: `url(#${this.uid}-corridor)`,
        'stroke-width': 28,
        'stroke-linecap': 'round',
        opacity: 0.9,
      }),
    );
    group.appendChild(
      createSvgElement('path', {
        d: corridor.pathD,
        fill: 'none',
        stroke: hydroMapStyleTokens.corridorGlow,
        'stroke-width': 42,
        'stroke-linecap': 'round',
        opacity: 0.35,
      }),
    );
    const corridorLabel = createSvgElement('text', {
      x: corridor.labelPoint.x,
      y: corridor.labelPoint.y,
      fill: hydroMapStyleTokens.corridorLabel,
      'font-size': 22,
      'font-weight': 700,
      'letter-spacing': 4,
    });
    corridorLabel.append(document.createTextNode(corridor.label));
    group.appendChild(corridorLabel);

    return group;
  }

  private buildCitiesLayer(init: HydrowayMapProviderInit): SVGGElement {
    const group = createSvgElement('g');
    for (const city of init.scene.cities) {
      const marker = createSvgElement('g');
      marker.appendChild(
        createSvgElement('circle', {
          cx: city.point.x,
          cy: city.point.y,
          r: 5,
          fill: hydroMapStyleTokens.cityDot,
        }),
      );
      const label = createSvgElement('text', {
        x: city.point.x + 10,
        y: city.point.y - 10,
        fill: hydroMapStyleTokens.cityLabel,
        'font-size': 13,
        'font-weight': 600,
      });
      label.append(document.createTextNode(city.name));
      marker.appendChild(label);
      group.appendChild(marker);
    }
    return group;
  }

  private buildRouteLayer(init: HydrowayMapProviderInit): SVGGElement {
    const { route } = init.scene;
    const group = createSvgElement('g');

    group.appendChild(
      createSvgElement('path', {
        d: route.routePathD,
        fill: 'none',
        stroke: hydroMapStyleTokens.routeTrack,
        'stroke-width': 10,
        'stroke-linecap': 'round',
      }),
    );
    group.appendChild(
      createSvgElement('path', {
        d: route.traveledPathD,
        fill: 'none',
        stroke: `url(#${this.uid}-route)`,
        'stroke-width': 12,
        'stroke-linecap': 'round',
      }),
    );

    group.appendChild(this.buildEndpoint(route.origin, route.originLabel, hydroMapStyleTokens.endpointOrigin));
    group.appendChild(
      this.buildEndpoint(route.destination, route.destinationLabel, hydroMapStyleTokens.endpointDestination),
    );

    return group;
  }

  private buildEndpoint(point: HydrowayMapPoint, label: string, color: string): SVGGElement {
    const group = createSvgElement('g', {
      transform: `translate(${point.x} ${point.y})`,
    });
    group.appendChild(
      createSvgElement('circle', { r: 16, fill: 'none', stroke: color, 'stroke-width': 2.5, opacity: 0.85 }),
    );
    group.appendChild(createSvgElement('circle', { r: 6.5, fill: color }));
    const text = createSvgElement('text', {
      x: 18,
      y: -14,
      fill: hydroMapStyleTokens.cityLabel,
      'font-size': 14,
      'font-weight': 700,
    });
    text.append(document.createTextNode(label));
    group.appendChild(text);
    return group;
  }

  private buildVesselLayer(init: HydrowayMapProviderInit): SVGGElement {
    const { vessel } = init.scene.route;
    const group = createSvgElement('g', {
      transform: `translate(${vessel.x} ${vessel.y})`,
    });
    group.appendChild(
      createSvgElement('circle', {
        r: 22,
        fill: hydroMapStyleTokens.vesselHalo,
        opacity: 0.35,
      }),
    );
    group.appendChild(
      createSvgElement('circle', {
        r: 8,
        fill: hydroMapStyleTokens.accent,
        stroke: '#041018',
        'stroke-width': 2,
      }),
    );
    return group;
  }
}

function createStop(offset: string, color: string): SVGStopElement {
  const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop.setAttribute('offset', offset);
  stop.setAttribute('stop-color', color);
  return stop;
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return hash;
}
