# Hydri Mobile UI Standards

Mobile-first chrome and interaction standards. **Architecture rules below apply to all UI surfaces** (mobile and desktop) unless a task is explicitly desktop-only layout with no shared component patterns.

**Router:** Any UI task must read this doc via [UI tasks auto-routing](AGENTS-TASK-ROUTER.md#ui-tasks-mandatory-auto-routing). If you are implementing UI and have not read this file, stop and fix routing first.

**Cursor rule:** `.cursor/rules/hydri-ui-architecture.mdc` — dumb components, hooks, data separation, kebab-case.

## Principles

- Mobile is not squeezed desktop.
- Mobile and desktop must stay separated in architecture.
- Preserve visual consistency without shared fragile conditional JSX.
- Light mode is priority now; dark mode later.

## UI architecture

- **Dumb / semantic components** — JSX presents structure and styles; avoid embedding business logic, measurement, or side effects in the component when a hook can own them.
- **Hooks and helpers in scope** — movement, measurement, timers, resize, derived state, and effects live in a hook or helper next to the component (e.g. `use-bottom-nav-indicator.ts` beside `bottom-nav.tsx`).
- **Data in separate files** — nav items, labels, descriptions, icons, and metadata move to a dedicated file in the same feature/component folder when they exceed trivial inline literals (e.g. `bottom-nav-items.tsx`).
- **No global CSS for components** — feature and component styles stay in CSS/Sass Modules; do not use `src/app/globals.scss` for feature UI.
- **Refs and CSS variables first** — prefer React refs and scoped CSS variables over `querySelector` or `document.documentElement` tweaks.
- **Accessibility** — preserve landmarks, labels, focus order, keyboard support, and meaningful semantics after refactors.

## File and folder naming (kebab-case — mandatory)

**Scope:** components, hooks, helpers, services, styles, tests, new technical docs, and folders under `src/features/` and `src/shared/`.

| Rule | Policy |
|------|--------|
| **New paths** | **Mandatory kebab-case** — `bottom-nav/`, `filter-sheet.tsx`, `use-filter-sheet.ts`, `icon-button.module.sass`. |
| **Touched paths** | If a file or folder is **not** kebab-case, **migrate to kebab-case when safe** (update imports, barrels, tests, docs that cite paths; run typecheck). |
| **Unsafe migration** | Explain why not migrated; open a clear follow-up; **do not** create new files outside the pattern. |
| **Mass renames** | Forbidden without explicit user approval. |
| **React exports** | May remain **PascalCase** in code (`export function BottomNav`) even when the file is `bottom-nav.tsx`. |
| **Generated files** | Tool-generated paths may be documented exceptions. |

**Examples:**

| Before | After |
|--------|-------|
| `IconButton.tsx` | `icon-button.tsx` |
| `IconButton.module.sass` | `icon-button.module.sass` |
| `BottomGlassMenuLight.tsx` | `bottom-glass-menu-light.tsx` |

### Prohibition of new legacy naming

Do **not** create new production paths named `legacy`, `v2`, `dev-v2`, `new`, `old`, or `tmp` (except disposable lab — see **UI Visual Lab**).

| Pattern | Allowed when |
|---------|--------------|
| `tmp-*` subroute or file | Disposable **temporary lab** only — **must be removed before commit/PR** |
| `legacy`, `v2`, `old`, `new` | **Never** for new production code |

Production naming must follow Hydri patterns: **`hy-*`**, **`--hy-*`**, **kebab-case** file paths.

## Interaction

Use subtle bubble press feedback:
- scale slightly while pressed;
- return smoothly;
- do not permanently alter visual style.

Apply to:
- icon buttons;
- buttons;
- chips;
- search focus;
- bottom-sheet close icons;
- clickable cards.

## IconButton and glass controls (official pattern)

**Applies to:** `IconButton`, circular buttons, glass controls, filter buttons, search buttons, map buttons, and any icon-only action control.

### Architecture

- **Dumb / semantic component** — markup, ARIA, and class/data attributes only; no business logic, timers, or DOM measurement in the component body.
- **Press logic in a dedicated hook** — pointer/touch/keyboard press, release, timers, and `prefers-reduced-motion` handling live in a hook in the **same component scope** (e.g. `use-icon-button-press.ts` beside `icon-button.tsx`).
- **No `querySelector`** — use React refs and event handlers on the control element.
- **No global DOM listeners** when refs/handlers on the control suffice (avoid `document`/`window` listeners for press state).
- **No `document.documentElement` for local variables** — scope CSS custom properties on the component root via refs or inline/module styles, not on `:root`.
- **Styles in `.module.sass`** — component and variant styles stay in a Sass Module; do not add feature UI to `globals.scss`.
- **No `!important`**.

### Design tokens (`--hy-icon-button-*`)

New IconButton / glass-control tokens use `--hy-*` and **`--hy-icon-button-<property>`**:

| Token | Purpose |
|-------|---------|
| `--hy-icon-button-size` | Hit target (width/height) |
| `--hy-icon-button-icon-size` | SVG / glyph size |
| `--hy-icon-button-radius` | Border radius (often pill/circle) |
| `--hy-icon-button-glass-background` | Glass fill |
| `--hy-icon-button-glass-border` | Glass border |
| `--hy-icon-button-glass-blur` | `backdrop-filter` blur |
| `--hy-icon-button-glass-saturate` | `backdrop-filter` saturate |
| `--hy-icon-button-shadow` | Outer shadow |
| `--hy-icon-button-press-scale` | Button scale while pressed |
| `--hy-icon-button-icon-press-y` | Icon translateY while pressed |
| `--hy-icon-button-icon-press-scale` | Icon scale while pressed |
| `--hy-icon-button-glow-size` | Inner glow radius/spread |
| `--hy-icon-button-glow-opacity` | Glow opacity when pressed |
| `--hy-icon-button-motion-press-duration` | Press-in transition |
| `--hy-icon-button-motion-release-duration` | Release transition |

Legacy non-`--hy-icon-button-*` names on existing components migrate progressively when touched — no bulk rename.

### Press feedback (official)

On press (pointer down / equivalent keyboard):

1. **Button** scales slightly (`--hy-icon-button-press-scale`).
2. **Icon** moves up slightly and scales lightly (`--hy-icon-button-icon-press-y`, `--hy-icon-button-icon-press-scale`).
3. **Inner glow** appears in the pressed state (`--hy-icon-button-glow-*`).

On release:

- A **release** state may exist briefly for animation, then return to **idle** with timers cleared (no leaked timeouts).

Use **`data-press="idle|pressed|release"`** on the control root when styles need explicit state (preferred over `:active` alone when glow/icon motion outlive the native active pseudo-state).

### Layout note: `overflow: visible`

`overflow: visible` is allowed when the icon or glow must extend outside the hit box. Document the reason in the component file (one-line comment) when used.

### Reduced motion

Respect `prefers-reduced-motion: reduce`:

- Skip or minimize scale, translate, and glow animation;
- Keep focus ring and color/contrast feedback;
- Hook must read reduced-motion preference and avoid scheduling motion timers when reduced.

### Accessibility (required)

| Case | Rule |
|------|------|
| Action | Real `<button type="button">` (or `submit` when appropriate) |
| Navigation | Real `<a href="…">` when the control navigates |
| Icon-only | **`aria-label` required** (or visible text alternative) |
| Decorative icon | `aria-hidden` on the icon wrapper |
| Focus | Visible `:focus-visible` outline |
| Disabled | `disabled` on button or `aria-disabled` + no pointer when disabled |
| Toggle | `aria-pressed` when the control represents on/off selection |

### Scope examples

Filter, search, and map icon buttons in mobile chrome must use this pattern (dumb component + press hook + `--hy-icon-button-*` tokens + `.module.sass`), not ad-hoc `:active` scale in feature globals.

### Validation

IconButton / glass-control UI work follows **Mobile viewport coverage** (three widths) and the **Visual Acceptance Gate** before 🟢 **Pode seguir**.

Full gate rules: `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **Visual Acceptance Gate for UI tasks**.

## UI Visual Lab (official policy)

**Purpose:** temporary visual validation for components with external references or sensitive micro-interactions. The lab is a **disposable validation tool by default**, not a permanent area of the application.

### Default: temporary lab

| Rule | Policy |
|------|--------|
| **Default lifecycle** | Lab exists **only for validation** — remove after the component is validated and production implementation is **approved**. |
| **No dead code** | Labs must **not** remain in the app as unused routes, reference components, or styles after the round closes. |
| **Permanent showcase** | Allowed **only** with **explicit user authorization**. Document reason and scope in proof or a permanent policy doc. |
| **Naming** | Temporary labs use clear disposable naming (`tmp-*` subroute prefix or equivalent) or are removed before commit/PR. |
| **Base route** | `/[locale]/hy-ui-lab` — internal visual QA only. **Not product.** |
| **Product navigation** | Lab routes **must not** appear in BottomNav, menus, or any real product chrome. |
| **Product isolation** | Lab must **not** alter mocks, auth, real routes, or product data. |

### Lab cleanup (mandatory after approved implementation)

When the component is validated and the authorized production variant is applied:

1. **Remove** temporary lab subroute(s).
2. **Remove** temporary reference/proposal components.
3. **Remove** lab-only style files.
4. **Remove** unversioned screenshots/output from the working tree under `output/ui-lab/`, `output/playwright/`, `.playwright-qa/` when they are lab artifacts (these paths are not committed).
5. **Remove or archive** temporary docs that are not permanent policy.
6. **Keep** only useful documentation for the approved component (e.g. `docs/design/<component>.md`) when it adds lasting value.

If the user explicitly authorizes a **permanent internal showcase**, document authorization, scope, and maintenance owner in proof — do not treat it as default.

### Lab tests (on demand — not by default)

| Rule | Policy |
|------|--------|
| **Default** | Do **not** create versioned lab/visual tests automatically on every UI task. |
| **Create a lab test only when** | User explicitly requests it; full visual validation flow requires it; integration test is necessary; high visual regression risk; component is global/reusable **and** user approves CI cost. |
| **Before suggesting a test** | Explain cost/benefit; ask for authorization if not clearly requested. |
| **Simple lab rounds** | May use manual QA or **ad hoc Playwright** (screenshots under `output/ui-lab/`) without adding a permanent test file. |
| **CI cost** | Main pipeline must not slow down because of disposable lab tests. |

Existing versioned visual specs (e.g. for components already in CI) may remain until explicitly retired — new specs follow the rules above.

### Route and scope (during validation)

### Literal references vs production

1. **Literal visual references** (HTML/CSS copied from DevTools, Figma pixel dumps, screenshot overlays) live **first** in the lab — never directly on product routes.
2. **Production** must **not** receive literal reference values without adaptation through `--hy-*` tokens and consumer context (size role, shell, safe-area).
3. Each lab page renders **reference** and **actual** (production component) **side by side** in deterministic rows/states for screenshots.

### Mandatory workflow (components with visual reference)

```
lab automático → gate visual → menu de decisão → autorização curta → implementar variante autorizada → limpar lab → revalidar rota real
```

**Applies when:** task is `visual-regression`, `mobile-ui`, `styling`, or component/UI with an external visual reference — use UI Visual Lab when applicable (see `docs/agents/AGENTS-WORKFLOW.md` → **UI Visual Lab — automated workflow**).

| Task type | Scope rule |
|-----------|------------|
| **Lab-only task (phase 1)** | Create or extend lab + reference + actual side by side + Playwright gate + evidence + auto-open lab. **Do not** change production. |
| **Decision menu (phase 2)** | Present options + recommendation; **stop** — no production until user authorizes one option. |
| **Authorized implement (phase 3)** | Change production **only** for the authorized variant. **Do not** alter literal reference. Re-run gate + consumer validation. |
| **Consumer integration** | Only after lab gate **PASS**, evidence saved, menu delivered, **and** short or full user authorization. |

#### Phase 1 — Lab automático (sem produção)

O agente executa **sem** pedir prompt longo ao usuário:

- criar/melhorar rota-lab em `/[locale]/hy-ui-lab/<component>`;
- criar referência visual literal no lab;
- renderizar componente real (`actual`) ao lado da referência;
- fundo colorido e rolável quando glass/transparência;
- rodar Playwright visual e salvar em `output/ui-lab/<component>/`;
- abrir automaticamente a rota-lab no navegador (ou entregar comando exato).

**Proibido na fase de lab:** componente compartilhado de produção, hooks, estilos de produção, consumidores, mocks, rotas reais.

#### Phase 2 — Menu de decisão (obrigatório)

Ao terminar a fase de lab, o agente **deve** entregar o bloco **Menu de decisão** (formato abaixo). Deve declarar qual variante **recomenda** e **por quê**. Não implementar produção até autorização explícita.

#### Phase 3 — Após autorização

Somente depois de autorização curta ou completa: implementar **uma** variante, não alterar referência literal, re-rodar gate se lab ainda existir, validar rota real, **limpar lab temporário** (ver **Lab cleanup**), abrir rota real, parar antes de commit.

### Explicit authorization for production implementation (mandatory)

**Purpose:** prevent a lab reference or experimental variant from reaching production without **nominal human approval**. Agents may create labs, run gates, and generate options — but **must not** apply any variant to production until the user authorizes it in writing.

| # | Rule |
|---|------|
| 1 | **UI Visual Lab** may be created and executed **without** altering production code, routes, mocks, or consumers. |
| 2 | **Literal visual references** (HTML/CSS from DevTools, Figma pixel dumps, screenshot overlays) stay **in the lab** until approval — never land on product routes first. |
| 3 | **Production** (shared component, hook, styles, or consumer) may change **only after explicit user authorization** for one named variant. |
| 4 | Authorization **must** state: **approved variant name**, **authorized scope**, **target component or route**, and **prohibitions maintained** (what must not change). |
| 5 | The agent **must not** choose which variant to implement in production on its own. |
| 6 | The agent **must not** apply **all** variants — only the **one** variant the user authorized. |
| 7 | The agent **must not** alter the **literal reference** in the lab during authorized production implementation. |
| 8 | For **glass / transparency / light-mode** components, the lab **must** include a **colored, scrollable background** passing behind the control so transparency and blur are visible — not a flat neutral canvas alone. |
| 9 | When a **lab-only** task finishes, the agent **must** open the lab route in the browser automatically when the environment allows. |
| 10 | When an **authorized implementation** task finishes, the agent **must** open automatically: the component **lab route** and the **real affected route** (e.g. `/pt-BR/cargas`). |
| 11 | If the environment cannot open a browser, the agent **must** deliver the **exact commands** (URL + viewport when relevant) for the user to run. |
| 12 | Captain closeout **🟢 Pode seguir** on **authorized visual implementation** is allowed **only** when: the **approved variant** was implemented; visual gate **PASS**; **real consumer route PASS**; **temporary lab removed** (or permanent lab explicitly authorized); browser/preview opened **or** exact command delivered; **evidence saved** under `output/ui-lab/<component>/` when used (or cited equivalent). |

### Transparent / glass / light-mode validation (mandatory)

When a UI Lab validates **transparent**, **glass**, or **light-mode chrome** controls:

| Rule | Requirement |
|------|-------------|
| **Backdrop** | White or flat gray alone is **not** sufficient. Use a Hydri DS v2 light canvas: soft blue-gray base, wide gentle gradients, subtle aqua/blue/green halos, translucent cards, light hydro-route lines — aligned with `mobile-product-v2-light-shell`, not abstract neon bands. |
| **Scroll scenario** | Include a dedicated section with `data-ui-section="transparency-scroll"`, `data-ui-scroll-surface`, `data-ui-reference-scroll-button`, `data-ui-actual-scroll-button`. Content must scroll **behind** fixed/sticky buttons with enough height for real scroll. |
| **Contrast proof** | Show colored cards, gradients, and decorative lines passing behind the control; include opaque vs glass contrast when useful. |
| **Visual gate** | Playwright (or equivalent) must capture infrastructure mode, transparency scroll mode, and production equivalence mode. Transparency mode must validate **backdrop + scroll**, not layout-only. |
| **PASS bar** | Without colored scrollable backdrop and scroll evidence, the visual gate **cannot** close as PASS / 🟢. |

Reference implementation: `/[locale]/hy-ui-lab/icon-button` → **Transparency Scroll Test**; `docs/design/icon-button-glass.md`.

#### Standard authorization command (user → agent)

The user may paste or adapt this template. The agent treats it as the **only** valid production gate when scope is implementation:

```text
Autorizo implementar a variante: <nome-da-variante>
Escopo autorizado: <componente/rota>
Não alterar outras variantes.
Não alterar a referência literal.
Aplicar somente no componente global/consumidor indicado.
Rodar validação completa e abrir a rota automaticamente ao final.
Não fazer commit sem confirmação.
```

Without a message matching this intent (variant name + scope + prohibitions), the agent **stops at lab delivery** — closeout **🟡** maximum for lab-only work; **🔴** if production was changed without authorization.

#### Short authorization (autorização curta)

Valid user replies — no long template required:

| User reply | Effect |
|------------|--------|
| `Autorizo opção A.` (or B, C, D, E) | Execute **only** that menu option |
| `Autorizo implementar a variante: <nome>.` | Phase 3 for the named variant (must match a menu entry) |
| `Abortar.` | Rollback / discard current round; no production changes |
| `Refazer comparação.` | Re-run visual gate, refresh evidence, re-emit decision menu |

`looks good`, silence, or emoji-only reactions **are not** authorization.

#### Menu de decisão (mandatory format)

After phase 1 (lab + gate + evidence), emit this block **verbatim in structure** — fill placeholders per component. Add options B, D, E when applicable; minimum A + C required.

```md
## Menu de decisão

Recomendação: opção <X> — <motivo curto>

A) Implementar variante: <nome>
Escopo: <arquivos/rotas>
Arquivos prováveis: <lista curta>
Risco: <baixo|médio|alto>
Validação: npm run lint, npm run typecheck, npm run check:i18n; lab gate; preview em <rota-real>

B) Implementar variante: <outro-nome>
Escopo: <arquivos/rotas>
Arquivos prováveis: <lista curta>
Risco: <baixo|médio|alto>
Validação: <comandos>

C) Ajustar apenas o lab
Escopo: <arquivos do lab>
Arquivos prováveis: src/app/[locale]/hy-ui-lab/<component>/…
Risco: baixo
Validação: lab gate; reabrir rota-lab

D) Abortar/rollback
Escopo: desfazer alterações da rodada atual
Risco: baixo
Validação: nenhuma em produção

E) Pedir nova comparação
Escopo: re-rodar Playwright e atualizar evidências em output/ui-lab/<component>/
Risco: baixo
Validação: lab gate nos três tamanhos mobile quando aplicável

Para continuar, responda:
'Autorizo opção A.'
ou
'Autorizo implementar a variante: <nome>.'
ou
'Ajustar apenas o lab.'
ou
'Abortar.'
ou
'Refazer comparação.'
```

**Each option must include:** variant name (when applicable), scope, probable files, risk, validations to run.

**Agent must:** name the recommended option and give a short reason; **never** implement a production variant without explicit user authorization.

#### Auto-open browser (when lab phase completes)

| OS | Command |
|----|---------|
| macOS | `open http://localhost:3000/pt-BR/hy-ui-lab/<component>` |
| Windows | `start http://localhost:3000/pt-BR/hy-ui-lab/<component>` |
| Linux | `xdg-open http://localhost:3000/pt-BR/hy-ui-lab/<component>` |

After **authorized** production work, also open the real consumer route (e.g. `open http://localhost:3000/pt-BR/cargas`). If the shell cannot open the browser, deliver the exact command in proof and Captain closeout.

#### Agent behavior summary

| Phase | Agent may | Agent must not |
|-------|-----------|----------------|
| Explore / lab | Create lab, references, variants, Playwright gate, evidence | Touch production component or consumers |
| Present options | Show PASS/FAIL matrix, screenshots, variant names | Pick a winner or merge variants into production |
| Await authorization | Summarize options; cite lab URL and evidence paths | Assume silence or "looks good" is approval |
| Authorized implement | Apply **one** approved variant to authorized scope only; **clean up temporary lab** | Change literal reference; apply other variants; expand scope; leave validated tmp lab in tree |
| Close | Open lab + real route (or deliver commands); save evidence; run full validation | Close 🟢 without lab + consumer + evidence + preview |

### Playwright evidence

- Save ad hoc screenshots and reports under `output/ui-lab/<component>/` (not versioned; remove from working tree when lab is cleaned up).
- Reports should include PASS/FAIL per viewport and essential state when a gate is run.
- Three mobile widths required when the component ships on mobile: 360×740, 390×844, 430×932.
- Prefer ad hoc Playwright over new versioned test files unless [Lab tests (on demand)](#lab-tests-on-demand--not-by-default) criteria apply.

### Closeout coupling

Captain closeout **🟢 Pode seguir** on visual UI work requires **all** of:

1. **Explicit user authorization** received when production was changed (variant name + scope + prohibitions) — lab-only tasks exempt.
2. Lab visual gate **passed** (when a lab exists for the component).
3. Real consumer route **passed** (perceptual match on the page where users see it).
4. Evidence generated (screenshots/report paths in proof).
5. Lab route and real route **opened in browser** or **exact preview commands** delivered.

**Lab-only delivery** → 🟢 only if scope was lab-only, gate + evidence are complete, and lab route was opened or command delivered. **No authorization required** for lab-only.

**Authorized production implementation** → 🟢 only when rules 1–5 above are satisfied **and** temporary lab is removed (or permanent lab explicitly authorized). Skipping lab when validation requires it → **🟡** minimum. Production change without authorization → **🔴 Para agora**. Validated temporary lab left in code → **🔴 Para agora**.

Full gate rules: `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **Visual Acceptance Gate** and **UI Visual Lab closeout**.

### IconButton Visual Lab (example)

Do **not** land DevTools literal sizing (e.g. global **76px** shell) on production routes first.

1. **Lab route (temporary):** e.g. `/[locale]/hy-ui-lab/tmp-icon-button` or `/hy-ui-lab/icon-button` during validation — `ReferenceIconButton` (literal) beside production `IconButton`.
2. **States:** idle, pressed, release, focus, scroll background — deterministic rows for screenshots.
3. **Evidence:** ad hoc Playwright or manual capture → `output/ui-lab/icon-button/` + optional `report.md` (PASS/FAIL). Versioned spec only if user approves CI cost.
4. **Compare physics** (blur, glow, press/release, focus) — **not** production width = reference width; log scale delta separately.
5. **After approved implement:** remove temporary lab artifacts per **Lab cleanup**.

See `docs/design/icon-button-glass.md` → **Visual Lab Gate**.

## Visual Acceptance Gate for UI tasks

**Mandatory for all UI categories** (`mobile-ui`, `styling`, `visual-regression`, sheets, nav, accessibility on visible UI, etc.).

🟢 **Pode seguir** on UI work requires **perceptual** proof — the running app on the **real consumer route** must match the reference. Lint, typecheck, unit tests, and DOM/`getComputedStyle` checks are necessary but **not sufficient** for green closeout.

### Hard blocks on 🟢

Captain closeout **🟢 is forbidden** when:

1. The user reports visual mismatch still present.
2. Proof is only DOM/computed style (no screenshot, video, or live preview on consumer).
3. **Why it may still be wrong** affects the in-scope component.
4. **Not validated** on essential states: idle, pressed, release, scroll, `focus-visible`, disabled (when applicable).
5. Legacy mixin, old skin, or parallel variant can still affect the component visual.
6. Forbidden scope blocked the consumer where the bug appears.
7. Mobile task missing any of 360×740, 390×844, 430×932.
8. User gave a visual reference but no comparison was done.
9. Screenshots/video contradict the claim.
10. Any anti-false-green phrase appears without visual disproof (see proof doc).
11. Official **UI Visual Lab** was required but skipped, failed, or has no evidence — or validated **temporary lab** was left in code without permanent authorization.
12. Lab passed but real consumer route was not validated perceptually.
13. Lab test added without explicit request/justification when not meeting [Lab tests](#lab-tests-on-demand--not-by-default) criteria.

Use **🟡** or **🔴** and name the exact blocker.

### Visual comparison matrix (required in proof)

| Reference behavior | Actual behavior | Pass/Fail | Evidence | File / consumer |
|--------------------|-----------------|-----------|----------|-----------------|
| … | … | pass \| fail \| not tested | screenshot, video, route + step | component + real page/shell |

### IconButton / glass — minimum matrix rows

| State | Verify |
|-------|--------|
| Idle transparency | Glass at rest |
| Pressed button scale | `--hy-icon-button-press-scale` perceptible |
| Pressed icon jump | translateY / icon scale |
| Pressed glow | Inner glow on press |
| Release → idle | Smooth return; no stuck press |
| Scroll transparency | Correct while scrolling |
| `focus-visible` | Keyboard ring |
| No native tap highlight | No blue/gray flash on tap |

### User says it is still wrong

Treat as **🔴 visual regression**: reopen audit, include real consumer in scope, require visual root cause — do not defend prior technical-only proof.

## Design tokens (`--hy-*` — mandatory)

| Rule | Policy |
|------|--------|
| **New tokens** | **Mandatory** `--hy-*` prefix. |
| **Component shape** | `--hy-<component>-<property>` (e.g. `--hy-icon-button-size`, `--hy-bottom-nav-height`, `--hy-search-field-surface`). |
| **Touched legacy tokens** | Migrate to `--hy-*` when safe (update definition + all usages; avoid unnecessary duplicate aliases; validate visually when UI-affecting). |
| **Unsafe migration** | Document as follow-up; **do not** create new tokens outside the pattern. |
| **Bulk rename** | Forbidden in unrelated drive-by refactors. |

**Examples:** `--hy-icon-button-glass-background`, `--hy-bottom-nav-glass-background`, `--hy-bottom-nav-motion-icon-jump-duration`.

**Legacy tokens** outside this pattern (e.g. BottomNav `--bn-*`, theme `--hx-*` for global palette) remain until touched — then migrate progressively to `--hy-<component>-*` for component-scoped tokens.

## Styling

- Prefer component-level CSS Modules.
- For touched/created styles, prefer `.module.sass` when possible.
- Avoid broad global CSS.
- Avoid `!important`.
- Avoid nondeterministic render values.

## BottomNav

- **Official** global mobile component (`src/shared/components/bottom-nav/`); `BottomNavLegacy` removed — shell uses `BottomNav` only.
- Active item follows **confirmed route** only; pending never moves the lens.
- Lens movement is behavior (`useBottomNavIndicator`), not static styling.
- Light mode tokens: `--bn-*` mixin in `bottom-nav-light-tokens.sass` — see `docs/design/bottom-nav-light.md`.
- Icon jump fires when route becomes active (not on pointer down); press uses separate scale feedback.
- Do not let old skins / `classNames` legados control the preview global component.

## Mobile viewport coverage (mandatory for UI work)

Any task classified with a UI category (`mobile-ui`, `bottom-nav`, `bottom-menu`, `bottom-sheet`, `filter-sheet`, `action-sheet`, `styling`, `visual-regression`, or `accessibility` when it touches visible interface) **must** validate layout on **at least three mobile widths** before claiming success.

### Required viewports

| Tier | Size | Typical device |
|------|------|----------------|
| **Small mobile** | 320×568 or 360×740 | iPhone SE, compact Android |
| **Standard mobile** | 390×844 | iPhone 14 / 15 |
| **Large mobile** | 430×932 | iPhone 14 Pro Max, large Android |

Use one size per tier. Record which size was used in `HYDRI_IMPLEMENTATION_PROOF` → **Mobile viewport coverage**.

### What to check (nav, sheets, cards, chips, search, controls)

On **each** viewport, confirm:

- text does not break awkwardly or overflow without intent;
- labels do not overlap or invade adjacent items;
- icons stay aligned with labels and hit targets;
- pills, indicators, and active lenses stay inside their container;
- content behind or beside overlays remains visible when expected;
- the last item or card is not covered by BottomNav, sheets, or safe-area insets;
- safe-area padding still works (`env(safe-area-inset-*)`);
- the primary animation or transition is perceptible (e.g. lens slide, sheet open).

### Width-dependent behavior

When a component **changes layout or density by width**, declare in proof and Captain closeout:

- **Small mobile** — what shrinks, truncates, stacks, or hides;
- **Standard mobile** — baseline behavior;
- **Large mobile** — what expands, gains spacing, or shows more content.

### Evidence

- Prefer Playwright or browser devtools at each width.
- When screenshots are taken, save or cite one per viewport (e.g. `output/playwright/<feature>-390x844.png`).
- Do **not** claim 🟢 **Pode seguir** on mobile UI if only one width was tested — use 🟡 **Segue com cuidado** and document missing widths in **Falta provar**.
- Do **not** claim 🟢 on any UI task until the **Visual Acceptance Gate** passes (see above and `AGENTS-IMPLEMENTATION-PROOF.md`).

### Captain closeout phrasing (human)

| Coverage | Prova simples |
|----------|---------------|
| All three tiers tested | "Testado em celular pequeno, médio e grande." |
| One width only | "Só testado em um tamanho, precisa revisar responsividade." |
| Two widths | "Testado em dois tamanhos; falta conferir o terceiro." |

Default preview route: `http://localhost:3000/pt-BR/cargas` (adjust per task).
