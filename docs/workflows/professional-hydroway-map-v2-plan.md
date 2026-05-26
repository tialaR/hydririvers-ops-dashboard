# Plano V2 — Mapa hidroviário profissional (desktop expanded)

Documento operacional que transforma a decisão de produto/arquitetura em fases pequenas executáveis. Complementa:

- [ADR 0030 — Provider MapLibre + fallback SVG](../adr/0030-professional-hydroway-map-provider.md)
- [ADR 0031 — Pipeline geográfico](../adr/0031-hydroway-geodata-pipeline.md)
- [ADR 0001 — Rota desktop expanded](../adr/0001-desktop-expanded-map-route.md)
- [Playbook desktop expanded](./desktop-expanded-map-playbook.md)
- [Workflow iteração visual Codex](./codex-visual-iteration.md)

## Objetivo

Elevar `/<locale>/cargas/[id]/mapa` a experiência **map-first** profissional de hidrovia amazônica, superior ao mobile em amplitude geográfica, preservando cockpit, mobile, i18n e mocks.

## Decisão resumida

| Item | Escolha |
|------|---------|
| Provider principal | **MapLibre GL JS** (após spike) |
| Fallback | **SVG foundation** (`desktop-cargo-map/`) |
| Dados v1 | **GeoJSON mock** determinístico local |
| Dados futuros | shapefile → GeoJSON/PMTiles; BIT/DNIT com feature flag |
| Não fazer na V2 | Mapbox, Google Maps, unificar os 3 motores SVG de uma vez |

## Estado atual (foundation)

- Rota fina: `src/app/[locale]/cargas/[id]/mapa/page.tsx`
- UI: `src/features/dashboard/components/operations-board/desktop-cargo-map/`
- Três motores esquemáticos (cockpit, expanded, mobile) — ver ADR 0030
- Domínio sem geometria: `src/features/waterway-tracking/`

## Fases

### V2.0 — ADRs e decisão de provider

**Status:** em andamento (documentação)

**Entregas:**

- [x] ADR 0030 — provider MapLibre + fallback SVG
- [x] ADR 0031 — pipeline geográfico
- [x] Este plano

**Não inclui:** `npm install`, alteração de `src/`, spike.

**Critério de saída:** ADRs revisados; time alinhado nos critérios de spike (ADR 0030).

**Validação:**

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

---

### V2.1 — Spike MapLibre isolado

**Pré-requisitos:** V2.0 aceito.

**Objetivo:** provar viabilidade técnica sem tocar mobile/cockpit.

**Escopo:**

- Branch `spike/maplibre-hydroway`
- **V2.1b (concluída):** skeleton em `src/features/waterway-map/` + rota dev `/<locale>/dev/hydroway-map-spike` (SVG schematic, sem MapLibre)
- Instalar `maplibre-gl` **somente na V2.1c**, após ADR 0030 aceito
- Montar mapa em rota dev isolada **ou** `/mapa` atrás de `hydrowayMapLibreEnabled` (integração produção só V2.3)
- Basemap escuro + 1 GeoJSON de rio mock + linha de rota
- Pan, zoom, `fitBounds`
- Fallback SVG quando WebGL falhar
- Medir chunk gzip (budget ≤ 350 KB lib)

**Arquivos permitidos:**

- `src/features/waterway-map/**`
- `package.json` / `package-lock.json`
- `src/app/[locale]/cargas/[id]/mapa/page.tsx` (wrapper dynamic se necessário)

**Arquivos proibidos:**

- Mobile immersive, `operations-board.tsx`, `globals.scss`, `messages/**` (preferir adiar i18n ao V2.3)

**Critério de saída (go/no-go para V2.3):**

- `npm run build` passa
- Critérios ADR 0030 seção "Critérios para avançar ao spike" atendidos
- Relatório de bundle e nota SSR/client

**Validação:** lint, typecheck, build.

---

### V2.2 — GeoJSON mock determinístico + adapter

**Objetivo:** dados geográficos fictícios versionados e adapter único Cargo → geometria.

**Entregas:**

- `src/features/waterway-map/data/*.mock.geojson`
- `cargo-to-hydroway-geo.adapter.ts`
- Testes unitários (CARGO-001/002/004, ids desconhecidos)
- Integração com metadados `waterway-tracking` (corridorId, constraints)

**Fora de escopo:** substituir canvas em produção; dados oficiais.

**Critério de saída:** testes unitários verdes; tamanho mock dentro do budget ADR 0031.

**Validação:** lint, typecheck, `npm test` (unit do adapter).

---

### V2.3 — Integração em `/[locale]/cargas/[id]/mapa`

**Objetivo:** MapLibre como render principal na rota expanded; fallback SVG; feature flag.

**Entregas:**

- `desktop-cargo-map-expanded-page` compõe `HydrowayMapShell`
- `dynamic(..., { ssr: false })` para canvas MapLibre
- Flag `hydrowayMapLibreEnabled` (default false até QA)
- i18n pt-BR, en-US, es para erros/camadas/controles
- CARGO-001/002/004 coerentes

**Fora de escopo:** cockpit compact; mobile.

**Critério de saída:** checklist visual playbook (sem lacunas laterais em zoom típico); cockpit e mobile intactos em teste manual.

**Validação:** lint, typecheck, check:i18n, test, test:mock-mode, build.

---

### V2.4 — Header, HUD e rail profissionais

**Objetivo:** chrome operacional de valor (corredor, trecho, ETA, sinal, progresso) sem bloquear rota.

**Entregas:**

- Header compacto: voltar → `/<locale>/cargas`, id, status, nome do corredor
- HUD leve (chips colapsáveis)
- Rail lateral **opcional** se agregar camadas (ETA, hidrovia, documentos) — não obrigatório na primeira entrega V2.4
- Reduzir duplicação com lista de cargas

**Critério de saída:** primeira impressão "cabine operacional"; HUD não cobre origem/destino/embarcação.

**Validação:** lint, typecheck, check:i18n, teste manual 3 cargas × 3 locales.

---

### V2.5 — Camadas operacionais e a11y

**Objetivo:** profundidade operacional e conformidade [ADR 0010](../adr/0010-map-accessibility-and-alternative-route-summary.md).

**Entregas:**

- Legenda / toggle de camadas (rios, corredor, portos, rota)
- Resumo textual da rota (lista de trechos, ETA, status) sempre disponível
- Indicadores mock: risco navegabilidade, conectividade
- `prefers-reduced-motion` em animações de rota/embarcação

**Fora de escopo:** telemetria real; AIS.

**Validação:** lint, typecheck, check:i18n, testes a11y manuais, `npm test`.

---

### V2.6 — Pipeline shapefile oficial e feature flag

**Objetivo:** caminho para dados DNIT/BIT sem bloquear releases anteriores.

**Entregas:**

- `scripts/geo/` documentados (ogr2ogr, simplify, tippecanoe opcional)
- `docs/geo/DATA-SOURCES.md` (licenças, versões, atribuição)
- Flag `hydrowayOfficialGeodataEnabled` (default false)
- Processo de atualização trimestral documentado

**Critério de saída:** conversão offline reproduzível; flag off mantém mock; flag on passa checklist legal mínimo.

**Validação:** lint, typecheck, testes de adapter com fixture oficial reduzida (se commitada).

---

## Mapa de fases × To-dos

| To-do | Fase |
|-------|------|
| ADR 0030 / 0031 | V2.0 |
| Spike MapLibre | V2.1 |
| GeoJSON mock + adapter | V2.2 |
| Integração `/mapa` | V2.3 |
| Header/HUD/rail | V2.4 |
| Camadas + a11y | V2.5 |
| Shapefile oficial + flag | V2.6 |

## Arquivos proibidos (todas as fases até V2.3)

- `src/app/globals.scss`
- `next-env.d.ts`
- Componentes mobile em `src/app/[locale]/cargas/[id]/mapa/` e `src/features/waterway-map/components/mobile/`
- Auth, mocks globais fora do escopo
- `package.json` antes de V2.0 aceito e início de V2.1

## Riscos consolidados

Ver ADRs 0030 e 0031. Principal: bundle, WebGL, regressão cockpit/mobile, overengineering — mitigar com spike, flags e escopo por fase.

## Próximo passo recomendado

1. Revisar e marcar ADR 0030/0031 como **Aceito** após feedback do time.
2. Executar **V2.1 spike** em branch dedicada com prompt isolado (sem commit automático até validação visual).
3. Não iniciar V2.2 em paralelo ao spike.

## Prompt sugerido — spike (V2.1)

Ver seção "Critérios para avançar ao spike" em [ADR 0030](../adr/0030-professional-hydroway-map-provider.md).
