# Hydri Codebase Map

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Sass/CSS Modules
- next-intl with `/[locale]` routes

## Architecture

- `src/app`: routing, RSC, layouts, pages and server actions.
- `src/features`: feature-owned components, hooks, services, mocks, types, tests and styles.
- `src/shared`: truly shared UI, layout, routing, i18n, providers, constants, QA, preferences and utilities.

## Current high-signal files

Mobile shell:
- `src/shared/layout/mobile-product-shell/product-mobile-bottom-nav.tsx`
- `src/shared/layout/mobile-product-shell/resolve-mobile-page-title.ts`

BottomNav (official global mobile nav; legacy removed):
- `src/shared/components/bottom-nav/BottomNav.tsx`
- `src/shared/components/bottom-nav/BottomNav.module.sass`
- `src/shared/components/bottom-nav/index.ts`
- `src/shared/components/bottom-nav/bottom-nav-icons.tsx`
- `src/shared/components/bottom-nav/bottom-nav-motion.tsx`
- `src/shared/components/bottom-nav/bottom-nav-state.ts`

Cargas mobile:
- `src/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list.tsx`
- `src/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list.module.scss`

Tests:
- `tests/unit/shared/layout/product-mobile-bottom-nav.test.ts`
