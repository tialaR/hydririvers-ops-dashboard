# 0063 - Auth ownership closeout

## Status

Accepted

## Context

SO-017 moved the authentication read spine, login/register/OTP presentation and final compatibility adapters out of `shipper-mobile-flow` into `features/auth`.

The closeout must prevent the old persona feature from regaining authentication ownership while keeping unrelated authenticated-shell identity/profile concerns scoped for later decomposition.

## Decision

1. `features/auth` is the canonical owner of authentication domain/read data and login/register/OTP presentation.
2. `features/auth` must not import `features/shipper-mobile-flow`.
3. Login, register and OTP routes consume canonical auth screens directly.
4. Persona compatibility screens for login/register/OTP remain deleted.
5. `isAuthenticated` / `setAuthenticated` local persona state remains retired.
6. Current-user display data used by authenticated shell/profile is not treated as auth-flow compatibility debt in SO-017. That surface is a separate shell/profile ownership problem and will be handled independently.

## Consequences

- SO-017 can close without hiding shell/profile debt inside Auth.
- Future work cannot reintroduce authentication presentation into the Persona God Feature.
- The remaining Persona God Feature can be attacked by coherent product domains instead of by persona journey.
