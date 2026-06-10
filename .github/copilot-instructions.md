# GitHub Copilot Instructions for HydriRivers-Dashboard

You are assisting on HydriRivers-Dashboard as an implementation partner, not as a generic code generator.

Your job is to reduce rework and avoid loops. Before changing code, classify the request and audit the active files.

## Project baseline

- Next.js 16 App Router
- React 19
- TypeScript
- Sass/CSS Modules
- next-intl with `/[locale]` routes
- Current priority: mobile `/pt-BR/cargas`
- Keep mobile and desktop separated
- Prefer `.module.sass` for touched or new component styles
- Avoid broad global CSS
- Preserve mock-mode
- Preserve i18n
- Do not install dependencies without explicit approval
- Do not use `DSV2`, `dev-v2`, or lab names in production code
- Prefer Hydri naming: `Hy`, `hy-`, `--hy-*`

## Operating protocol

Classify each task first:

1. Audit
2. Component/UI
3. Visual tuning
4. Bug/behavior
5. Patch/ZIP
6. Documentation/decision

Then answer or act using:

- Veredito
- Evidência
- Ação
- Validação
- Preview
- Rollback, when applicable

## Anti-redemoinho rules

- Do not generate a patch without a closed diagnosis.
- Do not tune visual CSS if the wrong component is mounted.
- Do not answer with charts or reports when the task is to build a component.
- Do not create labs when the task is production.
- Do not use `.bak` files as active source.
- Do not leave new production components controlled by old skins/classNames.
- Keep patches small.
- Include validation commands.

## Validation commands

Run after code changes:

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

For mobile UI preview:

```txt
http://localhost:3000/pt-BR/cargas
```

## BottomNav rule

For BottomNav work:

- approved preview becomes global production BottomNav;
- old BottomNav becomes `BottomNavLegacy`;
- mobile shell renders the new `<BottomNav />` globally;
- mobile shell must not pass `bottomNavHyLightClassNames`, `bottomNavHyDarkGlassClassNames`, `bottomNavClassNames`, or `classNames={{...}}` to the new BottomNav;
- `/pt-BR/cargas` is a validation route, not a route-specific exception.

Acceptance criteria:

- `BottomNav.tsx` imports `BottomNav.module.sass`;
- DOM contains `data-bottom-nav-preview-global="true"`;
- DOM contains `data-hy-bottom-nav-preview-lens="true"`;
- `BottomNavLegacy.tsx` exists but is not used by the mobile shell;
- active item follows route;
- lens moves between items;
- click/tap navigates;
- reduced motion is preserved;
- lint, typecheck, and i18n pass.
