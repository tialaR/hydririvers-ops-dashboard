# HydriRivers Agent Entry Point

Read these files before acting on this repository:

1. `docs/agents/AGENTS-ORCHESTRATOR.md`
2. `docs/agents/AGENTS-HYDRI-CONTEXT.md`
3. `docs/agents/AGENTS-WORKFLOW.md`
4. `docs/agents/AGENTS-CODEBASE-MAP.md`
5. `docs/agents/AGENTS-CURRENT-STATE.md`
6. `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`
7. `docs/agents/AGENTS-PATCH-PROTOCOL.md`

Non-negotiables:
- Audit before patching.
- Do not generate charts/reports when the task is component/code.
- Preserve mobile/desktop separation.
- Preserve next-intl localized routes.
- Preserve mock-mode.
- Prefer `.module.sass` for touched/created component styles.
- Do not install dependencies without explicit approval.
- Validate with lint, typecheck and i18n before claiming success.
