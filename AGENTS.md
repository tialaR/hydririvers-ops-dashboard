# HydriRivers Agent Entry Point

## HYDRI_TASK_ROUTER (mandatory first step)

**Always run HYDRI_TASK_ROUTER before planning or implementing.**

1. Read this file (`AGENTS.md`) and `docs/agents/AGENTS-TASK-ROUTER.md`.
2. Classify the task, read the union of required docs for all matching categories, and emit the initial `HYDRI_TASK_ROUTER` block.
3. If a required doc is missing, stop and report — do not proceed.

Full router spec: `docs/agents/AGENTS-TASK-ROUTER.md`

## Closing response (mandatory)

**Do not end with a technical wall first.** Every response must close with **Human closeout** — a short, visual, plain-language decision (🟢 Verde / 🟡 Amarelo / 🔴 Vermelho) — before any technical blocks.

**Closing order:**

1. Work body
2. **Human closeout** — always starts the closing section
3. `HYDRI_TASK_ROUTER — close` — technical (required for implementation and docs work)
4. `HYDRI_IMPLEMENTATION_PROOF` — technical (only when implementation happened)

For implementation tasks (code, config, tests, or agent docs that deliver behavior), **Human closeout** and **`HYDRI_IMPLEMENTATION_PROOF`** are both mandatory. Plan or audit only: Human closeout with 🟡 Amarelo is enough — omit the full proof block.

See `docs/agents/AGENTS-TASK-ROUTER.md` (Human closeout template) and `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` (proof block).

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

Non-negotiables:
- Audit before patching.
- Do not generate charts/reports when the task is component/code.
- Preserve mobile/desktop separation.
- Preserve next-intl localized routes.
- Preserve mock-mode.
- Prefer `.module.sass` for touched/created component styles.
- Do not install dependencies without explicit approval.
- Validate with lint, typecheck and i18n before claiming success.
- Close every response with **Human closeout** first, then technical blocks (`HYDRI_TASK_ROUTER — close`, `HYDRI_IMPLEMENTATION_PROOF` when implementation happened). See `docs/agents/AGENTS-TASK-ROUTER.md` and `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`.
