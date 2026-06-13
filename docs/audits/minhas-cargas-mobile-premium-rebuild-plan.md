# Minhas Cargas — Auditoria e plano de reconstrução mobile premium

| Metadado | Valor |
|----------|-------|
| **Status** | Fase A ✅ — 2026-06-12; Fase B ✅ — 2026-06-12; Fase C ✅ — 2026-06-12; Fase D ✅ — 2026-06-12; Fase E ✅ — 2026-06-12; Fase F ✅ — 2026-06-12; **Fase G ✅** (fechamento docs, auditoria commits, checklist PR) — 2026-06-12 |
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
| **G** | Fechamento docs, auditoria commits, checklist PR, pacote para abrir PR contra `dev` | P2 | **Concluída 2026-06-12** |

**Entrega mobile premium concluída (Fases A–G).** Próximo passo: abrir PR contra `dev` (ver §15).

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

## 13. Validação (Fase G — 2026-06-12)

```bash
npm run lint          # OK
npm run typecheck     # OK
npm run check:i18n    # OK — 2183 keys aligned pt-BR/en-US/es
npm run build         # OK
```

**Unit tests (33 passed):**

- `tests/unit/features/cargo.service.test.ts` — lookup + normalização de ID
- `tests/unit/features/cargo/owned-cargo-card.component.test.tsx`
- `tests/unit/features/cargo/owned-cargo-detail.component.test.tsx`
- `tests/unit/features/cargo/owned-cargo-panel-search-params.test.ts`
- `tests/unit/shared/layout/resolve-mobile-page-title.test.ts`
- `tests/unit/app/minhas-cargas-detail-page.test.tsx`

**Harness Fase F (re-executado 2026-06-12):**

```bash
BASE_URL=http://localhost:3000 node scripts/minhas-cargas-phase-f-qa.mjs
```

Resultado: **0 falhas, 0 avisos** — relatório em `output/minhas-cargas-phase-f-report.json`.

Regressão `/pt-BR/cargas`: OK no harness (sem cards privados; layout público preservado).

---

## 15. Fase G — Fechamento e pacote PR (2026-06-12)

### Status por fase

| Fase | Escopo | Commit principal | Status |
|------|--------|------------------|--------|
| **A** | Title resolver, auth contrast, padding bottom-nav, ghost mitigation | `ef827514` | ✅ |
| **B** | `owned-cargo-summary` + `owned-cargo-card` + `MyCargoesList` | `92b75db1` | ✅ |
| **C** | `owned-cargo-detail` cockpit + preview grid 2×2 | `368cfb51` | ✅ |
| **D** | Status card 1×1, support cards, sheets + panel state local | `368cfb51` | ✅ |
| **E** | `?panel=` URL sync + replace/back | `7093b38c`, `bb57b8c1` | ✅ |
| **Fix** | Normalização ID card ↔ detalhe | `9b350268` | ✅ |
| **F** | QA visual 3 devices + harness | `b7ec606d`, `5563a69c` | ✅ |
| **G** | Docs finais + auditoria + checklist PR | (docs only) | ✅ |

### Working tree e ruído

| Item | Resultado |
|------|-----------|
| `git status --short` | Limpo (sem alterações pendentes antes dos edits Fase G) |
| `next-env.d.ts` local | Existe (gerado Next); **rastreado na branch** — revisar antes do merge |
| `proxy.ts` | **Rastreado na branch** (commit anterior à entrega minhas-cargas) — confirmar intencional |
| `.playwright-cli/*.log` | **Rastreados na branch** — ruído de QA; considerar remover do PR ou adicionar ao `.gitignore` |
| `output/playwright/*` | **Rastreados na branch** — screenshots de auditorias anteriores; não fazem parte da entrega minhas-cargas |
| `output/minhas-cargas-phase-f-*.png` | Gerados pelo harness; **não versionados** (OK) |
| `output/minhas-cargas-phase-f-report.json` | Gerado pelo harness; **não versionado** (OK) |

**Fase G não altera código de produto** — apenas documentação.

### Escopo preservado (auditoria branch)

| Área | Alterada pelos commits minhas-cargas (A–F)? | Nota |
|------|-----------------------------------------------|------|
| `/cargas` vitrine | Não nos commits A–F | Branch contém tweak em `public-cargas-mobile-list` (`1a04306e` — suppress bottom nav on sheet close); validar regressão no PR |
| BottomNav / IconButton | Não nos commits A–F | Outros commits na branch (`7b383671`, `062f92f0`) — fora do escopo minhas-cargas |
| auth/register/OTP registry | Parcial Fase A | `ef827514` — contraste auth-form apenas; sem alteração de registry/mock users |
| login/register/OTP fluxo | Não | Gate client `MinhasCargasAuthGate` + redirect RSC com `next` |

### Comportamento sheets (referência PR)

| Fluxo | Comportamento |
|-------|---------------|
| Click preview Mapa/Timeline/Documentos/Riscos | Abre BottomSheet global; URL ganha `?panel=map\|timeline\|documents\|risks` via `router.replace` |
| URL direta com `?panel=` válido | Sheet abre no hydrate; demais params preservados |
| Close sheet / botão fechar | Remove `panel`; preserva `scope` e demais query params |
| Back button (browser) | Fecha sheet; permanece no detalhe |
| `?panel=banana` (inválido) | Remove param inválido; sem sheet; rota íntegra |

### Riscos restantes pós-PR

1. **Ghosting leve** no header glass ao rolar (chrome mobile compartilhado).
2. **BottomNav tab ativa** em `/minhas-cargas` continua `dashboard` (mapeamento global pré-existente).
3. **Botão M** (QA mock) sobrepõe conteúdo em dev — esperado.
4. **Ruído no branch** — `.playwright-cli/`, `output/playwright/`, `next-env.d.ts`, `proxy.ts` rastreados; limpar ou justificar no PR.
5. **Busca/filtro avançado** na lista privada — fluxo aprovado inclui; validar cobertura pós-merge.

### Próximos passos pós-PR

1. Merge em `dev` e smoke manual em staging mock.
2. Mapear BottomNav para `/minhas-cargas` (issue separada — escopo proibido nesta entrega).
3. Mitigar ghosting no header mobile compartilhado.
4. Enriquecer mocks `u-shipper-*` para QA de empty states raros.
5. Limpar artefatos QA versionados acidentalmente (`.playwright-cli/`, `output/playwright/`).

### Pacote PR sugerido

**Branch:** `feat/minhas-cargas-operational-flow`  
**Base:** `dev`

**Title sugerido:**

```
feat(minhas-cargas): premium mobile cockpit with URL panel sheets
```

**Comandos git (antes de abrir PR):**

```bash
git fetch origin dev
git checkout dev && git pull origin dev
git checkout feat/minhas-cargas-operational-flow
git rebase origin/dev   # ou merge, conforme política do time
```

**Preview browser:**

```bash
npm run dev
# Login QA: POST /api/mock-mode/login-as { "userId": "u-shipper-1" }
# ou QA Hub em /pt-BR/cargas → perfil Tiala embarcador
open http://localhost:3000/pt-BR/minhas-cargas
open http://localhost:3000/pt-BR/minhas-cargas/mock-1781228323768?panel=map
```

**Abrir PR (após commit docs Fase G e push):**

```bash
git push -u origin feat/minhas-cargas-operational-flow
gh pr create --base dev --title "feat(minhas-cargas): premium mobile cockpit with URL panel sheets" --body-file /tmp/minhas-cargas-pr-body.md
```

Ver corpo terminal-friendly abaixo (§15.1).

#### §15.1 PR description (terminal-friendly)

```
## Summary

- Premium mobile rebuild of /minhas-cargas: owned-cargo-card list, owned-cargo-detail cockpit, 2x2 preview grid
- BottomSheet panels (map, timeline, documents, risks) synced with ?panel= URL param
- Auth gate layout (MinhasCargasAuthGate), ID normalization for card-to-detail lookup
- Phase F QA harness: scripts/minhas-cargas-phase-f-qa.mjs (3 device presets, 0 failures)

## Scope

- IN: /minhas-cargas list + detail, owned cargo components, panel URL state, docs
- OUT: /cargas marketplace UI redesign, BottomNav mapping, auth registry changes

## Test plan

- [ ] npm run lint && npm run typecheck && npm run check:i18n && npm run build
- [ ] vitest: cargo.service, owned-cargo-*, minhas-cargas-detail-page, resolve-mobile-page-title
- [ ] BASE_URL=http://localhost:3000 node scripts/minhas-cargas-phase-f-qa.mjs
- [ ] Login as u-shipper-1; /pt-BR/minhas-cargas loads premium list
- [ ] Tap card -> cockpit detail (no 404)
- [ ] Click each preview -> sheet opens, URL has ?panel=
- [ ] Direct URL ?panel=map|timeline|documents|risks -> sheet opens
- [ ] Back button closes sheet, stays on detail
- [ ] ?panel=banana -> param stripped, no crash
- [ ] /pt-BR/cargas unchanged (no private cards)
- [ ] Mobile: 360x740, 390x844, 430x932
- [ ] i18n pt-BR / en-US / es spot check

## Docs

- docs/audits/minhas-cargas-mobile-premium-rebuild-plan.md (Fases A-G)
- docs/product/flows/minhas-cargas-fluxo-embarcador.md
- docs/product/flows/minhas-cargas-fluxo-tecnico-embarcador.md

## Known risks

- BottomNav active tab still "dashboard" on /minhas-cargas (pre-existing)
- Light header ghosting on scroll (shared mobile chrome)
- Branch may include tracked QA artifacts (.playwright-cli/, output/playwright/) — review before merge
```

**Commit docs sugerido (após aprovação):**

```
docs(minhas-cargas): close phase G audit and PR checklist
```
