# Hydri Implementation Proof

Every implemented task must end with a `HYDRI_IMPLEMENTATION_PROOF` block. Agents and executors must prove the change worked, explain how it was validated, and declare limits and risk — not just say "done".

## When to use

- After any code, config, test, or docs change that claims to fix or deliver behavior.
- Before marking a task complete, opening a PR, or telling the user the work succeeded.
- Even for partial work: use **Partial** or **Did not work** honestly.

## Mandatory closing block

Copy this template and fill every field. Omit a field only when truly not applicable, and say why.

```md
## HYDRI_IMPLEMENTATION_PROOF

**Result:** Worked | Partial | Did not work

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
| **Change implemented** | What was actually built or fixed, in plain language. |
| **Objective evidence** | Logs, command output, DOM markers, screenshots, test names — not opinion. |
| **Commands run** | Exact commands and exit status when relevant. |
| **Tests affected** | Added, updated, or run tests; or explicit "none" with reason. |
| **Preview / manual QA** | Route, viewport, steps, outcome. Required for UI/behavior changes. |
| **Files changed** | Paths that matter for review and rollback. |
| **Not validated** | Scopes, locales, devices, edge cases skipped. |
| **Remaining risks** | Regressions, flaky tests, mock-only proof, incomplete i18n. |
| **Why it may still be wrong** | Honest failure modes: wrong file, wrong route, hydration, stale cache. |
| **Recommended next action** | Smallest next step to increase confidence. |

## Cannot claim "it worked"

Do **not** state success if any of the following apply:

| Condition | Why it blocks a success claim |
|-----------|-------------------------------|
| Mandatory validation not run | `npm run lint`, `npm run typecheck`, `npm run check:i18n` (and tests when required) were skipped or failed. |
| Affected route/component not inspected | Code compiles but the user-facing surface was not opened or exercised. |
| Test passed but only fragile contract | Asserts text/class names without behavior; snapshot-only; mocks hide integration. |
| UI changed without visual preview | Layout, spacing, states, or chrome changed without runtime or screenshot proof. |
| Behavior changed without test or QA | Logic, routing, filters, or permissions changed with no automated or manual check. |
| Error dismissed as "out of scope" | Failure attributed to environment or unrelated code without evidence (logs, repro, diff). |

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
- Mobile or desktop UI: P0 + P2 at minimum; P4 for significant visual chrome changes.
- Copy / i18n: P0 including `check:i18n`; P2 on at least one locale route when strings changed.

## Checklist: mobile UI

When the task touches mobile UI, confirm in **Preview / manual QA** or **Not validated**:

- [ ] Mobile viewport (not desktop-only preview)
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

Preserve mobile/desktop style separation; a mobile-only task must not break desktop layout and vice versa.

## Relation to other Hydri workflows

- **Audit before patch:** diagnosis closes before implementation proof is attempted.
- **AGENTS-WORKFLOW.md:** branching, commits, and baseline commands.
- **AGENTS-UI-MOBILE-STANDARDS.md:** mobile chrome and BottomNav expectations.
- **hydririvers-visual-workflow:** visual iteration rounds; implementation proof closes each implementation round.

## Example (abbreviated)

```md
## HYDRI_IMPLEMENTATION_PROOF

**Result:** Worked

**Change implemented:**
- Fixed mobile filter sheet safe-area padding on `/pt-BR/cargas`.

**Objective evidence:**
- `npm run lint` / `typecheck` / `check:i18n` exit 0.
- Manual: sheet opens, primary filter applies, dismiss clears overlay; content clears BottomNav on iPhone 14 viewport.

**Commands run:**
- `npm run lint` (0)
- `npm run typecheck` (0)
- `npm run check:i18n` (0)

**Tests affected:**
- None (style-only); visual QA at P2.

**Preview / manual QA:**
- `http://localhost:3000/pt-BR/cargas` — mobile viewport, light mode, open/apply/close/scroll.

**Files changed:**
- `src/features/cargas/mobile/FilterSheet.module.sass`

**Not validated:**
- `en-US` / `es` routes (no copy change).
- Dark mode.

**Remaining risks:**
- Very small viewports (<320px) not tested.

**Why the implementation may still be wrong:**
- Safe-area env() behavior differs on real iOS vs DevTools emulation.

**Recommended next action:**
- Physical device smoke test if shipping this week.
```
