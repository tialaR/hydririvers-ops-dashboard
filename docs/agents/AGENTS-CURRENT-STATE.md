# Hydri Current State

Update this file after meaningful changes.

## Current priority

Close mobile `/pt-BR/cargas` and shared mobile chrome/components before refining other screens.

## Known current risks

- BottomNav replacement is in progress.
- Old and new BottomNav artifacts may coexist.
- Shell may still pass legacy classNames unless cleaned.
- Patch/lab artifacts may exist as untracked files.
- `files/` folder must not exist inside repo because TypeScript may typecheck it.
- `.next`, `.playwright-cli`, `node_modules`, `.env*` must not be included in context exports or commits.

## Current BottomNav target

- New production BottomNav from approved preview.
- Legacy preserved as fallback.
- Global mobile usage, not `/cargas`-only.
- Runtime evidence required from DOM, not just file diff.

## Runtime audit markers

Expected in DOM/source:
- `data-bottom-nav-preview-global="true"`
- `data-hy-bottom-nav-preview-lens="true"`

Not expected in mobile shell for new BottomNav:
- `bottomNavClassNames`
- `bottomNavHyLightClassNames`
- `bottomNavHyDarkGlassClassNames`
- `classNames={{...}}`
