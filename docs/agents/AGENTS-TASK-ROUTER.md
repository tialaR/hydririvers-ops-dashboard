# HYDRI_TASK_ROUTER

Automatic rule router for Cursor, Codex, ChatGPT, and other Hydri agents. **Classify the task before planning or implementing.** Read only the docs required for the classified categories (union when multiple apply).

## Mandatory flow

1. Read `AGENTS.md` and this file (`docs/agents/AGENTS-TASK-ROUTER.md`).
2. Classify the task into one or more categories (see below).
3. If ambiguous, **declare the assumed classification** before acting.
4. Build the **required docs** list (base + implementation if applicable + union of category docs).
5. Read every required doc. If any is **missing on disk**, **stop**, report it, and set `Can proceed: no`.
6. Plan or implement only after `Can proceed: yes`.
7. **Proceed autonomously** when the task is clear and within scope — do not ask for intermediate approval.
8. End every response with **Human closeout** first, then the technical closing blocks (see [Human closeout](#human-closeout) and [Closing response](#closing-response)).

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

Do not skip this block internally. If `Can proceed: no`, explain why in **Human closeout** (Status: Vermelho) and stop — do not ask the user to confirm categories or doc lists.

## Autonomous execution

The agent must **take the lead** when the task is clear and within allowed scope:

- Classify the task, read required docs, and implement without asking the user to confirm categories, doc paths, or "yes, proceed".
- Do **not** request intermediate approval for routine steps inside the stated scope.

**Stop and ask the user only when:**

| Situation | Action |
|-----------|--------|
| Scope is ambiguous | State assumption; ask one focused question if it blocks work |
| Required doc is missing on disk | Report missing path; set `Can proceed: no` |
| Work must touch forbidden scope | Explain what is needed and why; wait for direction |
| Validation failed | Report failure with evidence; propose fix or narrowed scope |
| High risk cannot be mitigated in scope | Explain risk and options; wait for product/scope decision |

## Human closeout

Every agent response must close with a **Human closeout** — a short, visual, plain-language decision for the user. The user should **not** need to read router categories, doc unions, proof levels, or validation lists to understand the outcome.

**Do not end with a technical wall first.** The closing section must **start** with Human closeout; technical blocks follow only when needed.

**Response order (mandatory):**

1. Work body — prose, code, diffs as needed (keep proportional; avoid textão before the closeout)
2. **Human closeout** — user-facing decision; **always starts the closing section**
3. `HYDRI_TASK_ROUTER — close` — technical (optional for trivial Q&A; required for implementation and docs work)
4. `HYDRI_IMPLEMENTATION_PROOF` — technical (only when implementation happened; omit for plan/audit-only)

The user's final read must begin with **Human closeout**, not router categories or proof fields.

### Human closeout template (required)

At most **6 lines** (5 fields + status line). Use plain language; no internal doc paths unless the user asked for them.

```md
## Human closeout

🟢 Status: Verde
Mensagem: [frase curta em linguagem humana — o que aconteceu e o resultado]
Prova: [comando, preview ou teste principal que sustenta a afirmação]
Não provado: [principal limite, ou "Nada relevante"]
Próxima ação: [ação objetiva]
```

Use the status emoji on the **Status** line:

| Emoji | Status | When to use |
|-------|--------|-------------|
| 🟢 | **Verde** | Worked and proved with sufficient evidence |
| 🟡 | **Amarelo** | Partial delivery, incomplete validation, relevant risk, plan/audit without execution, or needs human review |
| 🔴 | **Vermelho** | Did not work, validation failed, scope blocked, or cannot claim success |

### Status mapping

| Status | Typical mapping |
|--------|-------------------|
| 🟢 **Verde** | `HYDRI_IMPLEMENTATION_PROOF` **Result:** Worked; docs/rules created and validations passed |
| 🟡 **Amarelo** | **Result:** Partial; plan or audit only (no implementation); gaps remain |
| 🔴 **Vermelho** | **Result:** Did not work; or `Can proceed: no` |

**Task type rules:**

| Task type | Human closeout | HYDRI_IMPLEMENTATION_PROOF |
|-----------|----------------|----------------------------|
| Implementation (code/config/tests) | Required; 🟢/🟡/🔴 per evidence | Full block required |
| Docs/rules only (validated) | Required; 🟢 when lint/typecheck/i18n pass | Full block when behavior of docs changed |
| Plan or audit only (no execution) | Required; **🟡 Amarelo** | Omit full block; Human closeout is enough |
| Blocked (`Can proceed: no`) | Required; **🔴 Vermelho** | Omit unless partial work was delivered |

For audit-only or question-only responses with no changes: 🟢 when the answer is complete; 🟡 when gaps remain; 🔴 when blocked (e.g. missing doc).

## Closing response (required)

After **Human closeout**, end with the technical router close block:

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

## Examples: Human closeout (required closing format)

### 🟢 Verde — implementation or docs validated

```md
## Human closeout

🟢 Status: Verde
Mensagem: Regras do router e do proof agora exigem fechamento humano e visual antes dos blocos técnicos.
Prova: `npm run lint`, `npm run typecheck` e `npm run check:i18n` passaram.
Não provado: Comportamento de agentes em sessões reais (só a spec foi atualizada).
Próxima ação: Testar com uma tarefa de implementação real e confirmar o formato no fim da resposta.
```

### 🟡 Amarelo — plan or audit without execution

```md
## Human closeout

🟡 Status: Amarelo
Mensagem: Auditei o sheet de filtros mobile; a causa provável é padding de safe-area, mas nada foi alterado.
Prova: Leitura de `FilterSheet` e reprodução mental do fluxo em `/pt-BR/cargas`.
Não provado: Preview runtime, testes automatizados e fix no código.
Próxima ação: Aplicar o patch de padding e validar no mobile.
```

### 🔴 Vermelho — blocked or failed

```md
## Human closeout

🔴 Status: Vermelho
Mensagem: Não foi possível implementar — doc obrigatório `docs/theme.md` ausente no repositório.
Prova: Verificação de path no disco; arquivo não existe.
Não provado: Qualquer mudança de estilo.
Próxima ação: Restaurar `docs/theme.md` ou autorizar escopo sem ele.
```

### Full response ending (docs-only with implementation proof)

After Human closeout, add technical blocks when implementation or validated docs work happened:

```md
## HYDRI_TASK_ROUTER — close

- **Task classification:** docs-only
- **Required docs read:** AGENTS.md, AGENTS-TASK-ROUTER.md, AGENTS-WORKFLOW.md, AGENTS-IMPLEMENTATION-PROOF.md
- **Missing docs:** none
- **Scope boundaries:** agent docs and cursor rules only; no production code
- **HYDRI_IMPLEMENTATION_PROOF:** (full block below)

## HYDRI_IMPLEMENTATION_PROOF

**Result:** Worked
…
```
