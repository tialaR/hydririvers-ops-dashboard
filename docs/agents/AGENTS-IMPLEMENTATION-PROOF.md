# Hydri Implementation Proof

Every implemented task must close with a **Captain closeout** (short, decisive message for the user) and, when implementation happened, a `HYDRI_IMPLEMENTATION_PROOF` block (technical audit trail). Agents must prove the change worked, explain how it was validated, and declare limits — not just say "done".

**Do not lead the closing section with technical proof.** Captain closeout comes first; the user should not need to parse proof levels or router categories to understand the outcome.

The proof must include the **HYDRI_TASK_ROUTER task classification** used for the work (same categories declared in the initial router block). See `docs/agents/AGENTS-TASK-ROUTER.md`.

## Captain closeout (mandatory)

Emit **Captain closeout** at the start of every closing section. It is written **for the user**, not for another agent — a short, decisive summary without technical jargon when a human equivalent exists.

**Closing order:**

1. Work body (prose, code, diffs — avoid textão before closeout)
2. **Captain closeout** ← user-facing decision (**always first in closing section**)
3. **Detalhes técnicos** (optional — component names, paths, commands, proof levels)
4. `HYDRI_TASK_ROUTER — close` (technical)
5. `HYDRI_IMPLEMENTATION_PROOF` (technical — only when implementation happened)

**When to omit full HYDRI_IMPLEMENTATION_PROOF:**

- Plan or audit only (no code/config/test changes): Captain closeout with **🟡 Segue com cuidado** is enough.
- Blocked before any delivery: Captain closeout with **🔴 Para agora**; omit proof unless partial work exists.

### Template (required)

```md
## Captain closeout

🟢/🟡/🔴 [Decisão curta]

Em humano:
[1 a 3 frases curtas explicando o que aconteceu sem jargão]

Prova simples:
[1 linha com validação em linguagem simples — UI mobile: "Testado em celular pequeno, médio e grande." ou "Só testado em um tamanho, precisa revisar responsividade."]

Falta provar:
[1 linha objetiva]

Próxima ação:
[1 ação clara]
```

**Mobile UI closeout mapping:**

| Mobile viewport coverage | Captain closeout | **Result** |
|--------------------------|------------------|------------|
| All three tiers tested | 🟢 **Pode seguir** (if other proof sufficient) | Worked |
| One width only | 🟡 **Segue com cuidado** — never 🟢 | Partial |
| Two widths | 🟡 **Segue com cuidado** | Partial |

### Status meanings

| Emoji | Decisão | When to use | Maps to **Result** |
|-------|---------|-------------|-------------------|
| 🟢 | **Pode seguir** | Validated with sufficient evidence; docs/rules created and checks passed | Worked |
| 🟡 | **Segue com cuidado** | Partial, incomplete validation, relevant risk, plan/audit without execution | Partial |
| 🔴 | **Para agora** | Did not work, validation failed, scope blocked | Did not work |

### Avoid in Captain closeout

Do not use internal component names (unless essential), "canônico", "light/flush", "runtime", "E2E", "flicker", "viewport", "supressão", "PR #…", file paths, or long lists. Move those to **Detalhes técnicos** or `HYDRI_IMPLEMENTATION_PROOF`.

**Captain closeout** and **HYDRI_IMPLEMENTATION_PROOF** must agree on outcome (🟢 Pode seguir ↔ Worked, 🟡 Segue com cuidado ↔ Partial, 🔴 Para agora ↔ Did not work).

## When to use

- After any code, config, test, or docs change that claims to fix or deliver behavior.
- Before marking a task complete, opening a PR, or telling the user the work succeeded.
- Even for partial work: use **Partial** or **Did not work** honestly.

## Mandatory closing block

Copy this template and fill every field. Omit a field only when truly not applicable, and say why.

```md
## HYDRI_IMPLEMENTATION_PROOF

**Result:** Worked | Partial | Did not work

**HYDRI_TASK_ROUTER classification:**
- (categories used for this task)

**Change implemented:**
- 

**Objective evidence:**
- 

**Commands run:**
- 

**Tests affected:**
- 

**Preview / manual QA (when applicable):**
- 

**Visual comparison matrix (required for UI categories):**
- Reference behavior | Actual behavior | Pass/Fail | Evidence | File/consumer — one row per essential state

**Mobile viewport coverage (required for UI categories):**
- Small mobile (320×568 or 360×740): pass | fail | not tested — notes
- Standard mobile (390×844): pass | fail | not tested — notes
- Large mobile (430×932): pass | fail | not tested — notes
- Width-dependent behavior (if component mutates by width): small / standard / large — one line each
- Screenshot or evidence per viewport (path or citation): 

**Files changed:**
- 

**Not validated:**
- 

**Remaining risks:**
- 

**Why the implementation may still be wrong:**
- 

**Recommended next action:**
- 
```

### Field requirements

| Field | Requirement |
|-------|-------------|
| **Result** | One of: `Worked`, `Partial`, `Did not work`. No vague "should work". |
| **HYDRI_TASK_ROUTER classification** | Categories from the router (see `docs/agents/AGENTS-TASK-ROUTER.md`). |
| **Change implemented** | What was actually built or fixed, in plain language. |
| **Objective evidence** | Logs, command output, DOM markers, screenshots, test names — not opinion. |
| **Commands run** | Exact commands and exit status when relevant. |
| **Tests affected** | Added, updated, or run tests; or explicit "none" with reason. |
| **Preview / manual QA** | Route, viewport, steps, outcome. Required for UI/behavior changes. Must exercise the **real consumer route**, not only isolated component preview. |
| **Visual comparison matrix** | Required for UI categories. Per [Visual Acceptance Gate](#visual-acceptance-gate-for-ui-tasks): reference vs actual, pass/fail, evidence (screenshot/video), file/consumer. DOM/computed-style alone is insufficient for pass. |
| **Mobile viewport coverage** | Required when any UI category applies (`mobile-ui`, `bottom-nav`, `bottom-menu`, `bottom-sheet`, `filter-sheet`, `action-sheet`, `styling`, `visual-regression`, `accessibility` on visible UI). List pass/fail/not tested for small (320×568 or 360×740), standard (390×844), and large (430×932) mobile. Declare width-dependent behavior when layout mutates. Cite or save screenshot per width when applicable. All three widths required before 🟢 on mobile UI. |
| **Files changed** | Paths that matter for review and rollback. |
| **Not validated** | Scopes, locales, devices, edge cases skipped. For UI: any essential visual state (idle, pressed, release, scroll, focus-visible, disabled) listed here **blocks 🟢** per Visual Acceptance Gate. |
| **Remaining risks** | Regressions, flaky tests, mock-only proof, incomplete i18n. Legacy mixin/variant affecting in-scope component **blocks 🟢**. |
| **Why it may still be wrong** | Honest failure modes: wrong file, wrong route, hydration, stale cache. If non-empty for in-scope UI **blocks 🟢** unless disproven with visual evidence on current screen. |
| **Recommended next action** | Smallest next step to increase confidence. |

## Visual Acceptance Gate for UI tasks

**Applies when any UI category is active:** `mobile-ui`, `desktop-ui`, `bottom-nav`, `bottom-menu`, `bottom-sheet`, `filter-sheet`, `action-sheet`, `styling`, `visual-regression`, `accessibility` on visible interface, or any task that changes component/UI appearance or interaction.

For UI tasks, **Captain closeout 🟢 Pode seguir** is allowed only when the **real visual experience** matches the reference and no open risk affects the component in scope. Technical checks alone (lint, typecheck, unit tests, DOM/computed-style inspection) **never** justify 🟢 for visual work.

### UI Visual Lab closeout

When a component has an **official lab subroute** under `/[locale]/hy-ui-lab` (see `AGENTS-UI-MOBILE-STANDARDS.md` → **UI Visual Lab**), follow the **automated workflow** in `docs/agents/AGENTS-WORKFLOW.md` → **UI Visual Lab — automated workflow**.

**Phase 2 deliverable:** after lab + gate + evidence, the agent **must** emit **Menu de decisão** (mandatory format in `AGENTS-UI-MOBILE-STANDARDS.md` → **Menu de decisão**) with recommendation, scope, probable files, risk, and validations per option. Record the menu in **Objective evidence** or cite that it was delivered in the response. Closeout after menu only: **🟡** — awaiting short authorization (`Autorizo opção A.`, `Abortar.`, `Refazer comparação.`, etc.).

**🟢 is forbidden** unless **all** of the following are true:

| # | Requirement | If missing |
|---|-------------|------------|
| L0 | **Explicit user authorization** for production work: approved **variant name**, **scope**, **target component/route**, **prohibitions maintained** (see standard command in UI standards). Lab-only tasks exempt. | **🔴** if production changed without authorization; **🟡** if lab-only |
| L1 | Lab visual gate **PASS** with evidence in `output/ui-lab/<component>/` (or cited equivalent) | **🟡** minimum |
| L2 | Real **consumer route** validated perceptually (not lab page alone) | **🟡** minimum |
| L3 | Screenshots/report paths recorded in proof | **🟡** minimum |
| L4 | Task scope respected: lab-only tasks did not touch production; authorized tasks did not alter literal reference; only **one** authorized variant applied | **🔴** if violated |
| L5 | Lab route **and** real route opened in browser **or** exact preview commands delivered (`open` / `start` / `xdg-open` + URL) | **🟡** minimum |
| L6 | Glass/transparency/light-mode labs use Hydri DS v2 light colored backdrop + `transparency-scroll` section with real scroll behind fixed buttons (not flat white/gray alone) | **🟡** minimum; **🔴** if backdrop is artificial/neon or scroll missing |
| L7 | **Decision menu** delivered when lab phase completes (phase 2); production work waits for short or full authorization | **🟡** if menu missing; **🔴** if production changed without authorization |
| L8 | No user-reported visual divergence on the consumer surface | **🔴** if user disputes look |

**Lab-only tasks (phase 1 complete):** close 🟢 only when the lab + Playwright gate + evidence are complete, **decision menu** was delivered, and lab route was opened or exact command delivered — **no production diff**.

**After decision menu (phase 2):** **🟡** maximum until user authorizes one option — never 🟢 for production.

**Authorized component tuning tasks:** user authorization on record; lab must pass; production consumer must pass; literal reference in lab stays frozen; agent did not apply unauthorized variants.

**Temporary labs** (`tmp-*`): must be removed before PR; evidence may be cited but route must not ship.

#### Authorization (record in proof when production changes)

**Short form (valid):**

- `Autorizo opção A.` (or B, C, … from the decision menu)
- `Autorizo implementar a variante: <nome>.`
- `Abortar.` / `Refazer comparação.` (no production — record action taken)

**Full form (optional, still valid):**

```text
Autorizo implementar a variante: <nome-da-variante>
Escopo autorizado: <componente/rota>
Não alterar outras variantes.
Não alterar a referência literal.
Aplicar somente no componente global/consumidor indicado.
Rodar validação completa e abrir a rota automaticamente ao final.
Não fazer commit sem confirmação.
```

Record the **authorized option or variant name** and **authorized scope** in **Change implemented** and **Objective evidence** when L0 applies.

### Hard blocks on 🟢 (use 🟡 or 🔴 and name the blocker)

Captain closeout **🟢 is forbidden** when any of the following is true:

| # | Blocker | Required closeout |
|---|---------|-------------------|
| 1 | The user reports a visual mismatch still present ("continua errado", "não ficou igual", "não salta", "não tem transparência", "misturado", "azul no click", or equivalent) | **🔴 Para agora** — treat as visual regression; reopen audit; do not defend prior output |
| 2 | Primary proof is only DOM structure, class names, or `getComputedStyle` / CSS variable values — not perceptual visual validation (screenshot, video, or live preview at target route) | **🟡** minimum; **🔴** if user already disputed the look |
| 3 | **Why the implementation may still be wrong** (or equivalent) affects the component in scope | **🟡** or **🔴** until resolved or explicitly disproven with visual evidence on the current screen |
| 4 | **Not validated** covers any **essential visual state** for the component: idle, pressed, release, scroll, `focus-visible`, disabled (when applicable) | **🟡** minimum; **🔴** if user-reported state is among the missing ones |
| 5 | Legacy styles, local mixin, parallel variant, or old skin can still override or blend into the component's visual | **🟡** minimum until consumer + component are checked together on the real route |
| 6 | Forbidden scope blocked the file or **consumer** where the visual bug appears | **🔴 Para agora** — root cause cannot be closed without that surface |
| 7 | Mobile UI task without validation on **all three** widths: 360×740, 390×844, 430×932 | **🟡 Segue com cuidado** — never 🟢 |
| 8 | User provided a visual reference (design, screenshot, video, Figma) and no side-by-side comparison was performed | **🟡** minimum |
| 9 | Screenshots or video from the running app contradict the agent's claim | **🔴 Para agora** |
| 10 | Any combination of the above | Use the **strictest** applicable emoji; explain the exact blocker in **Falta provar** |
| 11 | Official UI Visual Lab exists for the component but gate skipped, failed, or no evidence in `output/ui-lab/<component>/` | **🟡** minimum |
| 12 | Lab passed but real consumer route not validated perceptually | **🟡** minimum |
| 13 | Lab-only task changed production, or component task altered literal reference in lab | **🔴 Para agora** |
| 14 | Production changed without **explicit user authorization** (variant name + scope + prohibitions) | **🔴 Para agora** |
| 15 | Agent applied multiple variants or chose a variant without user authorization | **🔴 Para agora** |
| 16 | Authorized visual implementation closed 🟢 without lab PASS + consumer PASS + evidence + browser/commands | **🟡** minimum |

When any blocker applies: state it plainly in **Falta provar** and **Recommended next action**; do not use 🟢.

### Visual evidence rule

For UI tasks, deliver a **visual comparison matrix** in `HYDRI_IMPLEMENTATION_PROOF` (or **Detalhes técnicos** when the matrix is long):

| Reference behavior | Actual behavior | Pass/Fail | Evidence | File / consumer affected |
|--------------------|-----------------|-----------|----------|--------------------------|
| (what should happen) | (what was observed) | pass \| fail \| not tested | screenshot path, video, preview route + step | component file and real consumer (page, shell, feature) |

DOM-only or computed-style rows **do not** count as pass evidence unless paired with a screenshot or video that shows the same state on the **real consumer route**.

### Minimum states — IconButton / glass controls

When IconButton or glass controls are in scope, the matrix must cover at least:

| State | What to verify |
|-------|----------------|
| Idle transparency | Glass fill, blur, border read correctly at rest |
| Pressed button scale | Button scales per `--hy-icon-button-press-scale` |
| Pressed icon jump | Icon translateY / scale on press |
| Pressed glow | Inner glow visible on press |
| Release → idle | Returns smoothly; timers cleared; no stuck `data-press` |
| Scroll transparency | Control stays correct while page/sheet scrolls |
| `focus-visible` | Keyboard focus ring visible; no layout break |
| No native tap highlight | No blue/gray flash on tap or click (`-webkit-tap-highlight`, outline bleed) |

Missing any applicable row → **Not validated** for that state → 🟢 forbidden.

### Anti-false-green phrases

If the output contains any phrase equivalent to the list below, **closeout cannot be 🟢** unless the phrase is **explicitly disproven** with visual evidence on the current screen (not theory):

- "may still be wrong"
- "not validated"
- "legacy still exists"
- "out of scope but may affect"
- "computed style shows"
- "did not validate real touch"
- "consumer still has local mixin"

Map to **🟡 Segue com cuidado** (fixable gap) or **🔴 Para agora** (user dispute or blocked consumer).

### User-reported visual divergence

When the user says the visual is still wrong:

1. Classify as **🔴 visual regression** — not a debate about prior proof.
2. **Reopen audit** — do not restate old DOM/computed-style conclusions as sufficient.
3. **Include the real consumer** in scope (page, shell, feature wrapper) even if the component file was already changed.
4. **Require visual root cause** — which layer (token, module, mixin, consumer override, state machine) produces the wrong pixels.
5. Close with **🔴** until the user-facing surface matches reference, or **🟡** only when a concrete next step remains and no user dispute is open.

### UI closeout examples (Visual Acceptance Gate)

#### 🟢 Pode seguir — visual match proved

```md
## Captain closeout

🟢 Pode seguir

Em humano:
O botão de vidro no filtro agora fica transparente em repouso, encolhe e brilha ao toque, e volta ao normal ao soltar — igual ao que pedimos. Conferi na tela de cargas nos três tamanhos de celular.

Prova simples:
Comparado com a referência em vídeo; testado em celular pequeno, médio e grande na rota real.

Falta provar:
Modo escuro e toque em aparelho físico.

Próxima ação:
Smoke rápido no celular real antes de publicar.
```

#### 🟡 Segue com cuidado — technical proof only or gap remains

```md
## Captain closeout

🟡 Segue com cuidado

Em humano:
O componente isolado parece certo no código, mas ainda não conferi o botão dentro da tela de filtros onde o problema aparece. Falta validar o estado ao rolar a lista.

Prova simples:
Checagens automáticas passaram; só vi o componente no preview isolado, não no consumidor real.

Falta provar:
Visual na tela de cargas com filtro aberto; transparência durante scroll; terceiro tamanho de celular.

Próxima ação:
Abrir `/pt-BR/cargas`, abrir filtro, capturar idle + pressed + scroll nos três tamanhos.
```

#### 🔴 Para agora — user dispute or blocked consumer

```md
## Captain closeout

🔴 Para agora

Em humano:
Você disse que o clique ainda fica azul e o ícone não salta — isso não foi resolvido. O escopo anterior não incluiu o arquivo da barra de busca onde o botão é usado, então a causa provável ainda está lá.

Prova simples:
Screenshot atual ainda mostra destaque azul no toque; sem comparação que prove o salto do ícone.

Falta provar:
Correção no consumidor real; matriz visual idle/pressed/release na rota de cargas.

Próxima ação:
Reauditar `search-bar` + `IconButton` juntos e repetir capturas antes de novo closeout.
```

## Cannot claim "it worked"

Do **not** state success if any of the following apply:

| Condition | Why it blocks a success claim |
|-----------|-------------------------------|
| **Visual Acceptance Gate blocker** | Any row in [Visual Acceptance Gate for UI tasks](#visual-acceptance-gate-for-ui-tasks) — UI tasks must not close 🟢 until the gate passes. |
| Mandatory validation not run | `npm run lint`, `npm run typecheck`, `npm run check:i18n` (and tests when required) were skipped or failed. |
| Affected route/component not inspected | Code compiles but the user-facing surface was not opened or exercised. |
| Test passed but only fragile contract | Asserts text/class names without behavior; snapshot-only; mocks hide integration. |
| UI changed without visual preview | Layout, spacing, states, or chrome changed without runtime or screenshot proof. |
| UI proof is DOM/computed-style only | Per Visual Acceptance Gate — perceptual validation required for 🟢. |
| Mobile UI validated at only one width | UI category task closed with 🟢 but **Mobile viewport coverage** missing one or more of small / standard / large mobile — must be 🟡 **Segue com cuidado** and **Result:** Partial. |
| Behavior changed without test or QA | Logic, routing, filters, or permissions changed with no automated or manual check. |
| Error dismissed as "out of scope" | Failure attributed to environment or unrelated code without evidence (logs, repro, diff). |
| Consumer in scope blocked | Visual bug on a surface that forbidden scope prevented touching — cannot claim Worked. |

If blocked, set **Result** to `Partial` or `Did not work` and document what is missing.

## Proof levels

Use the highest level actually achieved. Minimum level depends on change type (see checklists below).

| Level | Name | What it proves |
|-------|------|----------------|
| **P0** | Build hygiene | `npm run lint`, `npm run typecheck`, `npm run check:i18n` pass (when in scope). |
| **P1** | Automated tests | Affected unit/integration tests added or run and passing. |
| **P2** | Runtime / manual QA | Local dev preview: route loaded, interaction exercised, expected DOM/state observed. |
| **P3** | CI / PR green | Remote checks on the branch/PR succeeded. |
| **P4** | User or media validation | User sign-off, or screenshot/video showing correct behavior in target context. |

**Minimum expectations:**

- Docs-only: P0 if tooling still applies; otherwise state what was checked.
- Logic / mocks / routing: P0 + P1 when tests exist; P2 when behavior is user-visible.
- Mobile or desktop UI: P0 + P2 at minimum on **real consumer route**; **Visual Acceptance Gate** must pass for 🟢; **mobile UI also requires three mobile widths** (see **Mobile viewport coverage**); P4 (screenshot/video/reference comparison) required for significant visual chrome changes — DOM/computed-style is not P4.
- Copy / i18n: P0 including `check:i18n`; P2 on at least one locale route when strings changed.

## Checklist: mobile UI

When the task touches mobile UI, confirm in **Mobile viewport coverage**, **Preview / manual QA**, or **Not validated**:

- [ ] **Small mobile** — 320×568 or 360×740
- [ ] **Standard mobile** — 390×844
- [ ] **Large mobile** — 430×932
- [ ] Width-dependent behavior documented (small / standard / large) when layout mutates by width
- [ ] Nav, sheets, cards, chips, search, controls: no ugly wrap, label overlap, icon misalignment, indicator overflow, hidden last item, broken safe-area, missing primary animation
- [ ] Screenshot or evidence cited per viewport when Playwright or visual QA is used
- [ ] Light mode (unless task is explicitly dark-only)
- [ ] Initial state on load (no flash of wrong layout)
- [ ] Primary interaction (tap, open, submit, navigate)
- [ ] Close / cancel / back / dismiss interaction
- [ ] Scroll where content overflows
- [ ] Safe area and BottomNav not obscuring content or CTAs
- [ ] Desktop regression absent when scope is mobile-only (no desktop files changed, or desktop spot-checked)

Default preview route for mobile cargas work: `http://localhost:3000/pt-BR/cargas`

## Checklist: Next.js routes and i18n

When the task touches routes, navigation, or copy:

- [ ] Route uses `/[locale]` pattern; links respect locale
- [ ] `pt-BR`, `en-US`, `es` updated when copy or keys change (or documented why not)
- [ ] No new hardcoded user-facing strings outside next-intl messages
- [ ] `npm run check:i18n` run and passed

## Checklist: CSS / Sass

When the task touches styles:

- [ ] Feature styles stay in CSS Modules / Sass Modules (`.module.scss` or `.module.sass`)
- [ ] `src/app/globals.scss` not used for feature UI
- [ ] No `!important`
- [ ] If component-level `.scss` was touched: justify in proof, or migrate to `.module.sass` when safe and in scope
- [ ] New/touched paths use **kebab-case** unless rename is unsafe or out of scope

Preserve mobile/desktop style separation; a mobile-only task must not break desktop layout and vice versa.

## Checklist: UI architecture

When the task touches interface (any UI category per `AGENTS-TASK-ROUTER.md`):

- [ ] `AGENTS-UI-MOBILE-STANDARDS.md` and `.cursor/rules/hydri-ui-architecture.mdc` were read before implementation
- [ ] Presentational component stays dumb where possible; logic in hook/helper in same scope
- [ ] Items, labels, icons, metadata extracted when non-trivial
- [ ] No `querySelector` / `document.documentElement` when refs and CSS variables suffice
- [ ] Accessibility and semantics preserved

## Relation to other Hydri workflows

- **HYDRI_TASK_ROUTER:** classify before work; proof repeats the classification used.
- **Audit before patch:** diagnosis closes before implementation proof is attempted.
- **AGENTS-WORKFLOW.md:** branching, commits, and baseline commands.
- **AGENTS-TASK-ROUTER.md:** category → required docs mapping.
- **AGENTS-UI-MOBILE-STANDARDS.md:** mobile chrome and BottomNav expectations.
- **hydririvers-visual-workflow:** visual iteration rounds; implementation proof closes each implementation round.

## Examples: Captain closeout

### 🟢 Pode seguir — implementation validated

```md
## Captain closeout

🟢 Pode seguir

Em humano:
O painel de filtros no celular não esconde mais o conteúdo atrás da barra de navegação. Abrir, filtrar, fechar e rolar funcionaram no teste manual.

Prova simples:
Testado em celular pequeno, médio e grande; checagens automáticas passaram.

Falta provar:
Inglês e espanhol, modo escuro e teste em aparelho físico.

Próxima ação:
Completar traduções e fazer um teste rápido no celular real antes de publicar.

### Detalhes técnicos

- Preview: `/pt-BR/cargas` — safe-area padding no filter sheet
- `npm run lint`, `npm run typecheck`, `npm run check:i18n` — exit 0
- Locales en-US/es não revisados nesta rodada
```

Technical blocks follow (abbreviated):

```md
## HYDRI_TASK_ROUTER — close
…

## HYDRI_IMPLEMENTATION_PROOF

**Result:** Worked
…
```

### 🟡 Segue com cuidado — partial or plan/audit only

```md
## Captain closeout

🟡 Segue com cuidado

Em humano:
O texto do filtro de status foi ajustado só em português. Inglês e espanhol ainda não foram atualizados.

Prova simples:
A checagem de traduções passou e a tela em português foi revisada manualmente.

Falta provar:
Traduções em inglês e espanhol; versão desktop não foi aberta.

Próxima ação:
Completar os dois idiomas e conferir as três versões de idioma no navegador.
```

For plan/audit without code changes, stop after Captain closeout — no full `HYDRI_IMPLEMENTATION_PROOF` required.

### 🔴 Para agora — blocked or failed

```md
## Captain closeout

🔴 Para agora

Em humano:
Nada foi entregue — falta um documento obrigatório no repositório e o trabalho ficou bloqueado.

Prova simples:
Confirmei que o arquivo esperado não existe no disco.

Falta provar:
Qualquer mudança de estilo ou comportamento.

Próxima ação:
Restaurar o documento ou autorizar o escopo sem ele.

### Detalhes técnicos

- Doc ausente: `docs/theme.md`
```

When partial work exists, add `HYDRI_IMPLEMENTATION_PROOF` with **Result:** Did not work below Captain closeout.
