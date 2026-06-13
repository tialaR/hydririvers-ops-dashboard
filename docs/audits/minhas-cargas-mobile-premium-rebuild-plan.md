# Minhas Cargas — Auditoria e plano de reconstrução mobile premium

| Metadado | Valor |
|----------|-------|
| **Status** | Fase A implementada (P0 navegação, auth, contraste, padding) — 2026-06-12; **Fase B implementada** (owned-cargo-summary + owned-cargo-card + integração MyCargoesList) — 2026-06-12; **Fase C implementada** (owned-cargo-detail cockpit + preview grid 2×2) — 2026-06-12; **Fase D implementada** (status card 1×1, support cards, sheets map/timeline/documents/risks + panel state local) — 2026-06-12; **Fase E implementada** (`?panel=` URL sync + replace/back) — 2026-06-12; **Fase F concluída** (QA visual 3 device presets + hardening check, sem redesign) — 2026-06-12 |
| **Data** | 2026-06-12 |
| **Rota** | `/[locale]/minhas-cargas`, `/[locale]/minhas-cargas/[id]` |
| **Fluxos aprovados** | [`minhas-cargas-fluxo-embarcador.md`](../product/flows/minhas-cargas-fluxo-embarcador.md), [`minhas-cargas-fluxo-tecnico-embarcador.md`](../product/flows/minhas-cargas-fluxo-tecnico-embarcador.md) |
| **Evidência visual** | Screenshots QA 2026-06-11/12 em `output/` e assets de sessão |

---

## 1. Regra de QA — viewports e devices

| Modo | Dimensão | Uso |
|------|----------|-----|
| **Responsive manual** | 390×844, 360×740, 430×932 | Exploração rápida — registrar como *viewport responsivo manual* |
| **Device preset nomeado** | iPhone SE / iPhone 14 / iPhone 14 Pro Max | **Validação oficial** — preferir sempre que possível |

**Diferenças práticas:** presets aplicam DPR, safe-area, font scaling e UA coerentes; Responsive manual pode mascarar overlap de BottomNav, safe-area e densidade real.

**Validação oficial (3 larguras):**

| Tier | Preset / tamanho |
|------|------------------|
| compact | iPhone SE ou 360×740 |
| standard | iPhone 14 ou 390×844 |
| large | iPhone 14 Pro Max ou 430×932 |

Screenshots obrigatórios por device na Fase F.

---

## 2. Diagnóstico visual por problema (evidência → causa → fase)

| # | Evidência | Causa provável | Risco UX | Pri | Fase |
|---|-----------|----------------|----------|-----|------|
| 1 | Header mobile mostra **Dashboard** em lista/detalhe de Minhas cargas | `resolveMobilePageTitleKey` não cobre `/minhas-cargas/[id]`; fallback `nav.dashboard` (L111) | Usuário perde contexto operacional | **P0** | A |
| 2 | Ghosting (“2 propostas”, “Em trânsito”, “Ver rota completa” atrás do título) | Header glass semi-transparente + troca de rota sem suspense/loading dedicado; possível overlap scroll + título anterior | Confiança, sensação de bug | **P0** | A |
| 3 | Labels/subtextos quase invisíveis (Volume, Janela, Alvo, chips, BottomNav) | `color-mix`/`surface-glass` + `--muted` sobre fundo claro; glass sem contraste mínimo | A11y, tarefas impossíveis | **P0** | A |
| 4 | Cards de lista enormes e densos | Reuso de `CargoCard` marketplace (`variant="myCargos"`) — mesma árvore visual pública | Scroll excessivo, não premium | **P1** | B |
| 5 | Detalhe parece marketplace/dashboard | `CargoDetail` + `CargoDetailLoader` compartilhados com `/cargas`; hero, specs, proposta | Área privada indistinguível | **P1** | C |
| 6 | Detalhe longo, scroll infinito | Monólito vertical: hero + assistant + docs + riscos inline | Cognição alta, cockpit ausente | **P1** | C |
| 7 | Mapa abre; Timeline/Docs/Riscos não claros | Mapa via rota pública `/cargas/[id]/mapa`; sem timeline no detalhe; docs/riscos enterrados | Fluxo aprovado incompleto | **P1** | C–D |
| 8 | BottomNav sobrepõe conteúdo | `MyCargoesList`/breadcrumb sem `padding-bottom` bottom-nav; nav não mapeia `/minhas-cargas` | CTAs e últimos cards ocultos | **P1** | A + B |
| 9 | Botão M sobre conteúdo | Mock QA assistant (dev) — considerar no QA, não redesenhar | Ruído em QA | **P2** | F (nota) |
| 10 | Login: Continue/helper text baixo contraste | Auth form glass/disabled styling | Bloqueio de entrada mock | **P0** | A (auth) |

---

## 3. Arquitetura atual (gap vs fluxo aprovado)

| Camada | Atual | Gap |
|--------|-------|-----|
| Lista | `MyCargoesList` + `CargoCard variant="myCargos"` | Card público adaptado, não owned premium |
| Resumo | 4 cards empilhados (1 col mobile) | Ocupa >50% viewport |
| Detalhe | `CargoDetailLoader` → `CargoDetail` (marketplace) | Sem grid 2×2, sem timeline, mapa público |
| Mobile title | Fallback Dashboard em subrotas privadas | Bug confirmado em código |
| BottomNav active | `minhas-cargas` não mapeado → `overview` | Tab errada ativa |
| BottomSheet | Global existe; usado em `/cargas` mobile | Não usado em minhas-cargas |
| Referência positiva | `public-cargas-mobile-list` + sheets | Padrão a espelhar para privado |

**Separação confirmada:** `/cargas` = vitrine; `/minhas-cargas` = operação privada (`owned-cargos.mock`, tier `owner`). UI atual viola separação visual.

---

## 4. Proposta — lista premium

Novo **`owned-cargo-card`** (`src/features/cargo/components/owned-cargo-card/`):

- Altura ~40–50% do card marketplace atual
- Linha 1: status pill + alerta/pendência (se houver)
- Linha 2: título curto (1 linha) + tipo/temperatura
- Linha 3: origem → destino compacto
- Linha 4: micro-barra progresso documental ou trajeto
- Linha 5: próximo passo (1 frase) + chevron discreto
- Superfície sólida (`--hy-owned-cargo-card-surface`), sem hero/route card interno
- CTA: tap no card → detalhe; sem botões marketplace

**Resumo operacional:** `owned-cargo-summary` — grid 2×2 compacto no mobile (não 4 cards empilhados).

---

## 5. Proposta — detalhe mobile (cockpit)

Novo **`owned-cargo-detail`** — composição:

1. Header carga: ID, status, título, rota one-liner
2. Resumo operacional: 3–4 métricas chave (progresso, janela, propostas, pendência doc)
3. **`owned-cargo-preview-grid`** 2×2:
   - Mapa — mini mapa estático ou último marco + % trajeto
   - Timeline — último evento + contagem
   - Documentos — % readiness + doc pendente top
   - Riscos — contagem alertas + severidade top
4. Ações primárias fixas (acompanhar, negociar, atualizar status) — fora dos sheets
5. Sem hero image fullscreen, sem form de proposta carrier

Cada preview → **`owned-cargo-*-sheet`** via BottomSheet global.

---

## 6. URL / panel (recomendação)

**Preferir `searchParams` na mesma rota** — mais simples e compatível com mock-mode:

```
/minhas-cargas/[id]?panel=map|timeline|documents|risks
```

- Client wrapper `owned-cargo-detail-shell` lê `panel`, abre/fecha sheet
- `router.replace` ao abrir/fechar (shallow) — URL compartilhável, back fecha sheet
- **Não** usar intercepting/parallel routes na v1 (custo > benefício)
- Mapa full-screen: manter rota dedicada opcional `/minhas-cargas/[id]/mapa` ou sheet expanded snap — avaliar na Fase D; fluxo aprovado aceita sheet

Adicionar em `route-search-params.ts`: `panel` enum validado.

---

## 7. Componentes (feature boundary)

| Componente | Escopo | Reuso |
|------------|--------|-------|
| `owned-cargo-card` | feature cargo | novo |
| `owned-cargo-summary` | feature cargo | novo |
| `owned-cargo-detail` | feature cargo | novo |
| `owned-cargo-preview-grid` | feature cargo | novo |
| `owned-cargo-preview-card` | feature cargo | novo |
| `owned-cargo-map-sheet` | feature cargo | BottomSheet shared |
| `owned-cargo-timeline-sheet` | feature cargo | BottomSheet shared |
| `owned-cargo-documents-sheet` | feature cargo | BottomSheet shared |
| `owned-cargo-risks-sheet` | feature cargo | BottomSheet shared |
| `owned-cargo-detail-shell` | feature cargo | URL/panel state |

**Shared:** apenas `BottomSheet`, `IconButton`, tokens globais — não mover cards owned para shared.

**Manter sem alterar:** `CargoCard`, `CargoDetail` para `/cargas`.

---

## 8. Tokens propostos (`--hy-*`)

- `--hy-owned-cargo-card-height-compact`
- `--hy-owned-cargo-card-radius`
- `--hy-owned-cargo-card-surface` / `-border` / `-shadow`
- `--hy-owned-cargo-summary-grid-gap`
- `--hy-owned-cargo-summary-metric-size`
- `--hy-owned-cargo-detail-header-gap`
- `--hy-owned-cargo-preview-grid-gap`
- `--hy-owned-cargo-preview-card-min-height`
- `--hy-owned-cargo-preview-card-surface`
- `--hy-owned-cargo-sheet-snap-mid` / `-max`
- `--hy-owned-cargo-progress-track-height`
- `--hy-owned-cargo-label-color` (contraste mínimo WCAG AA)
- `--hy-owned-cargo-muted-color`
- `--hy-owned-cargo-motion-duration-press`

---

## 9. i18n — namespaces sugeridos

`pages.minhasCargas` (estender):

- route: title, subtitle, breadcrumb
- summary: active, proposals, pending, transit + hints compactos
- card: status, nextStep, alert, progress, viewDetail
- detail: header, operationalSummary, actions
- preview: map, timeline, documents, risks — title, previewFallback
- sheets: titles, close, loading
- empty/error: noCargoes, noDocuments, noRisks, noTimeline, mapUnavailable, unauthorized, roleIncompatible
- CTAs: completeRegistration, negotiate, track, updateStatus

---

## 10. Estados obrigatórios

loading (lista + detalhe), empty carteira, error serviço, not found, no documents, no risks, no timeline, map unavailable, unauthorized, owner vs carrier copy, action submitted success.

---

## 11. Fases de implementação

| Fase | Escopo | Prioridade |
|------|--------|------------|
| **A** | P0: title resolver minhas-cargas, bottom-nav mapping, contraste glass, auth login contrast, padding bottom-nav lista, reduzir ghost (loading/suspense) | P0 |
| **B** | `owned-cargo-summary` + `owned-cargo-card` + integrar em `MyCargoesList` mobile | P1 | **Concluída 2026-06-12** |
| **C** | `owned-cargo-detail` + preview grid 2×2 (previews estáticos) | P1 | **Concluída 2026-06-12** |
| **D** | Sheets map/timeline/documents/risks + status card + support cards + panel state local | P1 | **Concluída 2026-06-12** |
| **E** | `?panel=` URL sync + replace/back | P1 | **Concluída 2026-06-12** |
| **F** | QA 3 devices nomeados + screenshots | P1 | **Concluída 2026-06-12** |
| **G** | Atualizar fluxo doc §11 gaps, ADR se necessário | P2 |

**Primeira implementação recomendada:** Fase A (bugs visíveis/navegação que invalidam QA de tudo mais).

---

## 14. Fase F — QA visual oficial (2026-06-12)

### Devices (presets Playwright nomeados)

| Tier | Preset | Viewport real do preset | Screenshot `output/` |
|------|--------|-------------------------|----------------------|
| compact | **iPhone SE** | 320×568 | `minhas-cargas-phase-f-360x740.png` |
| standard | **iPhone 14** | 390×664 | `minhas-cargas-phase-f-390x844.png` |
| large | **iPhone 14 Pro Max** | 430×740 | `minhas-cargas-phase-f-430x932.png` |

Nomes de arquivo seguem tier do plano (360/390/430); **validação oficial usou device preset nomeado**, não viewport manual. Altura do preset Playwright difere dos rótulos históricos (740/844/932).

**Base URL QA:** `http://localhost:3000` (obrigatório em dev — `127.0.0.1` bloqueia HMR/chunks Next).

**Auth QA:** `POST /api/mock-mode/login-as` (`u-shipper-1` / Tiala embarcador).

**ID real testado (clique no 1º card):** `mock-1781228323768` (mock dinâmico e2e; lookup detalhe OK, sem 404).

### Resultado por rota

| Rota / fluxo | Resultado |
|--------------|-----------|
| `/pt-BR/cargas` | OK — sem cards privados; layout público preservado; BottomNav visível após hydrate |
| `/pt-BR/minhas-cargas` | OK — header **Minhas cargas**; resumo 2×2; cards privados; scroll; último card acima do BottomNav |
| `/pt-BR/minhas-cargas/[id]` cockpit | OK — status card, grid 2×2, support cards, ações; padding-bottom ~48px acima do nav no fim do scroll |
| Panels por click (map/timeline/documents/risks) | OK — URL `?panel=`, sheet abre, close limpa param |
| Panels por URL direta (4) | OK — abre direto; close limpa; base íntegra |
| Back button com panel aberto | OK — fecha panel, permanece no detalhe |
| `?panel=banana&scope=active` | OK — remove `banana`, preserva `scope=active`, sem sheet |

### Script QA

`scripts/minhas-cargas-phase-f-qa.mjs` — relatório JSON em `output/minhas-cargas-phase-f-report.json`.

### Riscos restantes (sem redesign nesta fase)

1. **Ghosting leve** no header glass ao rolar lista/detalhe (texto de cards sob título compacto) — mitigação completa exige ajuste no chrome mobile compartilhado, fora do escopo F.
2. **BottomNav tab ativa** em `/minhas-cargas` continua `dashboard` (mapeamento global pré-existente; escopo F proibiu alterar BottomNav).
3. **Botão M** (QA mock) pode sobrepor cards — esperado em mock-mode; não quebra layout funcional.
4. **Presets vs rótulos** — filenames 360×740 / 390×844 / 430×932 são convenção do plano; evidência capturada com alturas reais dos presets acima.

### Screenshots Fase F

Gerados/atualizados em `output/`:

- `minhas-cargas-phase-f-360x740.png`
- `minhas-cargas-phase-f-390x844.png`
- `minhas-cargas-phase-f-430x932.png`

Evidência adicional ad hoc (não obrigatória): `minhas-cargas-phase-f-list-top-390.png`, `minhas-cargas-detail-phase-f-390.png`.

---

## 12. Entrega visual esperada

- Tom calmo, superfícies mais opacas que `/cargas`
- Lista escaneável: 2–3 cards visíveis por viewport standard
- Detalhe = cockpit: resumo + 4 portas (grid) + ações
- Sheets = profundidade sob demanda, não scroll infinito
- Header sempre “Minhas cargas” ou nome da carga no detalhe — nunca Dashboard

---

## 13. Validação futura

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

- Unit: title resolver, panel param, summarize owned
- Visual: iPhone SE, iPhone 14, iPhone 14 Pro Max
- Regressão: `/pt-BR/cargas` inalterado
