# 0062 - Auth compatibility adapter collapse

## Status
Accepted

## Context

SO-017 Wave 01 moved the authentication read spine to `features/auth`. Wave 02 moved login, registration and OTP presentation there, but kept three compatibility adapters inside `shipper-mobile-flow` so existing app routes could reuse persona-owned shell, button and transient authentication state without increasing the frozen external-consumer set.

The adapters were migration debt. Auth presentation remained indirectly coupled to a persona feature through `MobileAppShell`, `PrimaryButton` and `useShipperFlow().setAuthenticated()`.

## Decision

1. Login, registration and OTP routes consume `features/auth` screens directly.
2. Auth owns a thin `AuthShell` composed over the neutral `ProductShellFrame`.
3. Auth owns its action-button presentation over the neutral Design System core `Button` primitive.
4. The three persona auth screen adapters are removed.
5. The unused `isAuthenticated` / `setAuthenticated` state is removed from `ShipperFlowProvider`; it had no reader outside the OTP compatibility adapter.
6. Existing auth visual behavior is preserved; this wave does not redesign authentication or change API/auth business rules.
7. Existing `--hy-shipper-*` auth style references are retained only as local compatibility aliases under `AuthShell`, backed by `--hy-auth-*` values. Token vocabulary migration is a separate concern.

## Consequences

- `features/auth -> shipper-mobile-flow` remains zero.
- Three persona feature files and three external persona consumers disappear.
- Authentication routes no longer require persona UI adapters.
- Product-shell and button semantics reuse neutral shared primitives rather than introducing a parallel semantic primitive.
- The route group name remains unchanged because route topology is outside this wave.
