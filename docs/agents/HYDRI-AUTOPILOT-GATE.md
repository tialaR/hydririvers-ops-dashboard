# Hydri Autopilot Gate

Executable guardrails so Cursor/agents follow project rules **before, during, and after** implementation — without relying on "I read the docs."

## Quick start

```bash
# Auto-infer scope/mode from changed files (default)
npm run hydri:gate

# Workflow/governance task
npm run hydri:gate -- --scope=workflow --mode=workflow

# Minhas cargas mobile work
npm run hydri:gate -- --scope=minhas-cargas --mode=mobile

# With automated verify/tests
npm run hydri:gate -- --scope=minhas-cargas --mode=mobile --run-verify --run-tests
```

Exit code: `0` = PASS or WARN; `1` = FAIL (critical violations).

## Auto scope/mode inference

When `--scope` and/or `--mode` are omitted, the gate classifies **changed + untracked** files and prints:

- `Inferred scope: …` / `Inferred mode: …`
- `Scope inference confidence: high | medium | low`
- `Combined inference confidence: …` (when both inferred)

| Signal | Inferred scope |
|--------|----------------|
| `.cursor/**`, `scripts/hydri-*`, `docs/agents/**`, `docs/automation/**` | `workflow` |
| `owned-cargo-*`, `my-cargoes-list/**`, `minhas-cargas/**`, `minhas-cargas` flow docs | `minhas-cargas` |
| `public-cargas-*`, `cargo-card/**`, `/cargas` routes | `cargas` |
| `dashboard/**`, `operations-board` | `dashboard` |
| `src/shared/**` | `shared` |
| Other `docs/**` (non-product-flow) | `docs` |
| Competing scopes (e.g. minhas-cargas + cargas) | `mixed` → **FAIL** |

| Signal | Inferred mode |
|--------|---------------|
| Mobile shell, BottomNav, sheets, owned-cargo, minhas-cargas | `mobile` |
| Desktop map, operations-board desktop | `desktop` |
| Rules, scripts, agent docs | `workflow` |
| Mobile + desktop mixed | `mixed` → **FAIL** |

**Declare manually** when: mixed diff, low confidence WARN, governance-only task in a dirty tree with product files, or cross-boundary work (use `--allow=` with proof).

**Gate stops (FAIL)** when: inferred or explicit `scope=mixed` / `mode=mixed`; `mode=workflow` touches `src/app`, `src/features`, `src/shared`, `messages`; `scope=minhas-cargas` touches public `/cargas`; mode mobile/desktop cross-touch without allowlist.

## Status meanings

| Status | Meaning | Max Captain closeout | Forbidden in closeout |
|--------|---------|----------------------|------------------------|
| **PASS** | No critical violations | 🟢 only after lint/typecheck/i18n/build too | — |
| **WARN** | Risks, incomplete visual QA, artifacts | 🟡 Segue com cuidado | 🟢, "Pode seguir", "Worked" |
| **FAIL** | Scope, architecture, naming, workflow breach | 🔴 Para agora | 🟢, "Pode seguir", success/concluído |

When **multiple** gate runs apply (e.g. inferred scope + `--scope=workflow --mode=workflow` on a dirty tree), use the **strictest** outcome: any FAIL caps at 🔴; else any WARN caps at 🟡.

**Governance checkpoint on dirty branch:** rules/docs may be correct while the tree still FAILs — close 🔴 with: *"Governança criada, mas branch atual segue bloqueada por FAIL legítimo no gate."*

## What the gate checks

1. **Branch/status** — branch, changed, untracked, diff stat
2. **Scope** — `--scope=` boundaries; minhas-cargas vs /cargas public
3. **Mode** — mobile/desktop/workflow separation
4. **Styling** — `.module.scss` touched, `globals.scss`, new `!important`
5. **Naming** — kebab-case for new paths; forbidden `ds-v2`, `lab-v2`, `legacy`, `tmp-*`, etc.
6. **Architecture** — OwnedCargoCard ↔ CargoCard, lab imports in product, public-cargas boundary
7. **Artifacts** — `output/`, backups, loose screenshots, `next-env.d.ts`
8. **i18n** — recommends `check:i18n`; optional `--run-i18n`
9. **Validation** — recommends lint, typecheck, build, scope tests, DS check
10. **Mobile QA** — checklist + screenshot WARN if incomplete

## CLI flags

| Flag | Description |
|------|-------------|
| `--scope=` | `minhas-cargas`, `cargas`, `dashboard`, `shared`, `workflow`, `docs`, `full`, `mixed` — **omit to infer** |
| `--mode=` | `mobile`, `desktop`, `full`, `workflow`, `mixed` — **omit to infer** |
| `--allow=` | Comma-separated path substrings to allow boundary exceptions |
| `--run-verify` | Run `npm run hydri:verify` |
| `--run-tests` | Run minhas-cargas unit tests when scope applies |
| `--run-i18n` | Run `npm run check:i18n` |
| `--run-build` | Run `npm run build` |

## Related scripts

| Script | Role | Blocks? |
|--------|------|---------|
| `npm run hydri:gate` | Scoped implementation gate | **Yes** on FAIL |
| `npm run hydri:agent:check` | Required docs + `.cursor/rules` exist | **Yes** if missing |
| `npm run hydri:verify` | lint + typecheck + i18n | **Yes** on failure |
| `npm run hydri:audit` | Artifact inventory (read-only) | **No** (always exit 0) |
| `npm run audit:docs` | Required doc paths | **Yes** if missing |
| `npm run ds:check` | Design system validation | **Yes** on failure |

## Source-of-truth index

### Cursor rules (`.cursor/rules/`)

| Rule | Purpose |
|------|---------|
| `hydri-task-router.mdc` | Classify task, read docs, Captain closeout |
| `hydri-implementation-proof.mdc` | Proof block; tests ≠ full proof |
| `hydri-zero-redemoinho.mdc` | Architecture gate, tokens, i18n, naming |
| `hydri-ui-architecture.mdc` | Dumb UI, hooks, Sass, kebab-case |
| `hydri-scope-gate.mdc` | Scope/mode boundaries + run gate (auto-infer) |
| `hydri-component-and-flow-standards.mdc` | UI, flows, architecture, hydro context, output |
| `hydri-mobile-ui.mdc` | Three viewports, mobile QA |
| `hydri-orchestrator.mdc` | Orchestrator entry |
| `hydririvers-project.mdc` | Stack and architecture summary |

### Agent docs (`docs/agents/`)

- `AGENTS-TASK-ROUTER.md` — category → doc union
- `AGENTS-IMPLEMENTATION-PROOF.md` — closeout + proof fields
- `AGENTS-ZERO-REDEMOINHO.md` — Operation Zero Redemoinho
- `AGENTS-UI-MOBILE-STANDARDS.md` — mobile chrome and viewports
- `AGENTS-WORKFLOW.md` — dev workflow
- `AGENTS-HYDRI-CONTEXT.md`, `AGENTS-CODEBASE-MAP.md`, `AGENTS-CURRENT-STATE.md`

### ADRs (selected)

- `0001` feature-based architecture
- `0002` mobile-first
- `0004` i18n
- `0016` dashboard/cargas/minhas-cargas boundaries
- `0023` mobile layout + BottomNav
- `0034` Operation Zero Redemoinho

## Legacy inventory (do not treat as error if pre-existing)

| Class | Examples |
|-------|----------|
| legacy/frozen | `BottomNav.module.sass`, `IconButton.module.scss`, `CargoCard.tsx` |
| lab/dev-only | `dev-v2/`, `mobile-list-lab-v2/`, `cargo-lab-v2/` |
| artifact/remove-before-commit | `output/`, `test-results/`, `*.bak`, `*before-*` |

**Error** when task **adds new** forbidden names or imports lab into production paths.

## Agent workflow

1. Emit `HYDRI_TASK_ROUTER` block (scope/mode inferred or declared).
2. Implement within scope.
3. Run `npm run hydri:gate` (override with `--scope=` / `--mode=` when mixed).
4. Run `hydri:verify` (+ scope tests / visual QA if UI).
5. Captain closeout — record every gate **STATUS FINAL**; any FAIL → 🔴 and no "Pode seguir"; any WARN → 🟡 max; 🟢 only when all mandatory runs are PASS.
