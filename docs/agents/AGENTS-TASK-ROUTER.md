# HYDRI_TASK_ROUTER

Automatic rule router for Cursor, Codex, ChatGPT, and other Hydri agents. **Classify the task before planning or implementing.** Read only the docs required for the classified categories (union when multiple apply).

## Mandatory flow

1. Read `AGENTS.md` and this file (`docs/agents/AGENTS-TASK-ROUTER.md`).
2. Classify the task into one or more categories (see below).
3. If ambiguous, **declare the assumed classification** before acting.
4. Build the **required docs** list (base + implementation if applicable + union of category docs).
5. Read every required doc. If any is **missing on disk**, **stop**, report it, and set `Can proceed: no`.
6. Plan or implement only after `Can proceed: yes`.
7. **Proceed autonomously** when the task is clear and within scope — do not ask for intermediate approval.
8. End every response with **Captain closeout** first, then the technical closing blocks (see [Captain closeout](#captain-closeout) and [Closing response](#closing-response)).

## Initial response template (required)

Emit this block at the start of planning or implementation work:

```md
## HYDRI_TASK_ROUTER

- **Task classification:** (comma-separated categories)
- **Required docs:** (deduplicated paths)
- **Docs read:** (paths actually read this session)
- **Missing docs:** (none | list)
- **Assumed scope:** (what you will touch)
- **Forbidden scope:** (what you will not touch)
- **Can proceed:** yes | no
```

Do not skip this block internally. If `Can proceed: no`, explain why in **Captain closeout** (🔴 Para agora) and stop — do not ask the user to confirm categories or doc lists.

## Autonomous execution

The agent must **take the lead** when the task is clear and within allowed scope:

- Classify the task, read required docs, and implement without asking the user to confirm categories, doc paths, or "yes, proceed".
- Do **not** request intermediate approval for routine steps inside the stated scope.

**Stop and ask the user only when:**

| Situation | Action |
|-----------|--------|
| Scope is ambiguous | State assumption; ask one focused question if it blocks work |
| Required doc is missing on disk | Report missing path; set `Can proceed: no` |
| Work must touch forbidden scope | Explain what is needed and why; wait for direction |
| Validation failed | Report failure with evidence; propose fix or narrowed scope |
| High risk cannot be mitigated in scope | Explain risk and options; wait for product/scope decision |

## Captain closeout

Every agent response must close with a **Captain closeout** — a short, decisive message written **for the user**, not for another agent. The user should understand the outcome without reading router categories, doc unions, proof levels, or validation lists.

**Do not end with a technical wall first.** The closing section must **start** with Captain closeout; technical blocks follow only when needed.

**Response order (mandatory):**

1. Work body — prose, code, diffs as needed (keep proportional; avoid textão before the closeout)
2. **Captain closeout** — user-facing decision; **always starts the closing section**
3. **Detalhes técnicos** — optional; use when technical terms add value (see below)
4. `HYDRI_TASK_ROUTER — close` — technical (optional for trivial Q&A; required for implementation and docs work)
5. `HYDRI_IMPLEMENTATION_PROOF` — technical (only when implementation happened; omit for plan/audit-only)

The user's final read must begin with **Captain closeout**, not router categories or proof fields.

### Captain closeout template (required)

Write for the user in plain language. **Prohibit technical jargon** when a human equivalent exists.

```md
## Captain closeout

🟢/🟡/🔴 [Decisão curta]

Em humano:
[1 a 3 frases curtas explicando o que aconteceu sem jargão]

Prova simples:
[1 linha com validação em linguagem simples — para UI mobile: "Testado em celular pequeno, médio e grande." ou "Só testado em um tamanho, precisa revisar responsividade."]

Falta provar:
[1 linha objetiva]

Próxima ação:
[1 ação clara]
```

Status meanings (use on the decision line, not separate "Status:" labels):

| Emoji | Decisão | When to use |
|-------|---------|-------------|
| 🟢 | **Pode seguir** | Worked and proved with sufficient evidence |
| 🟡 | **Segue com cuidado** | Partial delivery, incomplete validation, relevant risk, plan/audit without execution, or needs human review |
| 🔴 | **Para agora** | Did not work, validation failed, scope blocked, or cannot claim success |

### Avoid in Captain closeout

Do **not** use these in the user-facing block when a plain-language alternative exists:

- Internal component names (unless essential for the user's next step)
- "canônico", "light/flush", "runtime", "E2E", "flicker", "viewport", "supressão"
- "PR #…", file paths, long lists
- Router category names, proof levels (P0–P4), or raw command strings when a human phrase works

When those terms are useful for audit or handoff, put them in **Detalhes técnicos** or in `HYDRI_IMPLEMENTATION_PROOF` below.

### Detalhes técnicos (optional)

Add this section **after** Captain closeout when technical precision helps reviewers or follow-up agents — never as a substitute for the human block.

```md
### Detalhes técnicos

- [componentes, rotas, comandos exatos, níveis de prova, PR, paths — só o necessário]
```

### Status mapping

| Captain closeout | Typical mapping |
|------------------|-----------------|
| 🟢 **Pode seguir** | `HYDRI_IMPLEMENTATION_PROOF` **Result:** Worked; docs/rules created and validations passed |
| 🟡 **Segue com cuidado** | **Result:** Partial; plan or audit only (no implementation); gaps remain |
| 🔴 **Para agora** | **Result:** Did not work; or `Can proceed: no` |

**Task type rules:**

| Task type | Captain closeout | HYDRI_IMPLEMENTATION_PROOF |
|-----------|------------------|----------------------------|
| Implementation (code/config/tests) | Required; 🟢/🟡/🔴 per evidence | Full block required |
| Docs/rules only (validated) | Required; 🟢 when lint/typecheck/i18n pass | Full block when behavior of docs changed |
| Plan or audit only (no execution) | Required; **🟡 Segue com cuidado** | Omit full block; Captain closeout is enough |
| Blocked (`Can proceed: no`) | Required; **🔴 Para agora** | Omit unless partial work was delivered |

For audit-only or question-only responses with no changes: 🟢 when the answer is complete; 🟡 when gaps remain; 🔴 when blocked (e.g. missing doc).

## Closing response (required)

After **Captain closeout** (and optional **Detalhes técnicos**), end with the technical router close block:

```md
## HYDRI_TASK_ROUTER — close

- **Task classification:**
- **Required docs read:**
- **Missing docs:** (none | list)
- **Scope boundaries:** (assumed + forbidden, brief)
- **HYDRI_IMPLEMENTATION_PROOF:** (include full block when implementation happened; omit only for pure audit/question with no changes)
```

## Base docs (every task)

| Doc | Purpose |
|-----|---------|
| `AGENTS.md` | Entry point and non-negotiables |
| `docs/agents/AGENTS-TASK-ROUTER.md` | This router |
| `docs/agents/AGENTS-WORKFLOW.md` | Branching, commits, validation baseline |
| `docs/agents/AGENTS-ZERO-REDEMOINHO.md` | Operation Zero Redemoinho — architecture gate and hard rules |
| `.cursor/rules/hydri-zero-redemoinho.mdc` | Cursor enforcement for Zero Redemoinho |

## Implementation docs (every implementation task)

Any task that changes code, config, tests, or agent docs to deliver behavior:

| Doc | Purpose |
|-----|---------|
| `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` | Mandatory proof block at end |

Implementation tasks must also close with a full `HYDRI_IMPLEMENTATION_PROOF` block (see that doc).

## UI tasks (mandatory auto-routing)

Any task that touches interface must be classified with **at least one UI category** from the list below. When any UI category applies, the agent must **union** these docs in addition to base and implementation docs:

| Doc | Purpose |
|-----|---------|
| `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` | Mobile chrome, interaction, styling baseline |
| `docs/agents/AGENTS-WORKFLOW.md` | Branching, validation baseline (also in base docs) |
| `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` | Proof block and UI checklists (also in implementation docs) |
| `.cursor/rules/hydri-ui-architecture.mdc` | Dumb components, hooks, data separation, kebab-case |

### UI categories

| Category | Scope |
|----------|--------|
| `mobile-ui` | Mobile screens, shells, layouts, touch interactions |
| `desktop-ui` | Desktop layouts, expanded map, admin chrome |
| `bottom-nav` | Bottom navigation, tab bar, mobile shell nav chrome |
| `bottom-menu` | **Alias of `bottom-nav`** — same required docs; use when the user says "bottom menu" |
| `bottom-sheet` | Bottom sheets and mobile overlays that slide from bottom |
| `filter-sheet` | **Alias of `bottom-sheet`** — filter UI in a bottom sheet |
| `action-sheet` | **Alias of `bottom-sheet`** — action menus in a bottom sheet |
| `styling` | CSS/Sass Modules, tokens, theme, visual polish |
| `visual-regression` | Visual QA, screenshot comparison, design parity |
| `accessibility` | a11y on UI — union UI auto-routing docs **when the work touches visible interface** |

### UI routing gate (stop before implement)

Before planning or patching UI code, verify:

1. At least one UI category is declared in the initial `HYDRI_TASK_ROUTER` block.
2. `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` and `.cursor/rules/hydri-ui-architecture.mdc` are in **Docs read**.

If either is missing: **stop**, add the correct categories, read the missing docs, update the router block, then proceed. Do not implement UI with incomplete routing.

### Mobile viewport coverage (automatic for UI categories)

When **any** of these categories apply — `mobile-ui`, `bottom-nav`, `bottom-menu`, `bottom-sheet`, `filter-sheet`, `action-sheet`, `styling`, `visual-regression`, or `accessibility` on visible UI — the agent must validate **at least three mobile widths** before 🟢 **Pode seguir**:

| Tier | Size |
|------|------|
| Small mobile | 320×568 or 360×740 |
| Standard mobile | 390×844 |
| Large mobile | 430×932 |

Full checklist and evidence rules: `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` → **Mobile viewport coverage**.

**Captain closeout rules:**

- All three tiers tested → 🟢 allowed **only if** [Visual Acceptance Gate](AGENTS-IMPLEMENTATION-PROOF.md#visual-acceptance-gate-for-ui-tasks) also passes; **Prova simples:** "Testado em celular pequeno, médio e grande." plus perceptual match on real consumer route.
- Only one width tested → **🟡 Segue com cuidado** (never 🟢 for mobile UI); **Prova simples:** "Só testado em um tamanho, precisa revisar responsividade."
- Two widths → 🟡 until the third is covered.
- User reports visual still wrong → **🔴 Para agora**; reopen audit; include consumer in scope — never 🟢.
- DOM/computed-style-only proof → never 🟢 for UI; use 🟡 minimum.
- Validated **temporary lab** still in code without explicit permanent authorization → **🔴 Para agora** (or **🟡** if cleanup is the stated next step).
- **Lab test** created without explicit request/justification → **🟡** minimum; **🔴** if it slows CI without approval.
- New file/folder outside **kebab-case** → **🔴 Para agora**.
- Touched file outside kebab-case not migrated nor justified → **🟡** minimum.
- New token outside **`--hy-*`** → **🔴 Para agora**.
- Touched legacy token not migrated nor justified → **🟡** minimum.
- New hardcoded UI string → **🔴 Para agora**.
- Unnamed magic number in touched code → **🟡** minimum.
- Glass/transparency without colored scrollable backdrop → **🟡** maximum.
- Docs/scripts cite removed file → **🔴 Para agora**.
- Feature/shared boundary violated → **🔴 Para agora**.
- Business flow without persona value → **🟡** minimum.
- Operation Zero Redemoinho proof fields empty on implementation → **🟡** minimum.

Record per-viewport results in `HYDRI_IMPLEMENTATION_PROOF` → **Mobile viewport coverage**. Save or cite screenshots per width when using Playwright or visual QA. UI tasks must also include **Visual comparison matrix** per Visual Acceptance Gate. Lab, naming, and token tasks must fill the proof fields in `AGENTS-IMPLEMENTATION-PROOF.md` → **Lab / naming / token proof fields**. **Every implementation task** must fill **Operation Zero Redemoinho proof fields**.

### UI architecture (summary)

Full rules: `.cursor/rules/hydri-ui-architecture.mdc` and `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`.

- Dumb/semantic presentational components when possible.
- Movement, measurement, timers, resize, derived state, effects → hook/helper in component/feature scope.
- Items, labels, icons, metadata → separate file in scope when non-trivial.
- Styles → `.module.sass` for new/touched files when safe; no global CSS for components.
- Prefer React refs and local CSS variables over `querySelector` / `document.documentElement`.
- **kebab-case** mandatory for new/touched files and folders when migration is safe; no mass rename without approval; PascalCase React exports OK.
- **UI Visual Lab** is **temporary by default** — remove after validation + approved implementation unless the user explicitly authorizes a permanent showcase.
- **`--hy-*`** mandatory for new/touched CSS tokens; migrate legacy tokens when safe.
- **No new legacy naming** (`legacy`, `v2`, `dev-v2`, `new`, `old`, `tmp-*` in production); `tmp-*` only for disposable lab work, removed before commit/PR.

## Task categories and required docs

When multiple categories apply, **union** all doc paths and deduplicate. **UI categories** also trigger [UI tasks auto-routing](#ui-tasks-mandatory-auto-routing) docs above.

### `mobile-ui`

Mobile screens, shells, layouts, touch interactions, mobile-only components.

- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
- `docs/agents/AGENTS-CURRENT-STATE.md`

### `desktop-ui`

Desktop layouts, expanded map, admin chrome, desktop-only surfaces.

- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` (architecture and styling baseline for all UI surfaces)
- `docs/agents/AGENTS-CODEBASE-MAP.md`
- `docs/agents/AGENTS-CURRENT-STATE.md`

### `bottom-nav`

Bottom navigation, tab bar, mobile shell nav chrome.

- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
- `docs/agents/AGENTS-CURRENT-STATE.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `bottom-menu`

**Alias of `bottom-nav`.** Use when the user or ticket says "bottom menu". Same required docs as `bottom-nav`.

- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
- `docs/agents/AGENTS-CURRENT-STATE.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `bottom-sheet`

Bottom sheets, filter sheets, mobile overlays that slide from bottom.

- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
- `docs/agents/AGENTS-CURRENT-STATE.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `filter-sheet`

**Alias of `bottom-sheet`.** Filter UI presented in a bottom sheet. Same required docs as `bottom-sheet`.

- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
- `docs/agents/AGENTS-CURRENT-STATE.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `action-sheet`

**Alias of `bottom-sheet`.** Action menu presented in a bottom sheet. Same required docs as `bottom-sheet`.

- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
- `docs/agents/AGENTS-CURRENT-STATE.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `cargo-domain`

Cargas list, filters, minhas cargas, cargo mocks and business rules.

- `docs/agents/AGENTS-HYDRI-CONTEXT.md`
- `docs/agents/AGENTS-CODEBASE-MAP.md`

### `hydroway-domain`

Hydroway map, vessels, waterway routing and related product context.

- `docs/agents/AGENTS-HYDRI-CONTEXT.md`

### `i18n`

Locales, next-intl messages, copy, `/[locale]` routes.

- `docs/i18n.md`
- `docs/agents/AGENTS-WORKFLOW.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `styling`

CSS/Sass Modules, tokens, theme, visual tokens — non-domain UI polish.

- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
- `docs/theme.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `testing`

Unit, integration, E2E, test matrices, QA automation.

- `docs/testing.md`
- `docs/QA-TEST-MATRIX.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `ci-pr`

CI gates, PR hygiene, branch checks, release quality.

- `docs/CI-QUALITY-GATES.md`
- `docs/agents/AGENTS-WORKFLOW.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `repo-hygiene`

Repository boundaries, cleanup, what belongs in repo vs out.

- `docs/REPOSITORY-BOUNDARY.md`
- `docs/REPO-CLEANUP.md`
- `docs/agents/AGENTS-WORKFLOW.md`

### `architecture`

System structure, ADRs, feature boundaries, cross-cutting design.

- `docs/ARCHITECTURE.md`
- `docs/agents/AGENTS-CODEBASE-MAP.md`
- `docs/agents/AGENTS-WORKFLOW.md`

### `docs-only`

Documentation-only changes (no production code).

- `docs/agents/AGENTS-WORKFLOW.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `mock-mode`

Mock users, permissions, deterministic fixtures, mock QA flows.

- `docs/MOCK-MODE-QA-HUB.md`
- `docs/MOCK-MODE-USE-CASES.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `auth`

Login, OTP, sessions, roles, security product decisions.

- `docs/ONBOARDING.md`
- `docs/SECURITY-PRODUCT-DECISIONS.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `data/API`

API contracts, database planning, API security.

- `docs/API-SECURITY-AUDIT.md`
- `docs/DATABASE-PLANNING.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `accessibility`

a11y audits, keyboard, screen readers, WCAG-related work.

- `docs/accessibility.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

When the task **touches visible UI** (components, layout, chrome, sheets, nav), also apply [UI tasks auto-routing](#ui-tasks-mandatory-auto-routing) — union `AGENTS-UI-MOBILE-STANDARDS.md` and `hydri-ui-architecture.mdc`.

### `performance`

Bundle, runtime perf, CI perf gates.

- `docs/CI-QUALITY-GATES.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `visual-regression`

Visual QA, screenshot comparison, design parity checks.

- `docs/QA-TEST-MATRIX.md`
- `docs/agents/AGENTS-WORKFLOW.md` → **UI Visual Lab — automated workflow**
- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` → **UI Visual Lab (official policy)** and **Menu de decisão**
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **UI Visual Lab closeout**

**UI Visual Lab:** `/[locale]/hy-ui-lab` is the fixed internal visual QA route (not product, not in nav). Tasks with `visual-regression`, `mobile-ui`, `styling`, or component/UI with a visual reference use the lab when applicable. **Automated flow:** lab (no production) → visual gate → **Menu de decisão** → short authorization → implement one variant → **clean up lab** → revalidate consumer. Agent auto-opens lab (and consumer after authorized implement); delivers `open` / `start` / `xdg-open` if browser unavailable. Evidence: `output/ui-lab/<component>/` (not versioned). **Labs are temporary by default** — remove after validation + approved implementation; permanent showcase only with explicit user authorization. Full policy: `AGENTS-WORKFLOW.md` and `AGENTS-UI-MOBILE-STANDARDS.md` → **Menu de decisão**.

### `ui-lab`

Create, extend, or run UI Visual Lab pages for component validation — lab routes, reference/proposal variants, Playwright ad hoc evidence, decision menu. Does **not** imply production changes.

- `docs/agents/AGENTS-WORKFLOW.md` → **UI Visual Lab — automated workflow**
- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` → **UI Visual Lab (official policy)**, **Lab cleanup**, **Lab tests (on demand)**
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **UI Visual Lab closeout**, **Lab / naming / token proof fields**

Also union [UI tasks auto-routing](#ui-tasks-mandatory-auto-routing) when the lab touches visible UI.

### `temporary-lab`

Disposable lab work that **must** be removed before commit/PR — `tmp-*` subroutes, reference/proposal components, lab-only styles, ad hoc screenshots in the working tree.

- `docs/agents/AGENTS-WORKFLOW.md` → **UI Visual Lab — automated workflow**, **Lab cleanup**
- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` → **UI Visual Lab (official policy)**, **Lab cleanup**
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **UI Visual Lab closeout**, **Lab / naming / token proof fields**

**Auto-detect:** classify `temporary-lab` when the task creates or uses `tmp-*` routes, one-off lab subroutes for a single validation round, or disposable reference/proposal files intended for removal after approval.

### `naming-hygiene`

File/folder naming, kebab-case migration on touch, prohibition of new legacy naming (`legacy`, `v2`, `dev-v2`, `new`, `old`, `tmp-*` in production).

- `docs/agents/AGENTS-WORKFLOW.md`
- `.cursor/rules/hydri-ui-architecture.mdc`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **Kebab-case audit**

**Auto-detect:** classify `naming-hygiene` when the task creates, renames, or touches files/folders under `src/`, `docs/` (new technical files), or agent rules.

### `token-hygiene`

CSS custom property naming, `--hy-*` migration on touch, component token shape `--hy-<component>-<property>`.

- `docs/theme.md`
- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` → **Design tokens (`--hy-*`)**
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **`--hy-*` token audit**

**Auto-detect:** classify `token-hygiene` when the task creates, renames, or touches CSS/Sass tokens, theme docs, or component-level CSS variables.

### `zero-redemoinho-gate`

Mandatory pre-implement audit — search for existing pattern before creating anything new. Applies to **every implementation task** (code, config, tests, agent docs that change behavior).

- `docs/agents/AGENTS-ZERO-REDEMOINHO.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **Operation Zero Redemoinho proof fields**
- `.cursor/rules/hydri-zero-redemoinho.mdc`

**Auto-detect:** always union this category when the task implements or fixes behavior (not pure Q&A with no changes).

### `magic-number-hygiene`

Numeric literals in TS/TSX/Sass that represent durations, delays, thresholds, offsets, z-index, breakpoints, heights, or recurring spacing.

- `docs/agents/AGENTS-ZERO-REDEMOINHO.md` → **Magic numbers**
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **Magic number audit**

**Auto-detect:** classify when the task adds or touches unexplained numeric literals in source or styles.

### `doc-hygiene`

Documentation, workflows, agent rules, README, ADRs, or export scripts that must stay aligned with the codebase.

- `docs/agents/AGENTS-ZERO-REDEMOINHO.md` → **Documentation hygiene**
- `docs/agents/AGENTS-WORKFLOW.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **Dead code/docs/scripts audit**

**Auto-detect:** classify when removing routes/components/scripts, adding ADRs, or updating agent docs/rules.

### `feature-boundary`

Moving or creating components across `src/features/` vs `src/shared/`; shared depending on feature-specific rules.

- `docs/ARCHITECTURE.md`
- `docs/feature-scope-audit.md`
- `docs/agents/AGENTS-ZERO-REDEMOINHO.md` → **Feature ownership**
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **Feature/shared boundary audit**

**Auto-detect:** classify when creating/moving shared components or when shared imports feature domain types/rules.

### `glass-ui`

Transparent, frosted, glass, bubble, rim, glow, or backdrop-filter UI — requires colored scrollable validation backdrop.

- `docs/agents/AGENTS-ZERO-REDEMOINHO.md` → **Transparent/glass auto-detection**
- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **Visual Acceptance Gate** (L6 glass backdrop)

**Auto-detect:** classify when styles or tokens match transparency signals: `backdrop-filter`, `rgba` alpha, `transparent`, `blur`, `glass`, `frosted`, `bubble`, `--hy-*-glass-*`, `--hy-*-surface`, `--hy-*-rim`, `--hy-*-glow`, etc.

### `persona-value`

Business flows, mocks, or UX that must declare value for embarcador, transportador, operador portuário, admin, etc.

- `docs/business-rules.md`
- `docs/agents/AGENTS-HYDRI-CONTEXT.md`
- `docs/agents/AGENTS-ZERO-REDEMOINHO.md` → **Mocks e domínio**
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **Persona/value impact**

**Auto-detect:** classify when the task adds/changes user-facing flows, mocks, roles, or cargo/hydroway domain behavior.

## Classification rules

| Situation | Action |
|-----------|--------|
| Single clear category | Use that category only |
| Multiple categories | Union all required docs |
| Ambiguous scope | Pick best-fit categories, **state assumption** in initial template |
| Audit / read-only question | Minimum: base docs; add categories that match the audit subject |
| Patch / ZIP import | Add `docs/agents/AGENTS-PATCH-PROTOCOL.md` to required docs |
| User forbids scope | List under **Forbidden scope**; do not expand |

## Quick category hints

| User intent | Likely categories |
|-------------|-------------------|
| Fix mobile cargas filter sheet | `mobile-ui`, `bottom-sheet`, `cargo-domain`, `i18n` |
| Desktop expanded map | `desktop-ui`, `hydroway-domain`, `architecture` |
| New translation keys | `i18n` |
| BottomNav redesign | `mobile-ui`, `bottom-nav` |
| Bottom menu glass effect / active lens | `mobile-ui`, `bottom-menu`, `styling`, `visual-regression` |
| UI Visual Lab policy or new lab subroute | `docs-only`, `ui-lab`, `visual-regression`, `styling` |
| UI Visual Lab automated workflow / decision menu | `docs-only`, `ui-lab`, `visual-regression`, `styling` — see `AGENTS-WORKFLOW.md` |
| Disposable lab / tmp-* experiment | `ui-lab`, `temporary-lab`, `visual-regression` — remove before commit/PR |
| IconButton / glass before production | `mobile-ui`, `styling`, `visual-regression`, `ui-lab` — lab first; menu de decisão; cleanup after approved implement |
| Rename file to kebab-case / naming audit | `naming-hygiene`, `architecture` (when structural) |
| Migrate CSS token to `--hy-*` | `token-hygiene`, `styling` |
| Add mock persona | `mock-mode`, `auth` |
| CI failing on PR | `ci-pr`, `testing` |
| Agent docs / rules only | `docs-only`, `doc-hygiene`, `zero-redemoinho-gate` |
| Governance / anti-duplication rules | `docs-only`, `doc-hygiene`, `architecture`, `zero-redemoinho-gate` |
| Glass / transparency tuning | `mobile-ui`, `styling`, `glass-ui`, `visual-regression`, `ui-lab` |
| Magic number cleanup in component | `magic-number-hygiene`, `styling` or relevant UI category |
| Move component to shared | `feature-boundary`, `architecture`, `zero-redemoinho-gate` |
| New business flow / mock persona | `mock-mode`, `persona-value`, `cargo-domain` or `auth` |

## Missing doc protocol

1. Verify path relative to repo root.
2. If file does not exist: set `Missing docs`, `Can proceed: no`.
3. Report missing paths to the user; do not invent content or skip silently.
4. Resume only after the doc exists or the user narrows scope.

## Related agent docs (on demand)

Not in every task — add when classification or user request requires:

- `docs/agents/AGENTS-ORCHESTRATOR.md` — orchestration and task typing
- `docs/agents/AGENTS-PATCH-PROTOCOL.md` — ZIP / patch imports
- `docs/workflows/codex-visual-iteration.md` — visual iteration rounds
- `docs/workflows/desktop-expanded-map-playbook.md` — desktop map work

## Validation baseline

For implementation tasks, run before claiming success:

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

See `docs/agents/AGENTS-WORKFLOW.md` and `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`.

## Examples: Captain closeout (required closing format)

### 🟢 Pode seguir — implementation or docs validated

```md
## Captain closeout

🟢 Pode seguir

Em humano:
As regras de fechamento agora pedem uma mensagem curta para você antes dos detalhes técnicos. A documentação foi atualizada e as checagens principais passaram.

Prova simples:
As validações automáticas do projeto passaram sem erro.

Falta provar:
Se agentes reais vão seguir o novo formato em tarefas do dia a dia.

Próxima ação:
Rodar uma tarefa real e confirmar que o fechamento ficou legível.

### Detalhes técnicos

- Arquivos: `AGENTS-TASK-ROUTER.md`, regras Cursor em `.cursor/rules/`
- Comandos: `npm run lint`, `npm run typecheck`, `npm run check:i18n` — exit 0
```

### 🟡 Segue com cuidado — plan or audit without execution

```md
## Captain closeout

🟡 Segue com cuidado

Em humano:
A tela mobile de cargas está usando o BottomSheet certo. O antigo ainda existe no projeto, mas não está atrapalhando essa tela. Falta confirmar no navegador se o fechamento está suave.

Prova simples:
Validações principais passaram e os testes unitários da área passaram.

Falta provar:
Teste visual no navegador e teste de abrir/fechar automatizado.

Próxima ação:
Fazer um ajuste pequeno no BottomSheet e rodar validação visual.

### Detalhes técnicos

- Rota de preview: `/pt-BR/cargas`
- Componente legado ainda presente; não bloqueia a tela atual
- E2E de open/close não executado nesta rodada
```

### 🔴 Para agora — blocked or failed

```md
## Captain closeout

🔴 Para agora

Em humano:
Não dá para implementar ainda — falta um documento obrigatório no repositório. Nada de código foi alterado.

Prova simples:
Confirmei que o arquivo esperado não existe no disco.

Falta provar:
Qualquer mudança de estilo ou comportamento.

Próxima ação:
Restaurar o documento ausente ou autorizar trabalho sem ele.

### Detalhes técnicos

- Doc ausente: `docs/theme.md`
- `Can proceed: no` no router inicial
```

### Example: Bottom menu task (classification + required docs)

User request: *"Ajustar o efeito glass do menu inferior e o indicador ativo no mobile."*

```md
## HYDRI_TASK_ROUTER

- **Task classification:** mobile-ui, bottom-menu, styling, visual-regression
- **Required docs:** AGENTS.md, AGENTS-TASK-ROUTER.md, AGENTS-WORKFLOW.md, AGENTS-IMPLEMENTATION-PROOF.md, AGENTS-UI-MOBILE-STANDARDS.md, AGENTS-CURRENT-STATE.md, docs/theme.md, QA-TEST-MATRIX.md, .cursor/rules/hydri-ui-architecture.mdc
- **Docs read:** (list paths actually read this session)
- **Missing docs:** none
- **Assumed scope:** bottom navigation chrome on mobile; styles and indicator behavior only
- **Forbidden scope:** desktop layout, globals.scss, mass file renames
- **Can proceed:** yes
```

`bottom-menu` resolves to the same doc union as `bottom-nav`, plus UI auto-routing and category-specific docs (`styling` → `docs/theme.md`; `visual-regression` → `docs/QA-TEST-MATRIX.md`).

### Full response ending (docs-only with implementation proof)

After Captain closeout (and optional Detalhes técnicos), add technical blocks when implementation or validated docs work happened:

```md
## HYDRI_TASK_ROUTER — close

- **Task classification:** docs-only
- **Required docs read:** AGENTS.md, AGENTS-TASK-ROUTER.md, AGENTS-WORKFLOW.md, AGENTS-IMPLEMENTATION-PROOF.md
- **Missing docs:** none
- **Scope boundaries:** agent docs and cursor rules only; no production code
- **HYDRI_IMPLEMENTATION_PROOF:** (full block below)

## HYDRI_IMPLEMENTATION_PROOF

**Result:** Worked
…
```
