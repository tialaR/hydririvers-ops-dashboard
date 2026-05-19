# waterway-map — spike MapLibre (V2.1b–c)

Feature isolada para o mapa hidroviário profissional do desktop expanded. Complementa [ADR 0030](../../docs/adr/0030-professional-hydroway-map-provider.md) e [ADR 0031](../../docs/adr/0031-hydroway-geodata-pipeline.md).

## Objetivo

Validar arquitetura de **provider** (`HydrowayMapProvider`), câmera, camadas GeoJSON fictícias e **MapLibre GL JS** sem alterar a rota de produção `/<locale>/cargas/[id]/mapa`, cockpit ou mobile.

| Microfase | Entrega |
|-----------|---------|
| **V2.1b** | Rota dev + `SvgSchematicHydrowayProvider` + mocks TS |
| **V2.1c** (atual) | `maplibre-gl` + `MapLibreHydrowayProvider` + fallback SVG |
| **V2.3** | Integração em `/cargas/[id]/mapa` atrás de `hydrowayMapLibreEnabled` |

## Rota dev

```
/<locale>/dev/hydroway-map-spike
```

Exemplos locais:

- MapLibre (default com WebGL): `http://localhost:3000/pt-BR/dev/hydroway-map-spike`
- Forçar fallback SVG: `http://localhost:3000/pt-BR/dev/hydroway-map-spike?forceSvgFallback=1`

Use os chips **SVG schematic** / **MapLibre GL** no banner para alternar o provider preferido.

## Variáveis de ambiente

| Variável | Default | Efeito |
|----------|---------|--------|
| `HYDRORIVERS_HYDROWAY_MAP_SPIKE_ROUTE` | `true` em dev; `false` em production | Habilita a rota dev (`notFound` se desligada) |
| `hydrowayMapLibreEnabled` | — | Reservada para V2.3 (produção `/mapa`) |

Helper: `isHydrowayMapLibreSpikeRouteEnabled()` em `src/shared/config/env.ts`.

## Estrutura

```text
src/features/waterway-map/
  components/          # shell + client + viewport MapLibre (dynamic ssr:false)
  providers/           # SvgSchematic + MapLibreHydrowayProvider
  data/                # mocks schematic + GeoJSON derivado
  utils/               # estilo, câmera, schematic→WGS84, detectWebGL
```

**Não importar** desta feature em:

- `desktop-cargo-map/` (foundation SVG de produção)
- `operations-board/` (cockpit)
- rotas mobile

## MapLibre (V2.1c)

- Dependência: `maplibre-gl@5.x` (BSD-3), instalada **somente** para o spike.
- CSS `maplibre-gl/dist/maplibre-gl.css` importado apenas em `maplibre-hydroway-provider.tsx` (chunk client).
- Viewport carregado via `next/dynamic(..., { ssr: false })` em `hydroway-map-spike-client.tsx`.
- `page.tsx` da rota dev permanece RSC fino — **sem** import de `maplibre-gl`.
- Style local escuro (`hydro-maplibre-style.ts`): fundo + camadas GeoJSON; **sem** tiles raster comerciais pagos.
- Glyphs de demonstração OSS (`demotiles.maplibre.org`) apenas para rótulos de cidades; hidrovia/rota/embarcação são vetores próprios.

### Camadas GeoJSON mock (CARGO-001)

| Camada | Source | Conteúdo |
|--------|--------|----------|
| Rios | `spike-rivers` | Amazonas + Pará (LineString) |
| Rota | `spike-route-track` / `spike-route-traveled` | Belém → Santarém, trecho percorrido 15% |
| Cidades | `spike-cities` | Pontos de contexto |
| Origem / destino / vessel | `spike-origin`, `spike-destination`, `spike-vessel` | Extremidades + posição mock |

Conversão schematic → WGS84 fictício: `utils/schematic-to-geo.ts` + `data/spike-scene-geojson.ts`.

### Controles

- Zoom + / −
- Ajustar à rota (`fitBounds` nos pontos origem, destino, vessel)
- Redefinir visão (câmera inicial)

### Fallback SVG

Ordem:

1. `?forceSvgFallback=1` → sempre SVG
2. WebGL indisponível (`detectWebGLSupport`) → SVG
3. Falha ao instanciar MapLibre → SVG + nota na status bar
4. Chip **SVG schematic** no banner → SVG

## Isolamento de bundle

MapLibre **não** entra no grafo de import de:

- `src/app/[locale]/cargas/**`
- `operations-board`
- mobile

Apenas a rota `dev/hydroway-map-spike` compõe o client que faz `dynamic()` do viewport MapLibre.

### Bundle report (V2.1c)

Medição após `npm run build` (2026-05-18, Next.js 16.2.4):

| Artefato (`.next/static/chunks/`) | Raw | Gzip (aprox.) |
|-----------------------------------|-----|----------------|
| `0q90jke8lclza.js` — runtime `maplibre-gl` | ~1019 KB | **~270 KB** |
| `10re4daa0d_ig.css` — CSS MapLibre | ~71 KB | **~10 KB** |
| `13cfrb8k3ut1t.js` — viewport/provider spike | ~13 KB | **~4 KB** |
| **Total carregado na rota dev** | — | **~284 KB** |

Budget ADR 0030: lib ≤ **350 KB gzip**. O chunk principal da lib está **dentro** do budget; CSS + adapter somam ~14 KB gzip adicionais.

Comando para repetir a medição:

```bash
npm run build
grep -rl "maplibregl-map" .next/static/chunks | while read f; do
  printf '%s gzip=%sKB\n' "$(basename "$f")" "$(gzip -c "$f" | wc -c | awk '{printf "%.0f", $1/1024}')"
done
grep -rl "maplibre-gl" .next/static/chunks/*.js | while read f; do
  printf '%s gzip=%sKB\n' "$(basename "$f")" "$(gzip -c "$f" | wc -c | awk '{printf "%.0f", $1/1024}')"
done
```

## Validação local

```bash
npm run lint
npm run typecheck
npm run check:i18n
npm run build
npm test
npm run test:mock-mode
```

Testes unitários do adapter geográfico: `tests/unit/features/waterway-map/schematic-to-geo.test.ts`.

## Rollback

1. Desinstalar `maplibre-gl` (se remover o spike por completo).
2. Apagar `providers/maplibre-hydroway-provider.tsx` e viewport MapLibre.
3. Na rota dev, voltar o client para apenas `SvgSchematicHydrowayProvider`.
4. Manter `SvgSchematicHydrowayProvider` como fallback de produção até V2.3.

## Remover o spike

Quando V2.3 estiver estável em produção:

1. Apagar `src/app/[locale]/dev/hydroway-map-spike/`
2. Remover `isHydrowayMapLibreSpikeRouteEnabled` se não houver outros usos
3. Manter `src/features/waterway-map/` como módulo de produção
