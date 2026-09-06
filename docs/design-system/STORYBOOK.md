# HydroRivers Design System — Storybook

## Purpose

Storybook is the living catalog for reusable HydroRivers UI. It documents component contracts, states, semantic themes and accessibility before those pieces are composed into product screens.

## Commands

`npm run storybook` starts the local catalog on port 6006.  
`npm run build-storybook` verifies that the catalog can be statically built.

## Theme contract

Stories use `data-hy-theme="dark|light"` and the semantic bridge in `src/shared/design-system/foundations/semantic-tokens.css`.

The `--hy-*` variables are the forward-facing semantic contract. Existing variables remain aliases only while production components migrate incrementally.

## Promotion rule

A story is not proof that a component is APPROVED/DIAMOND. Storybook proves implementation states. Product homologation still follows the canonical HydroRivers Source of Truth.

## First published primitive

`Foundations/Button` exposes primary, secondary, ghost, loading and disabled states in both themes through the global theme control.
