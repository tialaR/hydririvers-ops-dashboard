# 0043 - Persona God Feature containment and capability ownership

## Status

Accepted

## Context

`src/features/shipper-mobile-flow` accumulated an entire persona journey under one feature boundary: authentication, cockpit, cargo ownership, cargo detail, maps, documents, negotiations, hydrology, impact, notifications, profile, shell, navigation, data adapters and repositories.

That structure is convenient for a prototype, but it violates the intended feature-based architecture. A persona is an experience composed from business capabilities; it should not become the owner of every capability the persona touches.

## Decision

1. `src/features/shipper-mobile-flow` is now a **contained migration source**, not a place for new product capability code.
2. The directory may shrink during migration, but may not gain new files after this baseline.
3. New external consumers of `@/features/shipper-mobile-flow/*` are forbidden.
4. `src/shared` must never depend on `shipper-mobile-flow`.
5. Extraction order follows business capability, not screen or persona:
   - cargo ownership / cargo detail / documents / operational map;
   - negotiations;
   - hydrology and impact;
   - notifications;
   - profile/auth boundaries;
   - shell/navigation composition.
6. Existing business rules, route behavior, i18n and mock-mode contracts remain unchanged while capabilities move.
7. A capability is considered extracted only when its runtime code, tests and ownership live outside `shipper-mobile-flow`, and the containment baseline shrinks accordingly.

## Why containment comes before mass moves

The working tree contains valuable visual and product work. A mass directory move would mix architectural cleanup with current UI changes and create a large rollback surface. The containment gate stops further growth immediately, while later SharkOps waves can extract coherent capabilities with reversible patches and full gates.

## Target shape

```text
src/features/
  auth/
  cargo/
  negotiations/
  hydrology/
  impact/
  notifications/
  profile/

src/shared/
  design-system/
  layout/
  navigation/
```

The Embarcador journey remains a product composition at the App Router level. The persona does not become a domain namespace.
