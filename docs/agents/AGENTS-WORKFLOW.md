# Hydri Workflow

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

Run tests when touching business logic, mocks, permissions, critical shared UI, routing or integration behavior.

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
