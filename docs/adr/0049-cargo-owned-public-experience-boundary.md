# 0049 - Owned and public cargo experience boundary

## Status
Accepted

## Context
The product has two materially different cargo experiences: public cargo discovery and authenticated owned cargo operations. Treating both as one undifferentiated feature risks leaking permissions, private read models, presentation decisions, and workflows across boundaries.

## Decision
`features/cargo` remains the cargo bounded area, but explicit experience slices are introduced:

- `features/cargo/owned`: authenticated/private cargo experience and its private read models/presentation.
- `features/cargo/public`: public cargo marketplace/discovery presentation.
- truly shared cargo concepts remain at the cargo root only when both experiences legitimately use them.

Owned and public slices must not import each other directly. Shared concepts must be promoted deliberately to a neutral cargo-level module rather than reached across the boundary.

## Consequences
Permissions and visibility rules become easier to reason about and test. Future screens can evolve independently while preserving a shared cargo domain where appropriate.
