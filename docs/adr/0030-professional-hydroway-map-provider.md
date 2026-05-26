# ADR 0030 — Provider profissional do mapa hidroviário (MapLibre + fallback SVG)

## Status

Accepted (V2.1a — 2026-05-18)

## Aceitação e escopo (V2.1a)

Esta aceitação **autoriza apenas** o próximo spike técnico **isolado** com MapLibre (microfases V2.1b–V2.1c e critérios abaixo). Não autoriza, por si só, instalação de dependências, alteração de `src/` nem deploy na rota de produção.

| Item | V2.1a (esta aceitação) | Próximas microfases |
|------|------------------------|---------------------|
| Decisão de provider MapLibre + fallback SVG | **Aceita** | — |
| `npm install maplibre-gl` | **Não** | **V2.1c** (após spike isolado aprovado) |
| `src/features/waterway-map/` | **Não** | V2.1b–V2.1c (spike) |
| Rota `/<locale>/cargas/[id]/mapa` | **Mantém SVG foundation** | Substituição/integração MapLibre apenas em **V2.3** |
| Cockpit `/<locale>/cargas` | **Intocado** | Fase futura própria |
| Mobile mapa (`/mapa`) | **MapLibre** | Integrado em V2.3+ |

**Rollback:** o fallback **SVG foundation** (`desktop-cargo-map/`) permanece plano de rollback obrigatório — feature flag `hydrowayMapLibreEnabled`, falha de WebGL ou timeout revertem para SVG sem redeploy de geometria.

## Contexto

O HydroRivers possui três superfícies de mapa esquemático em SVG custom, sem motor geográfico compartilhado:

- **Cockpit desktop** (`/<locale>/cargas`) — mapa compacto integrado à lista (`HydroRouteTrackingMapSvg`);
- **Desktop expanded** (`/<locale>/cargas/[id]/mapa`) — foundation com câmera SVG `viewBox`, pan/zoom e rota por curva Bézier entre coordenadas artificiais ([ADR 0001-desktop-expanded-map-route](./0001-desktop-expanded-map-route.md));
- **Mobile mapa oficial** (`/<locale>/cargas/[id]/mapa`) — MapLibre via `MobileHydrowayMapExperience` (legado `?view=visao-geral` removido).

A foundation do desktop expanded validou rota, i18n, interação básica e URL compartilhável, mas **não atende** ao objetivo de produto de mapa hidroviário profissional: zoom revela lacunas, pan perde contexto, basemap é grid + tubos estilizados, e não há pipeline GeoJSON nem continuidade geográfica.

O produto trata o mapa como **core operacional** (corredores amazônicos, rios, afluentes, portos/terminais, rota, embarcação, ETA, sinal, riscos futuros). Continuar a investir em SVG custom como motor principal tem retorno decrescente frente a requisitos de LOD, dados oficiais e câmera contínua.

Regras do projeto aplicáveis:

- dependência nova exige ADR e justificativa ([AGENTS.md](../../AGENTS.md));
- desktop e mobile são experiências separadas;
- mapas pesados são candidatos a lazy loading ([ADR 0011](./0011-code-quality-and-performance-guidelines.md));
- mocks determinísticos ([ADR 0029](./0029-mock-data-fictional-deterministic.md));
- mapa visual com alternativa textual ([ADR 0010](./0010-map-accessibility-and-alternative-route-summary.md)).

## Decisão

Adotar **MapLibre GL JS** como provider principal do mapa hidroviário desktop expanded (V2), com **fallback automático** para a implementação SVG foundation existente em `desktop-cargo-map/`.

### Arquitetura de provider

- Interface `HydrowayMapProvider` (mount, setCamera, fitBounds, setLayers, destroy).
- Implementação primária: `MapLibreHydrowayProvider` (client-only).
- Implementação de fallback: `SvgSchematicHydrowayProvider` (reutiliza canvas/helpers/câmera atuais).
- Seleção em runtime:
  1. feature flag desliga MapLibre → SVG;
  2. WebGL indisponível ou erro de inicialização → SVG;
  3. timeout de carga do provider (budget configurável) → SVG.

### Feature flag

Nome sugerido: `hydrowayMapLibreEnabled` (env ou mock config dev-only na fase inicial).

| Valor | Comportamento |
|-------|----------------|
| `false` (default até spike aprovado) | SVG foundation apenas |
| `true` | tenta MapLibre; fallback SVG em falha |

A flag permite QA comparativo, rollback instantâneo e deploy gradual sem remover a foundation.

### Client boundary (Next.js 16 App Router)

- `src/app/[locale]/cargas/[id]/mapa/page.tsx` permanece **RSC fino** (locale, `getCargoById`, `notFound`).
- Motor de mapa em componente client dedicado, carregado via `next/dynamic` com `{ ssr: false }`.
- Nenhum import de `maplibre-gl` em Server Components, layouts ou módulos avaliados no servidor.
- Estilos MapLibre importados apenas no chunk client do provider.

### Bundle budget

Orçamento aceitável para a rota `/mapa` (gzip, adicional ao baseline atual):

| Item | Budget máximo |
|------|----------------|
| `maplibre-gl` (lib + worker) | **≤ 350 KB gzip** no chunk da rota |
| Código do provider + adapters | **≤ 40 KB gzip** |
| GeoJSON mock inicial (por corrida) | **≤ 200 KB** não comprimido por conjunto; preferir simplificação |

Medição obrigatória no spike (V2.1) com `npm run build` e análise do chunk antes de integrar em produção (V2.3). Se exceder 350 KB gzip da lib, reavaliar Leaflet ou vector tiles externos antes de merge.

### Escopo (dentro desta decisão)

- Provider e integração na rota `/<locale>/cargas/[id]/mapa`.
- Módulo de feature sugerido: `src/features/waterway-map/` (UI + adapters; ver [plano V2](../workflows/professional-hydroway-map-v2-plan.md)).
- GeoJSON mock local (detalhado em [ADR 0031](./0031-hydroway-geodata-pipeline.md)).
- Reuso de domínio `waterway-tracking` para metadados de corredor, risco e constraints (sem geometria duplicada em três tabelas de coords).
- Fallback SVG foundation preservado e testado.
- i18n para strings de camadas, erros de fallback e controles novos.

### Fora de escopo (nesta decisão)

- Substituir mapa **cockpit compact** em `/<locale>/cargas` (fase futura própria).
- Alterar **mobile immersive** ou bottom sheet ([ADR mobile](./ADR-mobile-bottom-sheet-and-map-pattern.md)).
- Instalar Mapbox GL ou Google Maps JavaScript API.
- Parser de shapefile no browser.
- Dados oficiais DNIT/BIT em produção (ver ADR 0031; feature flag separada).
- Remover `AdminChrome` / sidebar na rota expanded (ADR futuro opcional).

## Comparação de providers

| Critério | SVG custom (atual) | MapLibre GL JS | Leaflet | Mapbox GL | Google Maps JS |
|----------|-------------------|----------------|---------|-----------|----------------|
| Adequação hidroviário profissional | Baixa — arte manual | **Alta** | Média | Alta | Baixa-média |
| GeoJSON / camadas vetoriais | Manual (`path d`) | Nativo | `L.geoJSON` + plugins | Nativo | Limitado |
| Câmera pan/zoom/fit | Simulada; mundo finito 1600×900 | Profissional; bounds | Boa | Profissional | Excelente |
| Estilo HydroRivers dark | Total | Style JSON custom | Tiles + CSS | Style JSON | Limitado |
| Licença | — | **BSD-3** (lib) | BSD-2 | Comercial | Comercial |
| Custo operacional | Zero | Tiles OSS + atribuição | Idem | Token + billing | API key + billing |
| Vendor lock-in | Nenhum | **Baixo** | Baixo | Alto | Alto |
| Bundle (ordem de grandeza) | Já no app | **~250–350 KB gzip** | ~40 KB + tiles | Similar MapLibre | Script externo |
| SSR / App Router | SVG client ok | **dynamic ssr:false** | Idem | Idem | Idem |
| WebGL fallback | N/A | **Requer SVG fallback** | Degrada melhor sem WebGL | Idem | N/A |

### Alternativas consideradas

#### A. Continuar SVG custom como motor principal

**Rejeitada** para V2.

- Não elimina lacunas de zoom/pan sem expandir mundo artificialmente sem fim.
- Cada corredor/rio/porto exige desenho manual e manutenção triplicada (cockpit, expanded, mobile).
- Não escala para shapefiles oficiais nem LOD.

**Mantida** como fallback e modo demo offline.

#### B. MapLibre GL JS (escolhida)

**Aceita** como provider principal.

- Open source, API próxima ao ecossistema Mapbox sem lock-in de runtime.
- GeoJSON, expressions, symbol layers adequados a hidrovias, portos e rota animada.
- Câmera contínua alinhada à referência de interação tipo Maps (sem copiar visual Google).

#### C. Leaflet

**Plano B** se spike MapLibre falhar critérios de bundle ou WebGL.

- MVP geográfico mais rápido e bundle menor.
- Múltiplas camadas vetoriais complexas e estilo premium exigem plugins; experiência menos “cockpit GIS”.

#### D. Mapbox GL

**Adiada / rejeitada para V2.**

- Qualidade excelente, porém custo, token obrigatório e lock-in.
- MapLibre cobre o mesmo perfil técnico com licença mais favorável.

#### E. Google Maps JavaScript API

**Rejeitada para V2.**

- UX genérica; pouco controle de camadas hidroviárias proprietárias.
- Conflito com identidade visual HydroRivers; custo e termos restritivos.

#### F. Híbrido (SVG fallback + provider real)

**Adotada como estratégia de entrega.**

- MapLibre no caminho feliz; SVG foundation em falha ou flag desligada.
- Reduz risco de regressão e permite rollback sem redeploy de geometria.

## Consequências

### Positivas

- Mapa expanded passa a ter continuidade geográfica e base para dados oficiais.
- Fallback SVG garante disponibilidade em ambientes restritos (WebGL, CI headless para smoke).
- Feature flag permite validação incremental e comparação A/B interna.
- Separação clara: `app/` fino, `features/waterway-map/` rico, domínio em `waterway-tracking`.

### Negativas / trade-offs

- Nova dependência `maplibre-gl` somente a partir da **V2.1c**, após spike isolado bem-sucedido (aceitação V2.1a não instala pacotes).
- Aumento de bundle na rota `/mapa`; exige lazy load disciplinado.
- Duplicação temporária de código (MapLibre + SVG) até deprecação controlada do fallback.
- Curva de aprendizado (style JSON, sources, layers).
- Três superfícies de mapa coexistem até fases futuras de unificação de dados (não de UI).

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Bundle acima do budget | Medir no spike; dynamic import; não importar MapLibre no cockpit/mobile |
| WebGL indisponível | Fallback SVG automático + mensagem i18n discreta |
| Regressão cockpit/mobile | Escopo fechado em `/mapa`; CI grep / revisão de imports |
| Hidratação | Mapa 100% client; sem `Date.now`/`Math.random` em render do shell |
| Overengineering | Spike isolado (V2.1) antes de V2.3; uma rota piloto |
| Lock-in de tiles | Documentar provedor OSS e atribuição; camadas hidroviárias em GeoJSON próprio |

## Critérios para avançar ao spike (V2.1b–V2.1c)

**V2.1a (concluída):** ADR 0030 e [ADR 0031](./0031-hydroway-geodata-pipeline.md) aceitos; sem alteração em `src/`, `messages/` ou `package.json`.

**Antes de `npm install maplibre-gl` (V2.1c apenas):**

1. ~~Este ADR (0030) revisado e aceito pelo time.~~ ✓ V2.1a
2. ~~[ADR 0031](./0031-hydroway-geodata-pipeline.md) aceito para spike (GeoJSON mock/local).~~ ✓ V2.1a
3. Branch de spike dedicada (`spike/maplibre-hydroway`), não misturada com outras features.
4. Lista de arquivos permitidos/proibidos definida (sem `src` mobile, sem `operations-board` cockpit; **sem** substituir `/<locale>/cargas/[id]/mapa` até V2.3).
5. Critérios de saída do spike documentados:
   - basemap escuro renderiza em rota dev isolada **ou** `/mapa` atrás de flag (integração em produção só V2.3);
   - pan, zoom, `fitBounds` funcionam;
   - 1 GeoJSON de rio mock + linha de rota;
   - fallback SVG acionado quando WebGL falha;
   - `npm run build` passa;
   - chunk gzip da lib ≤ 350 KB ou relatório de exceção com plano B (Leaflet).

## Links relacionados

- [ADR 0001 — Rota desktop expanded](./0001-desktop-expanded-map-route.md)
- [ADR 0031 — Pipeline geográfico](./0031-hydroway-geodata-pipeline.md)
- [ADR 0010 — Mapa com alternativa textual](./0010-map-accessibility-and-alternative-route-summary.md)
- [Plano V2](../workflows/professional-hydroway-map-v2-plan.md)
- [Playbook desktop expanded](../workflows/desktop-expanded-map-playbook.md)
- [Workflow iteração visual](../workflows/codex-visual-iteration.md)

## Data

2026-05-18

## Responsáveis

HydroRivers frontend/product team
