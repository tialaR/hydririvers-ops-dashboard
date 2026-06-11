# Hydri Implementation Proof

Every implemented task must close with a **Captain closeout** (short, decisive message for the user) and, when implementation happened, a `HYDRI_IMPLEMENTATION_PROOF` block (technical audit trail). Agents must prove the change worked, explain how it was validated, and declare limits — not just say "done".

**Do not lead the closing section with technical proof.** Captain closeout comes first; the user should not need to parse proof levels or router categories to understand the outcome.

The proof must include the **HYDRI_TASK_ROUTER task classification** used for the work (same categories declared in the initial router block). See `docs/agents/AGENTS-TASK-ROUTER.md`.

## Captain closeout (mandatory)

Emit **Captain closeout** at the start of every closing section. It is written **for the user**, not for another agent — a short, decisive summary without technical jargon when a human equivalent exists.

**Closing order:**

1. Work body (prose, code, diffs — avoid textão before closeout)
2. **Captain closeout** ← user-facing decision (**always first in closing section**)
3. **Detalhes técnicos** (optional — component names, paths, commands, proof levels)
4. `HYDRI_TASK_ROUTER — close` (technical)
5. `HYDRI_IMPLEMENTATION_PROOF` (technical — only when implementation happened)

**When to omit full HYDRI_IMPLEMENTATION_PROOF:**

- Plan or audit only (no code/config/test changes): Captain closeout with **🟡 Segue com cuidado** is enough.
- Blocked before any delivery: Captain closeout with **🔴 Para agora**; omit proof unless partial work exists.

### Template (required)

```md
## Captain closeout

🟢/🟡/🔴 [Decisão curta]

Em humano:
[1 a 3 frases curtas explicando o que aconteceu sem jargão]

Prova simples:
[1 linha com validação em linguagem simples]

Falta provar:
[1 linha objetiva]

Próxima ação:
[1 ação clara]
```

### Status meanings

| Emoji | Decisão | When to use | Maps to **Result** |
|-------|---------|-------------|-------------------|
| 🟢 | **Pode seguir** | Validated with sufficient evidence; docs/rules created and checks passed | Worked |
| 🟡 | **Segue com cuidado** | Partial, incomplete validation, relevant risk, plan/audit without execution | Partial |
| 🔴 | **Para agora** | Did not work, validation failed, scope blocked | Did not work |

### Avoid in Captain closeout

Do not use internal component names (unless essential), "canônico", "light/flush", "runtime", "E2E", "flicker", "viewport", "supressão", "PR #…", file paths, or long lists. Move those to **Detalhes técnicos** or `HYDRI_IMPLEMENTATION_PROOF`.

**Captain closeout** and **HYDRI_IMPLEMENTATION_PROOF** must agree on outcome (🟢 Pode seguir ↔ Worked, 🟡 Segue com cuidado ↔ Partial, 🔴 Para agora ↔ Did not work).

## When to use

- After any code, config, test, or docs change that claims to fix or deliver behavior.
- Before marking a task complete, opening a PR, or telling the user the work succeeded.
- Even for partial work: use **Partial** or **Did not work** honestly.

## Mandatory closing block

Copy this template and fill every field. Omit a field only when truly not applicable, and say why.

```md
## HYDRI_IMPLEMENTATION_PROOF

**Result:** Worked | Partial | Did not work

**HYDRI_TASK_ROUTER classification:**
- (categories used for this task)

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
| **HYDRI_TASK_ROUTER classification** | Categories from the router (see `docs/agents/AGENTS-TASK-ROUTER.md`). |
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

- **HYDRI_TASK_ROUTER:** classify before work; proof repeats the classification used.
- **Audit before patch:** diagnosis closes before implementation proof is attempted.
- **AGENTS-WORKFLOW.md:** branching, commits, and baseline commands.
- **AGENTS-TASK-ROUTER.md:** category → required docs mapping.
- **AGENTS-UI-MOBILE-STANDARDS.md:** mobile chrome and BottomNav expectations.
- **hydririvers-visual-workflow:** visual iteration rounds; implementation proof closes each implementation round.

## Examples: Captain closeout

### 🟢 Pode seguir — implementation validated

```md
## Captain closeout

🟢 Pode seguir

Em humano:
O painel de filtros no celular não esconde mais o conteúdo atrás da barra de navegação. Abrir, filtrar, fechar e rolar funcionaram no teste manual.

Prova simples:
Checagens automáticas passaram e o fluxo principal foi testado na tela de cargas em português.

Falta provar:
Inglês e espanhol, modo escuro e teste em aparelho físico.

Próxima ação:
Completar traduções e fazer um teste rápido no celular real antes de publicar.

### Detalhes técnicos

- Preview: `/pt-BR/cargas` — safe-area padding no filter sheet
- `npm run lint`, `npm run typecheck`, `npm run check:i18n` — exit 0
- Locales en-US/es não revisados nesta rodada
```

Technical blocks follow (abbreviated):

```md
## HYDRI_TASK_ROUTER — close
…

## HYDRI_IMPLEMENTATION_PROOF

**Result:** Worked
…
```

### 🟡 Segue com cuidado — partial or plan/audit only

```md
## Captain closeout

🟡 Segue com cuidado

Em humano:
O texto do filtro de status foi ajustado só em português. Inglês e espanhol ainda não foram atualizados.

Prova simples:
A checagem de traduções passou e a tela em português foi revisada manualmente.

Falta provar:
Traduções em inglês e espanhol; versão desktop não foi aberta.

Próxima ação:
Completar os dois idiomas e conferir as três versões de idioma no navegador.
```

For plan/audit without code changes, stop after Captain closeout — no full `HYDRI_IMPLEMENTATION_PROOF` required.

### 🔴 Para agora — blocked or failed

```md
## Captain closeout

🔴 Para agora

Em humano:
Nada foi entregue — falta um documento obrigatório no repositório e o trabalho ficou bloqueado.

Prova simples:
Confirmei que o arquivo esperado não existe no disco.

Falta provar:
Qualquer mudança de estilo ou comportamento.

Próxima ação:
Restaurar o documento ou autorizar o escopo sem ele.

### Detalhes técnicos

- Doc ausente: `docs/theme.md`
```

When partial work exists, add `HYDRI_IMPLEMENTATION_PROOF` with **Result:** Did not work below Captain closeout.
