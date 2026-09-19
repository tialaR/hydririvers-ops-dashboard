# HydroRivers Agentic Integrity Foundation

**Status:** foundation v2 — portable core + Cursor/VS Code adapters + deterministic release gates  
**Goal:** make AI executors replaceable while contracts, deterministic gates, and evidence remain authoritative.

## 1. Prime directive

> Human decides the contract. Agent executes the bite. Deterministic gates judge the result.

An agent response is never proof. "Done", "PASS", "looks correct", a green build, or a screenshot by itself cannot promote a requirement.

Evidence chain:

`REQUIREMENT -> SOURCE -> OWNER -> ALLOWED SCOPE -> RUNTIME/ARTIFACT -> CHECK -> EVIDENCE -> STATUS`

Statuses: `NOT_STARTED | PARTIAL | FAIL | BLOCKED | PASS`.

## 2. Authority order

1. Human-issued task contract
2. Canonical product/design source and frozen artifacts
3. Repository policy and architecture contracts
4. Deterministic gates
5. Tests and runtime evidence
6. Agent analysis
7. Agent prose

Lower levels cannot override higher levels.

## 3. One bite, one contract

Every implementation bite opens a local `.agentic/current-task.json`.

The contract declares:
- task id and owner;
- mode: `observe` or `implement`;
- allowed and forbidden paths;
- protected-write permission;
- baseline-mutation permission;
- dependency, git-mutation, and deploy permission;
- mandatory gates;
- owners expected to remain unchanged.

No contract means no Agent file write.

The local contract is intentionally ignored by Git. It is human-issued execution state, not product source.

## 4. Cursor adapter

Cursor is an executor, not the source of truth.

Project controls:
- `.cursor/rules/*.mdc`: contextual instructions;
- `.cursor/permissions.json`: narrow safe command allowlist and Auto-review guidance;
- `.cursor/sandbox.json`: workspace sandbox with deny-by-default network;
- `.cursor/hooks.json`: fail-closed guards for file writes and shell commands;
- `.cursorignore`: secret/noise reduction, not a security boundary.

Recommended local Run Mode: **Auto-review** for normal work. Use **Allowlist** for high-risk governance, dependency, release, or baseline work. Never rely on Run Everything for governed implementation.

Rules steer. Hooks intercept. Scripts verify. CI decides.

## 5. Protected surfaces

By default the following are protected:
- canonical Figma freeze;
- visual baselines;
- GitHub workflows;
- Cursor security configuration;
- VS Code task configuration;
- agentic policy/config.

A protected change requires an explicit task contract. Baseline mutation requires its own explicit flag and must never be used merely to make a visual failure disappear.

## 6. Editor independence

The core is editor-agnostic:
- `AGENTS.md`;
- `config/agentic/*`;
- `scripts/governance/*`;
- package scripts;
- CI workflows and artifacts.

Cursor receives an adapter. VS Code receives tasks. Future agents can receive their own adapters without redefining the laws.

## 7. Gate model

Implemented convergence:

- **SCOPELOCK** — changed files must match the human-issued bite.
- **STATICLOCK** — lint, TypeScript, i18n, naming, tokens, architecture boundaries, anti-GOD ratchet.
- **FLOWLOCK** — manifest-driven behavior profiles execute the exact unit/integration/E2E checks required by the release.
- **SHARKLOCK** — manifest-driven frozen visual source, deterministic browser capture, strict reference hash, global + owner-region metrics. Current certification threshold remains exact zero for Page 61.
- **RELEASELOCK** — executes every gate required by a release manifest and fails closed on the first missing/failing gate.

Build green is not FlowLock green. FlowLock green is not SharkLock green. Partial improvement is not global PASS.

## 8. Anti-GOD policy

Current prompt rules already ask for small owners and compositor-only screens, but that is not hard enforcement yet.

Next foundation phase adds an architecture ratchet:
- new TS/TSX/Sass files receive strict size/complexity budgets;
- existing large files are grandfathered at measured baseline;
- a touched grandfathered file cannot become worse without explicit contract authorization;
- compositor files receive stricter budgets;
- owner-boundary imports are machine-checked.

This is a ratchet, not a mass-refactor trigger.

## 9. Visual source

Current Page 61 certification keeps:
- Figma file key: `hQA6rajAQLYVUVSR47YSws`;
- canonical node: `219:254`;
- viewport: `1440x1024`;
- frozen PNG hash checked by SHARKLOCK;
- fixture runtime separated from normal MapLibre product runtime.

Future screens should use manifests instead of hardcoding each screen into a new bespoke certification script.

## 10. Cost-aware agent strategy

Keep expensive model context focused:
- use Plan/Ask for investigation;
- start fresh task chats when context is no longer needed;
- send one owner/bite at a time;
- run deterministic scripts locally instead of asking a model to re-read the whole repository;
- use browser as investigation evidence, not certification;
- reserve deep review/high-cost models for architecture, security, or large refactors.

When one executor reaches a usage limit, another executor may continue from the same task contract. Gates do not change.

## 11. Sources

Primary implementation decisions were checked against current Cursor documentation for Rules, Hooks, permissions.json, sandbox.json, Run Modes, Plan Mode, Agent Review, Browser, Agent Skills, and ignore files, plus current OpenAI Business pricing/usage documentation.

Community reports are treated as operational anecdotes only. They do not define gate behavior.


## 12. Executable profiles

- `config/agentic/flows/agentic-integrity.json` — red-team checks for the fences themselves.
- `config/agentic/flows/minhas-cargas-desktop.json` — M01 desktop + shipper critical journey.
- `config/agentic/releases/agentic-foundation.json` — STATICLOCK + FLOWLOCK; no visual surface changed.
- `config/agentic/releases/minhas-cargas-page61.json` — STATICLOCK + FLOWLOCK + SHARKLOCK.
- `config/visual-gates/page-61.json` — first manifest for the generic SHARKLOCK engine.

The legacy Page 61 SHARKLOCK workflow remains untouched while visual Mordida 05 is in flight. The generic engine is additive until equivalence is proven.
