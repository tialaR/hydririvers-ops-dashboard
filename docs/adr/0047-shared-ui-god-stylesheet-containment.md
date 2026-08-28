# 0047 - Contain the shipper shared-ui God stylesheet before screen extraction

## Status
Accepted

## Context

`src/features/shipper-mobile-flow/components/shared-ui/shared-ui.module.sass` accumulated styles for multiple unrelated screens and responsibilities. After cargo domain and cargo presentation ownership began moving to `features/cargo`, this stylesheet became a migration trap: moving a screen can silently preserve a reverse dependency on the persona feature through CSS.

## Decision

1. Treat `shared-ui.module.sass` as legacy migration source, not a destination for new styles.
2. Freeze its consumer set and size baseline. It may shrink, but must not gain consumers or lines.
3. `features/cargo` must never import this stylesheet.
4. New cargo-owned presentation styles must live with the cargo component/screen that owns them.
5. Existing persona screens may continue consuming the stylesheet temporarily until their extraction wave.
6. No visual or business behavior is changed by this containment wave.

## Migration order

1. Cargo screens (`Minhas Cargas`, detail, documents, map) receive dedicated cargo-owned style modules.
2. Their imports move away from `shared-ui.module.sass`.
3. Screen ownership moves out of `shipper-mobile-flow` only after the styling dependency is gone.
4. Remaining selectors are decomposed by business capability, not by persona.

## Consequences

The stylesheet becomes a one-way shrinking debt ledger. A future screen extraction cannot accidentally move TypeScript ownership while leaving styling ownership behind.
