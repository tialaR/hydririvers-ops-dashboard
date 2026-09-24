# HydroRivers — Page 62 Reference Pack v1.0

Status: WORKING REFERENCE PACK

Source supplied from Figma export:
- `Page 62 · Blueprint.svg`
- `Page 62 · Blueprint.png`

The source export is intentionally tracked by SHA-256 in `manifest.json` so a future re-export cannot silently replace the visual contract.

## Current canonical extraction

The first implementation bite freezes the Shipment Card visible in the Page 62 cockpit reference:
- frame: `9636,1500 · 1392×900`
- card crop: `225,114 · 386×232`
- reference bytes: `shipment-card-reference.png.base64`

## Rules

1. Page 61 and Page 62 must reuse the same Shipment Card anatomy.
2. Status variants change semantic tone/data only. They cannot silently redesign the card.
3. Storybook is the component contract surface.
4. Visual comparison uses perceptual thresholds; raw pixel diff remains telemetry.
5. A missing variant, wrong status tone, wrong geometry, or missing state brand is FAIL even when the global visual ratio passes.
6. The full Page 62 source export remains external to the repo for now because it is a large 34 MB SVG; hashes + coordinates keep this pack reproducible and auditable.
