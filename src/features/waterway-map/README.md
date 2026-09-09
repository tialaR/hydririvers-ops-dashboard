# waterway-map — mapa hidroviário operacional

Feature isolada para o mapa hidroviário profissional do desktop expanded. Complementa [ADR 0030](../../docs/adr/0030-professional-hydroway-map-provider.md) e [ADR 0031](../../docs/adr/0031-hydroway-geodata-pipeline.md).

## Objetivo

Módulo de produção do mapa operacional (`HydrowayMapProvider`), câmera, camadas GeoJSON fictícias e **MapLibre GL JS**. O histórico de microfases abaixo registra a evolução que culminou na rota canônica `/<locale>/cargas/[id]/mapa`.

| Microfase | Entrega |
|-----------|---------|
| **V2.1b** | Rota dev + `SvgSchematicHydrowayProvider` + mocks TS |
| **V2.1c** | `maplibre-gl` + `MapLibreHydrowayProvider` + fallback SVG |
| **V2.2b** | GeoJSON mock + `adaptCargoToHydrowayMapModel` |
| **V2.2c** | Spike dev consome `HydrowayMapModel` (MapLibre + SVG) |
| **V2.3x** | Visual immersive: basemap escuro, glow rios/rota |
| **V2.3z** | Cartografia MapLibre-native: line-gradient, symbol layers, ícones canvas, pitch |
| **V2.3zz** | Densidade hidrográfica, markers operacionais, leitura rota, labels, câmera por carga |
| **V2.3zzz** | MapLibre-native: animação rota/embarcação via `setData`, sky/fog, stack de layers, controles dock |
| **V2.6** | GOV-enriched mock: rede hidroviária Arco Norte densa, nós logísticos, zonas, metadados de confiança e rotas demo plausíveis |
| **V2.7** | Visual lift MapLibre-native: câmera em duas fases, stack hidroviária, labels por importance, HUD cockpit |
| **V2.7c** (atual) | MVP mínimo aceitável: basemap OpenFreeMap (dev only), overlay rota/hidrovias, capítulos `flyTo`, controles simples |
| **V2.3** | Integração em `/cargas/[id]/mapa` atrás de `hydrowayMapLibreEnabled` |

## Rota canônica

```text
/<locale>/cargas/<cargo-id>/mapa
```

As rotas de spike foram removidas no fechamento Portfolio-Ready. O fallback SVG e os adapters continuam cobertos dentro do módulo de produção.

## Estrutura

```text
src/features/waterway-map/
  adapters/            # Cargo → HydrowayMapModel + model → scene SVG
  components/          # shell + client + viewport MapLibre (dynamic ssr:false)
  providers/           # SvgSchematic + MapLibreHydrowayProvider (consomem model)
  data/                # GeoJSON mock V2.6 + resolve spike por cargoId
  utils/               # estilo, câmera, geo↔schematic, detectWebGL
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
- **V2.7c:** basemap público [OpenFreeMap Bright](https://tiles.openfreemap.org/styles/bright) (`DEV_BASEMAP_STYLE_URL` em `hydro-maplibre-dev-basemap.ts`) — **somente** rota dev; sem token Mapbox/Google/MapTiler. Overlay HydroRivers (rotas, hidrovias simplificadas, origem/destino/embarcação) adicionado após `map.on('load')` via `hydro-maplibre-overlay.ts`.
- Style local legado (`hydro-maplibre-style.ts`) permanece para referência/testes; o provider dev usa basemap externo + overlay MVP.
- Animação nativa: `routeTraveled` + `vessel` atualizados com `GeoJSONSource.setData()` (padrão “Animate a line” / “Animate point along route”).
- **Sem** tiles/APIs pagas: estilo local + GeoJSON mock + ícones gerados em canvas (`hydro-maplibre-icons.ts`).
- **line-gradient** na rota planejada (`lineMetrics: true`) + camada percorrida energética vs restante discreta.
- **Symbol/circle layers** para origem, destino, embarcação, portos e terminais (ícones canvas distintos).
- Rótulos curtos de porto via `displayLabel` / `labelSortKey` (sem “mock” no mapa; abreviação em clusters).
- Câmera por carga demo (`hydro-maplibre-camera.ts`) — CARGO-001/002/004 com padding e maxZoom ajustados; entrada em duas fases (`fitBounds` instantâneo + `easeTo` curto; animação só após `moveend`).
- Rótulos hidroviários (`symbol-placement: line`) e portos filtrados por `labelSortKey` / `importance` — sem texto “mock” no mapa.
- Animação operacional (`hydro-maplibre-animation.ts` + `requestAnimationFrame`, respeita `prefers-reduced-motion`; pausa via controle no mapa).
- Dados oficiais (shapefile BIT/DNIT/ANTAQ) ficam para pipeline futura (ADR 0031).

### Mock geográfico V2.6 (GOV-enriched)

**Não é dado oficial.** Os artefatos em `data/` são *source-inspired*: inspirados estruturalmente em fontes públicas (BIT/ANTAQ hidroviário e portuário, ANA/SNIRH para evolução futura), porém **geometria fictícia**, determinística e própria para demo/produto.

Inspiração (estrutural, não reprodução):

- Ministério dos Transportes / BIT Mapas (aquaviário, portuário, hidroviário)
- ANTAQ Informações Geográficas (instalações, travessias, vias interiores, portos organizados)
- ANA/SNIRH — referência futura para hidrografia e bacias

Metadados por feature (quando aplicável): `sourceInspiration`, `sourceType` (`official-inspired` | `domain-inspired` | `synthetic`), `sourceNotes`, `confidence`, `mockLevel`, `lastReviewed` (string estável), `visualPurpose`.

Artefatos (bbox WGS84 fictício `HYDROWAY_MOCK_GEO_BBOX`; carregados e fundidos em `load-mock-geojson.server.ts`):

| Arquivo | Features (aprox.) | Camada lógica |
|---------|-------------------|---------------|
| `amazon-main-rivers.mock.geojson` | 6 | Rios principais: Amazonas/Solimões, Madeira, Tapajós, Tocantins, estuário Pará |
| `amazon-secondary-rivers.mock.geojson` | 12 | Afluentes e ramais secundários |
| `amazon-operational-channels.mock.geojson` | 6 | Canais operacionais / calhas |
| `amazon-navigable-corridors.mock.geojson` | 5 | HN-100, Madeira, Tapajós, Tocantins-Araguaia, Belém–Barcarena |
| `amazon-logistics-nodes.mock.geojson` | 24 | Portos, terminais, transbordo |
| `amazon-risk-zones.mock.geojson` | 5 | Zonas de atenção + várzea (polígonos sutis) |
| `cargo-routes.mock.geojson` | 3 | Rotas demo CARGO-001/002/004 |

No MapLibre, `mainRivers` = principais + secundários + canais; `portsTerminals` = nós logísticos; `riskZones` = polígonos de contexto.

Regenerar artefatos (determinístico):

```bash
node src/features/waterway-map/data/scripts/build-mock-geojson.mjs
```

Rotas demo (≥ 24 vértices, seguem corredores):

- **CARGO-001** — Belém → Santarém (`amazonas`), contexto estuário/Óbidos/Prainha
- **CARGO-002** — Manaus → Belém (`amazonas`), via Itacoatiara, Parintins, Óbidos, Santarém
- **CARGO-004** — Marabá → Vila do Conde (`tocantins-araguaia`), via estuário/Barcarena

Orçamento ADR 0031: ≤ 200 KB/arquivo, ≤ 500 KB combinado (`mock-geojson-budget.test.ts`).

**Limitações:** coordenadas esquemáticas dentro do bbox demo; sem shapefiles oficiais; sem API em runtime; rótulos e densidade ainda evoluem com pipeline ADR 0031.

**Evolução para pipeline oficial:** substituir artefatos por ingestão versionada (shapefile/GeoPackage → normalização → validação espacial → publicação estática), mantendo contrato `HydrowayMapModel` e `HydrowayGeoJsonSources`.

### Camadas GeoJSON (V2.2b+, sources `hydroway-*`)

| Camada | Source | Conteúdo |
|--------|--------|----------|
| Rios / canais | `hydroway-main-rivers` | Principais (river) + afluentes (tributary) + secundários (secondary) + canais (channel) |
| Corredores | `hydroway-navigable-corridors` | Hidrovias classificadas Arco Norte (mock) |
| Portos / transbordo | `hydroway-ports-terminals` | Portos, terminais e nós de transbordo |
| Zonas | `hydroway-risk-zones` | Várzea e zonas de atenção (fill sutil) |
| Rota total | `hydroway-route-track` | LineString da carga ativa |
| Rota percorrida | `hydroway-route-traveled` | Trecho até `progress01` |
| Origem / destino / vessel | `hydroway-origin`, `hydroway-destination`, `hydroway-vessel` | Pontos operacionais |

Adapter: `adaptCargoToHydrowayMapModel`. Spike: `resolveSpikeHydrowayMapModel(cargoId)`. SVG fallback projeta geo → schematic via `utils/geo-to-schematic.ts`.

### Controles

- Dock flutuante: zoom +/−, rota completa (`fitBounds` / capítulo overview), reset, capítulos Origem/Atual/Destino (`flyTo`), pausa/play animação (MapLibre), indicador de provider

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

Testes: `mock-geojson-schema.test.ts`, `mock-geojson-budget.test.ts`, `cargo-to-hydroway-geo.adapter.test.ts`, `resolve-spike-hydroway-model.test.ts`, `geo-to-schematic.test.ts`, `schematic-to-geo.test.ts`, `hydro-maplibre-native.test.ts`.

## Smoke tests de rotas (Playwright)

Com o app em `http://localhost:3000` (ou deixando o Playwright subir `npm run dev` automaticamente):

```bash
npm run test:hydroway-routes
```

O que valida:

- Rotas de produção `/pt-BR/cargas` e `/pt-BR/cargas/<id>/mapa`
- Smoke mobile em `/pt-BR/cargas` (viewport Pixel 5)
- Ausência de `pageerror`, erros de console MapLibre/Style Spec, HTTP 500 e 404 do documento
- `401` conhecido em `/api/auth/me` é ignorado

Evidências (screenshots e traces em falha):

- Diretório: `test-results/hydroway-routes/` (por teste, via `outputPath` do Playwright)
- São evidência de smoke (rota carregou, sem erro fatal), **não** baseline visual pixel-perfect para regressão de UI

## Rollback

Reverta o commit de fechamento Portfolio-Ready se a remoção das rotas laboratoriais precisar ser auditada. Não reintroduza uma rota pública de spike; valide providers e fallbacks pela rota canônica e pelos testes focados.
