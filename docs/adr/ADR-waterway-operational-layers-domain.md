# ADR — Domínio operacional hidroviário para camadas de mapa (Fase 1)

## Status

Aceito — Fase 1 (domínio + mocks + resolvers), sem UI nem layers MapLibre.

## Contexto

O mapa produto HydroRivers já integra rotas demo, provider MapLibre e experiências desktop/mobile ([ADR 0030](./0030-professional-hydroway-map-provider.md), [ADR 0031](./0031-hydroway-geodata-pipeline.md)). As perguntas operacionais reais — onde está a carga, em qual corredor, se o trecho é navegável, qual risco impacta ETA — não estão modeladas em um domínio coeso alimentando o mapa.

Presets visuais de camadas (água, governo, escuro) não respondem a modos de decisão distintos para capitão, embarcador e operador.

## Decisão

1. Introduzir tipos de domínio operacional em `src/features/waterway-map/domain/hydroway-operational-domain.types.ts`: corredores, segmentos, terminais, alertas, sinalização, áreas de planejamento, checkpoints e contexto por `cargoId`.

2. Definir **modos operacionais** (`operation`, `navigation`, `logistics`, `risk`, `government`) como configuração de decisão (`HYDROWAY_OPERATIONAL_LAYER_MODES`), não como presets cosméticos — cada modo declara audiência, carga cognitiva, ênfase no mapa e tipos de feature visíveis/silenciados.

3. Popular mocks determinísticos e fictícios em `mocks/hydroway-operational-layers.mock.ts`, priorizando Norte/Amazônia e cargas demo `CARGO-001` e `CARGO-004`, com texto de negócio acionável (calado, dragagem, fila portuária, etc.).

4. Expor resolvers em `data/resolve-cargo-operational-waterway-context.ts` para contexto por carga, recorte do dataset e modo recomendado (regras: critical → risk; navegabilidade attention/restricted → navigation; fila alta no próximo terminal → logistics; padrão → operation).

5. Fornecer helpers de validação e conversão GeoJSON leve para a Fase 2, sem criar sources/layers MapLibre nesta fase.

## Por que mocks operacionais

- Dados oficiais (BIT, DNIT, Atlas) não entram no repositório nesta fase ([ADR 0029](./0029-mock-data-fictional-deterministic.md)).
- UI e layers precisam de contratos estáveis e cenários de QA repetíveis antes de integração geográfica.
- Mensagens curtas orientadas a ação validam utilidade de negócio antes de investir em render.

## Escopo desta fase (feito)

- Tipos, constantes de modo, mocks, resolvers, validação, GeoJSON helpers, testes unitários, exports em `waterway-map/index.ts`.

## Fora de escopo (não feito)

- Painel de camadas, bottom sheet, alteração de layout desktop/mobile.
- Sources/layers MapLibre, animação de rota, assets em `public/assets/map`.
- APIs externas, scraping, novas dependências.

## Consequências

- Positivo: base testável para Fase 2; cargas demo com narrativa operacional coerente com rotas GeoJSON existentes.
- Custo: duplicação temporária com `waterway-tracking` até convergência futura.
- Risco: coordenadas mock não são oficiais — UI deve rotular como demonstração.

## Próximos passos

| Fase | Entrega |
|------|---------|
| **2** | Sources/layers MapLibre a partir dos helpers GeoJSON e recortes por carga |
| **3** | Conectar painel Camadas aos modos `HYDROWAY_OPERATIONAL_LAYER_MODES` + i18n das `labelKey` |
| **4** | Tooltips e bottom sheet orientados a ação (`captainSummary`, `recommendedAction`) |

## Data

2026-05-23

## Responsáveis

HydroRivers frontend/product team
