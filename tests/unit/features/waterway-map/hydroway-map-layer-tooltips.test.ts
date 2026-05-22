import { describe, expect, it } from 'vitest';

import {
  buildHydrowayLayerTooltipHtml,
  escapeHydrowayMapTooltipText,
  getHydrowayLayerTooltipFeatureKey,
  HYDROWAY_CONTEXT_LAYER_IDS,
  HYDRAWAY_LAYER_TOOLTIP_LAYER_IDS,
  resolveHydrowayLayerTooltipCategory,
  resolveHydrowayLayerTooltipContent,
  truncateHydrowayMapTooltipText,
} from '@/features/waterway-map/utils/hydro-maplibre-overlay';

describe('hydroway-map-layer-tooltips', () => {
  it('expõe apenas camadas de ponto informativo', () => {
    expect(HYDRAWAY_LAYER_TOOLTIP_LAYER_IDS).toContain(
      HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint,
    );
    expect(HYDRAWAY_LAYER_TOOLTIP_LAYER_IDS).toContain(
      HYDROWAY_CONTEXT_LAYER_IDS.corridorInfoPoint,
    );
    expect(HYDRAWAY_LAYER_TOOLTIP_LAYER_IDS).not.toContain(
      HYDROWAY_CONTEXT_LAYER_IDS.basinsFill,
    );
    expect(HYDRAWAY_LAYER_TOOLTIP_LAYER_IDS).not.toContain(
      HYDROWAY_CONTEXT_LAYER_IDS.corridorsCore,
    );
    expect(HYDRAWAY_LAYER_TOOLTIP_LAYER_IDS).not.toContain(
      HYDROWAY_CONTEXT_LAYER_IDS.alertZonesFill,
    );
  });

  it('não resolve tooltip para fill ou linha de corredor', () => {
    expect(resolveHydrowayLayerTooltipCategory(HYDROWAY_CONTEXT_LAYER_IDS.basinsFill)).toBeNull();
    expect(resolveHydrowayLayerTooltipCategory(HYDROWAY_CONTEXT_LAYER_IDS.corridorsCore)).toBeNull();
  });

  it('escapa conteúdo textual no HTML do tooltip compacto', () => {
    const html = buildHydrowayLayerTooltipHtml(HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint, {
      type: 'Feature',
      properties: {
        id: 'terminal-test',
        name: '<Terminal & Co>',
        tooltipKind: 'terminal',
        cargoProfile: 'bulk',
        importance: 'national',
      },
      geometry: { type: 'Point', coordinates: [-48, -1.5] },
    });

    expect(html).toContain('&lt;Terminal &amp; Co&gt;');
    expect(html).not.toContain('<Terminal & Co>');
    expect(html).toContain('hydriMapTooltipEyebrow');
    expect(html).toContain('<span class="hydriMapTooltipEyebrow">');
    expect(escapeHydrowayMapTooltipText('<script>')).toBe('&lt;script&gt;');
  });

  it('monta conteúdo curto por categoria de corredor', () => {
    const content = resolveHydrowayLayerTooltipContent(
      HYDROWAY_CONTEXT_LAYER_IDS.corridorInfoPoint,
      {
        type: 'Feature',
        properties: {
          id: 'corridor-1',
          name: 'Solimões-Amazonas',
          tooltipKind: 'corridor',
          category: 'strategic',
          navigability: 'high',
        },
        geometry: { type: 'Point', coordinates: [-54.2, -1.82] },
      },
    );

    expect(content?.eyebrow).toBe('Corredor');
    expect(content?.title).toBe('Solimões-Amazonas');
    expect(content?.meta).toContain('Estratégico');
    expect(content?.meta).toContain('nav. alta');
  });

  it('trunca strings longas', () => {
    const long = 'Nome extremamente longo para tooltip do mapa hidroviário';
    expect(truncateHydrowayMapTooltipText(long, 20).endsWith('…')).toBe(true);
  });

  it('gera chave estável apenas para pontos', () => {
    const pointFeature: GeoJSON.Feature = {
      type: 'Feature',
      properties: { id: 'alert-draft' },
      geometry: { type: 'Point', coordinates: [-48.3, -1.28] },
    };

    expect(
      getHydrowayLayerTooltipFeatureKey(HYDROWAY_CONTEXT_LAYER_IDS.alertPointsPoint, pointFeature),
    ).toBe(`${HYDROWAY_CONTEXT_LAYER_IDS.alertPointsPoint}:alert-draft`);

    const polygonFeature: GeoJSON.Feature = {
      type: 'Feature',
      properties: { id: 'alert-draft' },
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
    };

    expect(
      getHydrowayLayerTooltipFeatureKey(HYDROWAY_CONTEXT_LAYER_IDS.alertPointsPoint, polygonFeature),
    ).toBeNull();
  });
});
