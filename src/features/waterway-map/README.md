# waterway-map — spike MapLibre (V2.1b+)

Feature isolada para o mapa hidroviário profissional do desktop expanded. Complementa [ADR 0030](../../docs/adr/0030-professional-hydroway-map-provider.md) e [ADR 0031](../../docs/adr/0031-hydroway-geodata-pipeline.md).

## Objetivo

Validar arquitetura de **provider** (`HydrowayMapProvider`), câmera, camadas e mocks geográficos fictícios **sem** instalar `maplibre-gl` nem alterar a rota de produção `/<locale>/cargas/[id]/mapa`.

| Microfase | Entrega |
|-----------|---------|
| **V2.1b** (atual) | Rota dev + `SvgSchematicHydrowayProvider` + mocks TS |
| **V2.1c** | `npm install maplibre-gl` + `MapLibreHydrowayProvider` na mesma rota dev |
| **V2.3** | Integração em `/cargas/[id]/mapa` atrás de `hydrowayMapLibreEnabled` |

## Rota dev

```
/<locale>/dev/hydroway-map-spike
```

Exemplo local: `http://localhost:3000/pt-BR/dev/hydroway-map-spike`

## Variáveis de ambiente

| Variável | Default | Efeito |
|----------|---------|--------|
| `HYDRORIVERS_HYDROWAY_MAP_SPIKE_ROUTE` | `true` em dev; `false` em production | Habilita a rota dev (`notFound` se desligada) |
| `hydrowayMapLibreEnabled` | — | Reservada para V2.3 (produção `/mapa`) |

Helper: `isHydrowayMapLibreSpikeRouteEnabled()` em `src/shared/config/env.ts`.

## Estrutura

```text
src/features/waterway-map/
  components/          # shell (RSC-friendly) + client viewport
  providers/           # HydrowayMapProvider + SVG schematic
  data/                # mocks determinísticos (fictícios)
  utils/               # estilo, câmera, detectWebGL
```

**Não importar** desta feature em:

- `desktop-cargo-map/` (foundation SVG de produção)
- `operations-board/` (cockpit)
- rotas mobile

## MapLibre (V2.1c)

Instalar somente após critérios do spike em [ADR 0030](../../docs/adr/0030-professional-hydroway-map-provider.md):

```bash
npm install maplibre-gl
```

Implementar `MapLibreHydrowayProvider` com `dynamic(..., { ssr: false })` e estilos apenas no chunk client.

## Remover o spike

Quando V2.3 estiver estável em produção:

1. Apagar `src/app/[locale]/dev/hydroway-map-spike/`
2. Remover `isHydrowayMapLibreSpikeRouteEnabled` se não houver outros usos
3. Manter `src/features/waterway-map/` como módulo de produção (sem sufixo `-spike` nos componentes, em refactor opcional)

## Validação local

```bash
npx sass --no-source-map src/features/waterway-map/components/hydroway-map-spike.module.scss /tmp/hydroway-map-spike.css
npm run lint
npm run typecheck
```
