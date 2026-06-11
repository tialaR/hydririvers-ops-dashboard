# HydriRivers Agent Entry Point

## HYDRI_TASK_ROUTER (mandatory first step)

**Always run HYDRI_TASK_ROUTER before planning or implementing.**

1. Read this file (`AGENTS.md`) and `docs/agents/AGENTS-TASK-ROUTER.md`.
2. Classify the task, read the union of required docs for all matching categories, and emit the initial `HYDRI_TASK_ROUTER` block.
3. If a required doc is missing, stop and report — do not proceed.

Full router spec: `docs/agents/AGENTS-TASK-ROUTER.md`

## Implementation proof (mandatory for implementation)

For any implementation task (code, config, tests, or agent docs that deliver behavior), **`HYDRI_IMPLEMENTATION_PROOF` is mandatory** at the end of the response. See `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`.

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
- End implementation tasks with `HYDRI_IMPLEMENTATION_PROOF` (see `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`).
