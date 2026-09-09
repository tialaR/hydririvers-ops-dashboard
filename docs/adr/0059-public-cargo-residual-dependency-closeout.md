# 0059 - Public cargo residual dependency closeout

## Status

Accepted

## Context

SO-016 moved public cargo domain, privacy policy, repositories, mock data, application use cases and presentation into `src/features/cargo/public`. After the presentation screens were collapsed from `shipper-mobile-flow`, a few compatibility seams still pointed from the persona feature back into public cargo ownership:

- `publicCargo` in the persona repository composition object;
- `SHIPPER_PUBLIC_CARGOES` re-exported by the persona mock aggregator;
- `getShipperPublicCargo` in the persona mock aggregator;
- `ShipperPublicCargo` in persona flow types;
- a deprecated `SHIPPER_PUBLIC_CARGOES` alias inside the public mock module.

None of those seams had active consumers after Wave 03.

## Decision

1. `cargo/public` is the sole owner of public cargo domain, data, application and presentation code.
2. `shipper-mobile-flow` must not import from `cargo/public` for repository, mock, type or presentation ownership.
3. Public cargo navigation labels and route ids may remain in shell/navigation code because they express navigation, not feature ownership.
4. Dead compatibility aliases are removed instead of being preserved indefinitely.
5. `.sharkops/contracts/verify-public-cargo-so016-closeout.mjs` prevents these seams from returning.

## Consequences

- SO-016 can close with no public cargo implementation ownership inside the persona God Feature.
- Future public cargo work lands directly in `features/cargo/public`.
- Persona navigation may still point to `/cargas-publicas`, while implementation dependency remains zero.
- Any reintroduction of the removed compatibility names fails the SharkOps closeout gate.
