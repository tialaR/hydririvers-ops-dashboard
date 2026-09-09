# 0044 - Cargo spine belongs to the cargo feature

## Status
Accepted

## Decision
Owned-cargo domain types, repository contract, mock repository and primary read use cases belong to `src/features/cargo`.
`shipper-mobile-flow` may temporarily consume those contracts through compatibility aliases, but it is no longer allowed to own cargo data/repository/application primitives.

## Why
A persona is a composition of capabilities, not a feature boundary. Cargo ownership must remain usable by mobile, tablet and desktop compositions without depending on a persona God Feature.

## Migration sequence
1. Move cargo domain/data/application spine.
2. Keep compatibility aliases for existing presentation code.
3. Move screens and product composition in later waves.
4. Remove compatibility aliases when no consumer remains.
