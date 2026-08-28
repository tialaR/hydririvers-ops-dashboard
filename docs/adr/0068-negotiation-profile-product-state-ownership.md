# ADR 0068 — Negotiation, profile and product-state ownership
Negotiation moves to `features/negotiations`; profile/identity moves to `features/profile` and stays separate from Auth; generic product states move to `features/product-shell`. Owned-cargo offer data remains owned by `features/cargo/owned`. No business rule, i18n, route semantics or visual intent changes.
