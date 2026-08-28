# 0046 — Cargo presentation primitives belong to the Cargo feature

## Status
Accepted

## Context
`shipper-mobile-flow` became a persona-sized feature that owned cargo domain, cargo use cases, cargo screens, and cargo-specific presentation components. The domain/read spine has already moved to `features/cargo`, but cargo-specific visual primitives remained under the persona boundary.

During extraction, `features/cargo/components/cargo-card` was already a valid Cargo-owned component with a different responsibility. Overwriting it would destroy an existing feature boundary and silently merge two distinct APIs.

## Decision
Cargo-specific presentation primitives move to `src/features/cargo/components`.

The existing `cargo-card` remains untouched. The persona-owned compact card migrates as `owned-cargo-compact-card`, preserving its current behavior while giving the two concepts distinct ownership and names.

The moved cluster may consume:
- `features/cargo/domain`;
- shared Design System/layout/i18n utilities;
- other cargo-owned presentation primitives.

It must not import `features/shipper-mobile-flow`.

Persona orchestration may temporarily consume Cargo presentation while the remaining screens are migrated. This is one-way compatibility: `shipper-mobile-flow -> cargo`, never `cargo -> shipper-mobile-flow`.

## Consequences
- the persona God Feature shrinks;
- existing Cargo presentation is not overwritten;
- cargo presentation ownership becomes explicit;
- subsequent screen extraction can occur without reverse coupling;
- visual behavior remains unchanged because files are moved and imports rewired, not redesigned.
