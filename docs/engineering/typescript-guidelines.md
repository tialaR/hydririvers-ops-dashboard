# TypeScript Guidelines

## Principles
- Prefer explicit types for public props, service returns, and domain contracts.
- Use `type` for unions, mapped types, and aliases.
- Use `interface` only when declaration merging or extension is useful.
- Prefer `satisfies` for mocks and config objects.
- Avoid `any`; prefer `unknown` plus refinement.
- Keep casts with `as` rare and local.

## Shared vs Feature types
- Shared types belong in `src/shared/types` only when reused by multiple domains.
- Feature-specific contracts stay inside the feature.
- Form types should live next to the Zod schema that defines them.

## Storage and URL data
- Never trust values from `localStorage`, `sessionStorage`, or query params.
- Parse them with Zod or with small validation helpers.
- Fall back to safe defaults when parsing fails.

## Good examples
```ts
const themes = ['light', 'dark'] as const;
type Theme = (typeof themes)[number];

const cargoMocks = [{ id: 'CARGO-001' }] satisfies Cargo[];
```
