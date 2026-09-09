# ADR 0057 — Public cargo presentation ownership

Public cargo list/detail presentation belongs to `features/cargo/public` together with its domain, application and repository spine.

`shipper-mobile-flow` may keep thin compatibility adapters only for persona shell primitives while those primitives are still being neutralized. Canonical public cargo presentation must not import persona code or `cargo/owned`.

The restricted public cargo card owns its own Sass Module. It must not borrow styles from the authenticated owned-cargo experience.
