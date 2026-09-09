# ADR 0031 — Pipeline geográfico do mapa hidroviário (GeoJSON mock → dados oficiais)

## Status

Accepted for spike (V2.1a — 2026-05-18)

Aceitação limitada ao **estágio 1 (GeoJSON mock/local)** para o spike MapLibre e fases V2.1–V2.2. Estágios 2 (shapefile → GeoJSON/PMTiles) e 3 (BIT/GeoTransportes/DNIT) permanecem **planejados**, não autorizados nesta microfase.

## Aceitação e escopo (V2.1a)

| Escopo | V2.1a / spike (V2.1) | Futuro (não nesta microfase) |
|--------|----------------------|------------------------------|
| GeoJSON mock/local, fictício e determinístico | **Sim** ([ADR 0029](./0029-mock-data-fictional-deterministic.md)) | — |
| Shapefile oficial, conversão offline, `scripts/geo/` | **Não** | V2.6+ |
| BIT / GeoTransportes / DNIT em runtime ou repo | **Não** | Estágio 3; flag `hydrowayOfficialGeodataEnabled` |
| Dados governamentais reais no repositório ou build | **Não** | Após checklist legal e `docs/geo/DATA-SOURCES.md` |

**V2.1 (spike):** usar GeoJSON mock mínimo (inline na branch de spike ou artefato local temporário). Nenhum dado oficial será incorporado, convertido ou publicado nesta microfase.

O pipeline completo (estágios 2–3) e a flag `hydrowayOfficialGeodataEnabled` seguem documentados abaixo como **decisão de direção**, com implementação reservada a fases posteriores (V2.2 commit de mocks versionados; V2.6 dados oficiais).

## Contexto

O mapa hidroviário V2 ([ADR 0030](./0030-professional-hydroway-map-provider.md)) depende de geometria navegável credível: rios principais, afluentes, corredores classificados (HN-100 Amazonas-Solimões, Madeira, Tapajós, Tocantins-Araguaia, Barra Norte), portos interiores, terminais e rota de carga por trecho.

Hoje o repositório **não contém GeoJSON** nem shapefiles. Geometria está embutida em paths SVG e tabelas de coordenadas esquemáticas duplicadas entre cockpit, desktop expanded e mobile. O domínio `waterway-tracking` já modela corredores, segmentos e constraints em TypeScript, mas **sem geometria** para render.

Fontes oficiais futuras (referência de planejamento; não validadas neste ADR):

- [Atlas Aquaviário — DNIT](https://www.gov.br/dnit/pt-br/assuntos/aquaviario/atlas-aquaviario/AtlasAquaviarioJaneio2026.pdf)
- [BIT / GeoTransportes — Ministério dos Transportes](https://www.gov.br/transportes/pt-br/assuntos/dados-de-transportes/bit/bit-mapas)
- Camadas de hidrovias navegadas, portos organizados e infraestrutura portuária

Requisitos do projeto:

- dados mock **fictícios e determinísticos** ([ADR 0029](./0029-mock-data-fictional-deterministic.md));
- sem PII em artefatos versionados;
- shapefiles **não** parseados no browser;
- performance e bundle controlados ([ADR 0011](./0011-code-quality-and-performance-guidelines.md)).

## Decisão

Estabelecer um pipeline geográfico em **três estágios**, com feature flags independentes do provider de render.

### Estágio 1 — GeoJSON mock local (V2.2)

Artefatos versionados em:

```text
src/features/waterway-map/data/
  amazon-main-rivers.mock.geojson
  amazon-navigable-corridors.mock.geojson
  amazon-ports-terminals.mock.geojson
  cargo-routes.mock.geojson          # rotas por cargo/corredor (determinístico)
```

Regras:

- Coordenadas em WGS84 (`EPSG:4326`); valores **fictícios porém plausíveis** para a região Amazônica (não copiar shapefiles oficiais byte a byte na fase mock).
- Nomenclatura alinhada à taxonomia operacional (`WaterwayCorridorId`, labels de referência em `waterway-corridors.mock.ts`).
- Propriedades mínimas por feature: `id`, `name`, `kind` (`river` | `tributary` | `corridor` | `port` | `terminal` | `route`), `corridorId` quando aplicável.
- Geração determinística: sem aleatoriedade em build; seeds fixos para QA (`CARGO-001`, `CARGO-002`, `CARGO-004`).
- Tamanho alvo: **≤ 200 KB** por arquivo GeoJSON não comprimido na v1 mock; simplificar geometria (Douglas-Peucker ou pré-processamento offline) se exceder.

Adapter único:

```text
src/features/waterway-map/adapters/
  cargo-to-hydroway-geo.adapter.ts   # Cargo + waterway-tracking → sources MapLibre/SVG
  geojson-sources.ts                 # ids de source/layer estáveis
```

### Estágio 2 — Conversão shapefile → GeoJSON / vector tiles (V2.6)

Processamento **offline** apenas (CI, script local ou job de release):

```text
scripts/geo/
  import-official-hydrography.mjs    # documentado; não executado no client
  simplify-geojson.mjs
```

- Entrada: shapefile oficial obtido sob licença documentada (fora do repo ou em artefato de build privado).
- Ferramentas aceitas: `ogr2ogr` (GDAL), QGIS export, ou `tippecanoe` para **PMTiles** / MBTiles se GeoJSON total > budget.
- Saída versionada ou publicada em CDN interna: `geo/hidrovias-navegadas.{geojson|pmtiles}`.
- **Nunca** commitar shapefiles binários grandes no repositório principal sem política de LFS e revisão legal.

Vector tiles (opcional): adotar se GeoJSON simplificado ainda exceder **500 KB** combinados na rota `/mapa` ou se performance de pan/zoom degradar.

### Estágio 3 — Integração BIT / GeoTransportes / DNIT (futuro, feature flag)

Feature flag sugerida: `hydrowayOfficialGeodataEnabled` (default `false`).

| Flag | Fonte |
|------|--------|
| `false` | GeoJSON mock local (estágio 1) |
| `true` | Artefatos convertidos do estágio 2, com metadados de versão e data de corte |

Requisitos para ativar em produção:

- Registro de licença/atribuição e data do snapshot em `docs/geo/DATA-SOURCES.md` (criar na fase V2.6).
- Checklist legal: uso permitido em app comercial, obrigação de atribuição, restrições de derivação.
- Versionamento semântico dos datasets (`hydrography@2026.01.0`).

### Camadas de dados (taxonomia)

| Camada | Conteúdo | Estágio |
|--------|----------|---------|
| `waterway-main` | Rio Amazonas, Solimões, eixos largos | Mock → oficial |
| `waterway-tributary` | Madeira, Tapajós, Tocantins, afluentes | Mock → oficial |
| `navigable-corridor` | Hidrovias classificadas (HN-100, etc.) | Mock → oficial |
| `ports-interior` | Portos interiores | Mock → oficial |
| `terminals` | Terminais de carga/transbordo | Mock → oficial |
| `cargo-route` | Linha de rota da carga ativa | Adapter por `cargo.id` |
| `vessel-position` | Ponto + heading (mock determinístico) | Adapter |
| `origin` / `destination` | Pontos de extremidade | Adapter |
| `operational-risk` (futuro) | Polígonos de estiagem/calado | Estágio 3+ |

### Fallback determinístico

Ordem de resolução de geometria:

1. GeoJSON mock local (sempre disponível em dev e produção inicial).
2. Se flag oficial ligada e fetch falhar → **degradar para mock** + log dev; nunca tela vazia.
3. Se MapLibre falhar ([ADR 0030](./0030-professional-hydroway-map-provider.md)) → SVG schematic com mesma semântica de origem/destino/rota via adapter compartilhado (coords podem permanecer esquemáticas no fallback até unificação).

Hashes de fallback para localidades desconhecidas: manter algoritmo determinístico existente em `desktop-cargo-map.helpers.ts` até adapter unificado substituir.

### Estratégia de atualização

| Tipo | Frequência | Responsável |
|------|------------|-------------|
| Mock GeoJSON | A cada PR de produto que altere corredores/cargas demo | Engenharia |
| Snapshot oficial | Trimestral ou quando DNIT/BIT publicar revisão | Engenharia + produto |
| Hotfix de geometria | Sob demanda (incidente operacional) | Engenharia |

Processo:

1. Baixar fonte oficial em ambiente controlado.
2. Converter e simplificar offline.
3. Validar tamanho, bbox e contagem de features.
4. Atualizar `DATA-SOURCES.md` com versão e changelog.
5. Testes unitários de adapter + smoke visual em `/mapa`.

## Consequências

### Positivas

- Uma fonte de geometria por estágio, consumida por MapLibre e SVG fallback.
- Caminho claro para dados governamentais sem refatorar UI.
- Mocks determinísticos preservam QA e testes ([ADR 0029](./0029-mock-data-fictional-deterministic.md)).
- Shapefiles pesados ficam fora do runtime do browser.

### Negativas / trade-offs

- Manutenção de artefatos GeoJSON e scripts de conversão.
- Risco de dessincronia entre metadados (`waterway-tracking`) e geometria se não houver adapter único.
- Dados oficiais podem exigir atribuição visível no mapa.
- Simplificação agressiva pode reduzir fidelidade visual em zoom alto.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Peso / LCP | Simplificação; vector tiles; lazy load por corrida; budget ADR 0030 |
| Licença de dados governamentais | `DATA-SOURCES.md`; flag desligada até revisão; atribuição na UI |
| Geometria incorreta em produção | Flag oficial off por default; mock como baseline; testes de bbox |
| Performance MapLibre com muitas features | `maxzoom` por layer; filter por `corridorId`; clustering em portos |
| Cópia inadvertida de dados restritos | Mock fictício explícito; revisão de PR para arquivos `data/` |

## Alternativas consideradas

### Manter apenas coordenadas esquemáticas em TypeScript

**Rejeitada** como estratégia principal.

- Impede reutilização de fontes oficiais e triplica manutenção.

### Parse de shapefile no browser

**Rejeitada.**

- Bundle, memória e complexidade; conversão offline é padrão da indústria.

### Baixar GeoJSON do BIT em runtime sem versionamento

**Rejeitada.**

- Dependência de rede, licença incerta em CI, não determinístico para testes.

## Critérios de aceite do estágio 1 (V2.2)

- Arquivos mock GeoJSON commitados e referenciados pelo adapter.
- `CARGO-001`, `CARGO-002`, `CARGO-004` produzem rotas distintas e determinísticas.
- Testes unitários do adapter sem dependência de MapLibre.
- Tamanho combinado mock ≤ 500 KB ou plano de tiles documentado.

## Links relacionados

- [ADR 0030 — Provider MapLibre + SVG](./0030-professional-hydroway-map-provider.md)
- [ADR 0029 — Mocks determinísticos](./0029-mock-data-fictional-deterministic.md)
- [ADR 0013 — Feature mocks](./0013-feature-mocks-and-business-scope.md)
- [Plano V2](../workflows/professional-hydroway-map-v2-plan.md)
- Domínio existente: `src/features/waterway-tracking/`

## Data

2026-05-18

## Responsáveis

HydroRivers frontend/product team
