# HYDRI_TASK_ROUTER

Automatic rule router for Cursor, Codex, ChatGPT, and other Hydri agents. **Classify the task before planning or implementing.** Read only the docs required for the classified categories (union when multiple apply).

## Mandatory flow

1. Read `AGENTS.md` and this file (`docs/agents/AGENTS-TASK-ROUTER.md`).
2. Classify the task into one or more categories (see below).
3. If ambiguous, **declare the assumed classification** before acting.
4. Build the **required docs** list (base + implementation if applicable + union of category docs).
5. Read every required doc. If any is **missing on disk**, **stop**, report it, and set `Can proceed: no`.
6. Plan or implement only after `Can proceed: yes`.
7. End every response with the **closing block** (see [Closing response](#closing-response)).

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

Do not skip this block. If `Can proceed: no`, explain why and wait for direction.

## Closing response (required)

End every agent response with:

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

## Implementation docs (every implementation task)

Any task that changes code, config, tests, or agent docs to deliver behavior:

| Doc | Purpose |
|-----|---------|
| `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` | Mandatory proof block at end |

Implementation tasks must also close with a full `HYDRI_IMPLEMENTATION_PROOF` block (see that doc).

## Task categories and required docs

When multiple categories apply, **union** all doc paths and deduplicate.

### `mobile-ui`

Mobile screens, shells, layouts, touch interactions, mobile-only components.

- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
- `docs/agents/AGENTS-CURRENT-STATE.md`

### `desktop-ui`

Desktop layouts, expanded map, admin chrome, desktop-only surfaces.

- `docs/agents/AGENTS-CODEBASE-MAP.md`
- `docs/agents/AGENTS-CURRENT-STATE.md`

### `bottom-nav`

Bottom navigation, tab bar, mobile shell nav chrome.

- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
- `docs/agents/AGENTS-CURRENT-STATE.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `bottom-sheet`

Bottom sheets, filter sheets, mobile overlays that slide from bottom.

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

### `performance`

Bundle, runtime perf, CI perf gates.

- `docs/CI-QUALITY-GATES.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

### `visual-regression`

Visual QA, screenshot comparison, design parity checks.

- `docs/QA-TEST-MATRIX.md`
- `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
- `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`

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
| Add mock persona | `mock-mode`, `auth` |
| CI failing on PR | `ci-pr`, `testing` |
| Agent docs / rules only | `docs-only` |

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
