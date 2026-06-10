# AGENTS.md

This repository uses the HydriRivers Orchestrator Agent rules.

Primary agent instructions live in:

- `docs/AGENTS-ORCHESTRATOR.md`
- `.cursor/rules/hydri-orchestrator.mdc`
- `.github/copilot-instructions.md`

Core principle:

> Audit first, classify the task, make the smallest safe change, validate, and keep rollback available.

Do not generate patches or code before the active runtime files are known.
