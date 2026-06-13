# HydriRivers Agent Entry Point

## HYDRI_TASK_ROUTER (mandatory first step)

**Always run HYDRI_TASK_ROUTER before planning or implementing.**

1. Read this file (`AGENTS.md`) and `docs/agents/AGENTS-TASK-ROUTER.md`.
2. Classify the task, read the union of required docs for all matching categories, and emit the initial `HYDRI_TASK_ROUTER` block.
3. If a required doc is missing, stop and report — do not proceed.

Full router spec: `docs/agents/AGENTS-TASK-ROUTER.md`

## Closing response (mandatory)

**Do not end with a technical wall first.** Every response must close with **Captain closeout** (also called Human closeout) — a short, visual, plain-language decision (🟢 Verde / 🟡 Amarelo / 🔴 Vermelho) — before any technical blocks.

**Closing order:**

1. Work body
2. **Captain closeout** — always starts the closing section
3. `HYDRI_TASK_ROUTER — close` — technical (required for implementation and docs work)
4. `HYDRI_IMPLEMENTATION_PROOF` — technical (only when implementation happened)

For implementation tasks (code, config, tests, or agent docs that deliver behavior), **Captain closeout** and **`HYDRI_IMPLEMENTATION_PROOF`** are both mandatory. Plan or audit only: Captain closeout with 🟡 Amarelo is enough — omit the full proof block.

See `docs/agents/AGENTS-TASK-ROUTER.md` (Captain closeout template) and `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` (proof block).

## Reference docs (read on demand via router)

The router selects which of these to read per task category:

1. `docs/agents/AGENTS-ORCHESTRATOR.md`
2. `docs/agents/AGENTS-HYDRI-CONTEXT.md`
3. `docs/agents/AGENTS-WORKFLOW.md`
4. `docs/agents/AGENTS-CODEBASE-MAP.md`
5. `docs/agents/AGENTS-CURRENT-STATE.md`
6. `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
7. `docs/agents/AGENTS-PATCH-PROTOCOL.md`
8. `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`
9. `docs/agents/AGENTS-ZERO-REDEMOINHO.md` — **Operation Zero Redemoinho** (architecture gate, tokens, i18n, naming, labs, proof audits)

**UI tasks:** when a task touches interface, classify with a UI category and read the UI auto-routing union in `docs/agents/AGENTS-TASK-ROUTER.md` plus `.cursor/rules/hydri-ui-architecture.mdc`. Stop before implementing if those were not read.

**Every implementation task:** read `docs/agents/AGENTS-ZERO-REDEMOINHO.md` and `.cursor/rules/hydri-zero-redemoinho.mdc`; run the **Zero Redemoinho Architecture Gate** (search existing pattern before creating); fill **Operation Zero Redemoinho proof fields** at closeout.

Non-negotiables:
- Audit before patching.
- Do not generate charts/reports when the task is component/code.
- Preserve mobile/desktop separation.
- Preserve next-intl localized routes.
- Preserve mock-mode.
- Prefer `.module.sass` for touched/created component styles.
- New/touched files and folders: **kebab-case**; no mass rename without approval; PascalCase React exports OK.
- UI: dumb components, logic in hooks, data separated in scope — see `.cursor/rules/hydri-ui-architecture.mdc`.
- Do not install dependencies without explicit approval.
- Validate with lint, typecheck and i18n before claiming success.
- **Operation Zero Redemoinho:** no parallel UI/token/mock/doc patterns; reuse or document; no hardcoded UI strings; no new paths outside kebab-case; component tokens `--hy-*`; magic numbers named; labs temporary by default; glass UI validated on colored scrollable backdrop.
- Close every response with **Captain closeout** first, then technical blocks (`HYDRI_TASK_ROUTER — close`, `HYDRI_IMPLEMENTATION_PROOF` when implementation happened). See `docs/agents/AGENTS-TASK-ROUTER.md` and `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`.
