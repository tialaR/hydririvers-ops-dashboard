# Hydri Workflow

## Task routing (mandatory)

Before planning or implementing, run **HYDRI_TASK_ROUTER**: classify the task, read the required docs for all matching categories, and emit the initial router block. See `docs/agents/AGENTS-TASK-ROUTER.md`.

## Branching

- Work from `dev`.
- Update `dev` first.
- Update current branch from `dev` before patching.
- Use Conventional Branches in English.
- Open PRs to `dev`.
- Prefer small scoped PRs.

## Commits

Use Conventional Commits:
- `feat:` for product changes
- `fix:` for bugs
- `refactor:` for internal changes
- `docs:` for documentation
- `test:` for tests
- `chore:` for tooling

## Before claiming success

Always run:
```bash
npm run lint
npm run typecheck
npm run check:i18n
```

Or use the bundled shortcut (stops on first failure):
```bash
npm run hydri:verify
```

## Hydri tooling shortcuts

| Command | Purpose |
|---------|---------|
| `npm run hydri:verify` | Lint → typecheck → i18n in sequence; stops on first error |
| `npm run hydri:audit` | Read-only scan for unwanted repo artifacts (never deletes) |
| `npm run hydri:agent:check` | Verifies required agent docs and Cursor rules exist |

Run tests when touching business logic, mocks, permissions, critical shared UI, routing or integration behavior.

## Implementation proof (mandatory)

Before marking work complete, append a `HYDRI_IMPLEMENTATION_PROOF` block. Declare **Worked**, **Partial**, or **Did not work** with objective evidence — not just "done".

See `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` for the template, proof levels (P0–P4), failure criteria, and checklists for mobile UI, i18n, and CSS.

## PR description terminal-friendly template

```md
## Summary
- 

## Validation
- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm run check:i18n

## Preview
- http://localhost:3000/pt-BR/cargas

## Risk
- 

## Rollback
- 
```
