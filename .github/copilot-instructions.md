# GitHub Copilot Instructions for HydriRivers-Dashboard

Act as an implementation assistant, not a speculative designer.

- Audit before editing.
- Keep changes small and scoped.
- Preserve Next.js 16 App Router, React 19, TypeScript, Sass/CSS Modules and next-intl localized routes.
- Preserve mock-mode.
- Keep mobile and desktop separate.
- Prefer `.module.sass` for touched/created component styles.
- Avoid global CSS and `!important`.
- Do not install dependencies without approval.
- Do not create charts/reports when the requested deliverable is a component or code patch.

Validation for code changes:

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

Mobile preview route:

```txt
http://localhost:3000/pt-BR/cargas
```
