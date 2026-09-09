# 0060 - Auth spine feature ownership

## Status

Accepted

## Context

Authentication bootstrap data and read use cases were still owned by `shipper-mobile-flow`, even though authentication is a product capability and `src/features/auth` already owns auth domain, services and forms.

## Decision

1. `src/features/auth` owns the authentication experience read spine: current user bootstrap, phone-country options and mock OTP seam.
2. App routes consume auth application use cases directly.
3. `shipper-mobile-flow` may keep temporary presentation adapters, but cannot own auth repositories, auth mock data or auth read use cases.
4. Compatibility types in `shipper-flow-types.ts` are aliases only and must point to auth-owned types while presentation migration is incomplete.
5. Auth must never import `shipper-mobile-flow`.

## Consequences

- Persona ownership shrinks without changing authentication behavior.
- Login/register/OTP presentation can be extracted in the next wave without dragging data ownership with it.
- Future auth API/repository changes have a single feature boundary.
