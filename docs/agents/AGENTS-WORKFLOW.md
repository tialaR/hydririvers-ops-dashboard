# Hydri Workflow

## Task routing (mandatory)

Before planning or implementing, run **HYDRI_TASK_ROUTER**: classify the task, read the required docs for all matching categories, and emit the initial router block. See `docs/agents/AGENTS-TASK-ROUTER.md`.

### Operation Zero Redemoinho (every implementation)

1. Read `docs/agents/AGENTS-ZERO-REDEMOINHO.md` and `.cursor/rules/hydri-zero-redemoinho.mdc`.
2. **Architecture Gate:** search for existing pattern/component/token/mock/doc before creating.
3. Fill **Operation Zero Redemoinho proof fields** at closeout — see `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`.

### UI tasks

When the task touches interface (mobile, desktop, nav, sheets, styling, visual QA, or a11y on UI):

1. Classify with at least one UI category (`mobile-ui`, `desktop-ui`, `bottom-nav`, `bottom-menu`, `bottom-sheet`, `filter-sheet`, `action-sheet`, `styling`, `visual-regression`, or `accessibility` on visible UI).
2. Read the [UI auto-routing doc union](AGENTS-TASK-ROUTER.md#ui-tasks-mandatory-auto-routing): `AGENTS-UI-MOBILE-STANDARDS.md`, `AGENTS-WORKFLOW.md`, `AGENTS-IMPLEMENTATION-PROOF.md`, `.cursor/rules/hydri-ui-architecture.mdc`.
3. **Stop before implementing** if UI standards or the UI architecture rule were not read — fix routing first.
4. New or touched files: **mandatory kebab-case** when migration is safe; no mass rename without approval; no new legacy naming (`legacy`, `v2`, `dev-v2`, `new`, `old`, production `tmp-*`).
5. New or touched component CSS tokens: **mandatory `--hy-*`**; migrate legacy tokens when safe.

## Branching

- Work from `dev`.
- Update `dev` first.
- Update current branch from `dev` before patching.
- Use Conventional Branches in English.
- Open PRs to `dev`.
- Prefer small scoped PRs.

## Commits

Use Conventional Commits:
- `feat:` for product changes
- `fix:` for bugs
- `refactor:` for internal changes
- `docs:` for documentation
- `test:` for tests
- `chore:` for tooling

## UI Visual Lab — automated workflow (official)

**Purpose:** agents create or improve a **temporary** lab, run the visual gate, open the browser automatically, and deliver a **decision menu** with short authorization — without requiring a long user prompt. **Production changes only after the user authorizes one specific option.** **Remove the lab after approved implementation** unless the user explicitly authorizes a permanent showcase.

Full policy: `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` → **UI Visual Lab**, **Lab cleanup**, **Lab tests (on demand)**. Closeout rules: `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **UI Visual Lab closeout**, **Lab / naming / token proof fields**.

### When to use the lab (mandatory when applicable)

Tasks classified as **`visual-regression`**, **`mobile-ui`**, **`styling`**, or **component/UI with a visual reference** must use **UI Visual Lab** when:

- the component has an external reference (Figma, DevTools dump, screenshot, video);
- micro-interactions are sensitive (glass, press/release, glow, scroll transparency);
- an official lab subroute already exists for the component.

Skip the lab only when the change is copy-only, non-visual logic, or explicitly out of visual scope — state why in the router block.

### Phases

| Phase | Agent may | Production | User authorization |
|-------|-----------|------------|-------------------|
| **1 — Lab (automatic)** | Create/improve **temporary** lab subroute; literal reference; actual beside reference; colored scrollable background for glass/transparency; ad hoc Playwright or manual gate; save screenshots under `output/ui-lab/<component>/`; auto-open lab URL | **Forbidden** | Not required |
| **2 — Decision menu** | Present numbered/named options with evidence; declare recommended variant and why | **Forbidden** | Not required — agent **stops here** until user replies |
| **3 — Authorized implement** | Apply **one** authorized variant only; re-run gate if lab still exists; validate real consumer route; **clean up temporary lab**; auto-open real route; run lint/typecheck/i18n; **stop before commit** | **Allowed** — authorized scope only | **Required** — short or full form (see below) |
| **4 — Lab cleanup** | Remove tmp lab route, reference/proposal components, lab styles, working-tree screenshots; record removal in proof | N/A | N/A — mandatory after phase 3 unless permanent lab authorized |

**Agent must not:** implement any production variant without authorization; pick the winner alone; apply all variants; alter the literal reference during phase 3; leave validated temporary lab in the tree; add versioned lab tests without explicit request/justification; close 🟢 on production visual work without consumer PASS + evidence + preview/commands + lab cleanup (when temporary).

### Phase 1 — Lab (automatic, no production)

The agent runs phase 1 **autonomously** — no long prompt from the user required. Allowed actions:

1. Create or extend `/[locale]/hy-ui-lab/<component>` — prefer **`tmp-*`** prefix for disposable validation (e.g. `tmp-icon-button`).
2. Add or update **literal reference** implementation in the lab only.
3. Render **production component** (`actual`) beside reference in deterministic rows/states.
4. For glass/transparency: add **colored, scrollable background** behind the control.
5. Run **ad hoc Playwright** or manual visual capture → save under `output/ui-lab/<component>/` (not versioned). Add a versioned test **only** when user explicitly requests or [Lab tests (on demand)](AGENTS-UI-MOBILE-STANDARDS.md#lab-tests-on-demand--not-by-default) criteria apply.
6. **Auto-open** the lab route when the dev server is reachable (see [Auto-open browser](#auto-open-browser)).

**Forbidden in phase 1:** shared production component, hooks, styles, consumers, mocks, auth, real routes. **Forbidden by default:** new versioned lab/visual test files.

### Phase 2 — Decision menu (mandatory deliverable)

At the end of phase 1, the agent **must** emit a **Menu de decisão** block (exact structure in `AGENTS-UI-MOBILE-STANDARDS.md` → **Menu de decisão**). Minimum options:

| Option | Purpose |
|--------|---------|
| **A** (or named variant) | Implement **recommended** variant in production |
| **B** (or alternate) | Implement **another** available variant |
| **C** | Adjust **lab only** (reference, layout, gate, backgrounds) |
| **D** | **Abort / rollback** current round changes |
| **E** (when useful) | **Refazer comparação** (new gate run, new evidence) |

Each option **must** include: variant name (when applicable), scope (files/routes), probable files, risk (baixo/médio/alto), validations that will run (`npm run lint`, `npm run typecheck`, `npm run check:i18n`, lab gate, consumer preview).

The agent **must** state: **Recomendação: opção &lt;X&gt; — &lt;motivo curto&gt;**.

Captain closeout after phase 2 only: **🟡 Segue com cuidado** maximum — awaiting user choice. Never 🟢 for production until phase 3 completes.

### Short authorization (user → agent)

Valid replies — no long template required:

| User says | Agent action |
|-----------|--------------|
| `Autorizo opção A.` (or B, C, …) | Execute **only** that menu option |
| `Autorizo implementar a variante: <nome>.` | Phase 3 for named variant (must match a menu option) |
| `Abortar.` | Rollback or discard current round; no production |
| `Refazer comparação.` | Re-run Playwright gate + refresh evidence; re-emit menu |

Silence, "looks good", or thumbs-up **is not** authorization.

Full authorization template (optional, still valid): `AGENTS-UI-MOBILE-STANDARDS.md` → **Explicit authorization for production implementation**.

### Phase 3 — After authorization

When the user authorizes production implementation:

1. Implement **only** the authorized variant — no other variants, no scope expansion.
2. **Do not** alter the literal reference in the lab (while lab still exists).
3. Re-run **visual gate** if lab still exists → evidence in `output/ui-lab/<component>/`.
4. Validate **real consumer route** perceptually (three mobile widths when mobile UI).
5. **Clean up temporary lab** — remove lab route, reference/proposal components, lab styles, working-tree screenshots (see `AGENTS-UI-MOBILE-STANDARDS.md` → **Lab cleanup**).
6. Run `npm run lint`, `npm run typecheck`, `npm run check:i18n`.
7. **Auto-open** real affected route (or deliver exact commands). Open lab route only if permanent lab was authorized and remains.
8. **Stop before commit** — do not commit unless the user confirms.

### Lab cleanup (phase 4 — mandatory for temporary labs)

After phase 3, before 🟢 closeout:

- Remove `tmp-*` and other disposable lab subroutes.
- Remove reference/proposal components and lab-only styles.
- Remove unversioned screenshots from working tree (`output/ui-lab/`, etc.).
- Record **Temporary lab removal status** in `HYDRI_IMPLEMENTATION_PROOF`.

Permanent showcase: only when user explicitly authorized — document scope and reason in proof.

### Auto-open browser

When `next dev` (or equivalent) is running and the environment allows shell open:

| OS | Command |
|----|---------|
| macOS | `open <url>` |
| Windows | `start <url>` |
| Linux | `xdg-open <url>` |

| Task type | URLs to open |
|-----------|--------------|
| Lab-only (phase 1–2 complete) | Lab route only — e.g. `http://localhost:3000/pt-BR/hy-ui-lab/icon-button` |
| Authorized implement (phase 3) | Lab route **and** real consumer — e.g. `http://localhost:3000/pt-BR/cargas` |

If auto-open fails, deliver the **exact command(s)** above in Captain closeout **Detalhes técnicos** and in `HYDRI_IMPLEMENTATION_PROOF` → **Preview / manual QA**.

### 🟢 Captain closeout — when allowed

| Scenario | 🟢 allowed when |
|----------|-----------------|
| Lab-only (phase 1, no menu yet) | Lab + gate + evidence complete; lab opened or command delivered; decision menu delivered when phase 1 complete |
| After decision menu (phase 2) | **Never 🟢** — 🟡 awaiting authorization |
| Authorized implement (phase 3 + cleanup) | Real consumer **PASS**; evidence saved; **temporary lab removed** (or permanent lab explicitly authorized); real route opened or commands delivered; **no** user-reported visual divergence; no unapproved lab test added |

See `AGENTS-IMPLEMENTATION-PROOF.md` → **UI Visual Lab closeout** for the full L0–L6 checklist.

## Before claiming success

Always run:
```bash
npm run lint
npm run typecheck
npm run check:i18n
```

Or use the bundled shortcut (stops on first failure):
```bash
npm run hydri:verify
```

## Hydri tooling shortcuts

| Command | Purpose |
|---------|---------|
| `npm run hydri:verify` | Lint → typecheck → i18n in sequence; stops on first error |
| `npm run hydri:audit` | Read-only scan for unwanted repo artifacts (never deletes) |
| `npm run hydri:agent:check` | Verifies required agent docs and Cursor rules exist |

Run tests when touching business logic, mocks, permissions, critical shared UI, routing or integration behavior.

## Implementation proof (mandatory)

Before marking work complete, append a `HYDRI_IMPLEMENTATION_PROOF` block. Declare **Worked**, **Partial**, or **Did not work** with objective evidence — not just "done".

See `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` for the template, proof levels (P0–P4), failure criteria, and checklists for mobile UI, i18n, and CSS.

## PR description terminal-friendly template

```md
## Summary
- 

## Validation
- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm run check:i18n

## Preview
- http://localhost:3000/pt-BR/cargas

## Risk
- 

## Rollback
- 
```
