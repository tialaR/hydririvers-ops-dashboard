# 0051 - Owned cargo detail screen ownership

## Status
Accepted

## Context
The authenticated cargo detail presentation still lived inside `shipper-mobile-flow`, even after cargo domain, repositories, primitives, visual styles and public/owned boundaries were extracted. Keeping the complete detail body there preserves persona-level ownership and duplicates the newer `cargo/owned` boundary.

## Decision
1. The detail presentation body for authenticated cargo belongs to `src/features/cargo/owned/screens`.
2. `shipper-mobile-flow/screens/cargo-detail-screen.tsx` becomes a thin compatibility adapter responsible only for the persona shell and the still-legacy map preview bridge.
3. The canonical owned screen cannot import `shipper-mobile-flow`.
4. Business rules, localized routes, links, translations and rendered content remain unchanged.
5. The adapter is temporary migration debt and must keep shrinking in later waves.

## Consequences
- The largest private detail screen body leaves the persona God Feature.
- The cargo-owned boundary becomes the source of truth for authenticated detail presentation.
- Shell migration and map preview extraction can proceed independently without blocking ownership cleanup.
