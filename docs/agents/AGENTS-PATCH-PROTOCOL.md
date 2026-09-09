# Hydri Patch Protocol

## Before generating patch

Require diagnosis:
```bash
git status --short
grep -R "expected-marker" -n src/shared src/features src/app || true
sed -n '1,180p' target-file
git diff -- target-file | head -220
```

## Patch rules

Each ZIP patch must include:
- apply script;
- revert script;
- exact file list;
- validation commands;
- preview route;
- rollback command.

Keep patches small:
- visual patch: style only;
- behavior patch: TS/logic only;
- component replacement: allowed to touch TSX/Sass/tests, but preserve Legacy if global.

Never:
- include `node_modules`, `.next`, `.git`, `.env*`;
- create `files/` in the repo root;
- leave copied source snapshots inside TypeScript-included paths;
- claim success without validation output.

## Standard validation

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

## Standard preview

```txt
http://localhost:3000/pt-BR/cargas
```
