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


## D04–D05 visual contract

Source supplied from Figma export:
- `D04–D05 · Cargo Cockpit + Timeline.svg`
- SHA-256: `dd3371bcdcb43273d9e6307a04b2a32dd947ba1245be42d0081f8e7dfe21b132`
- canvas: `1440×980`

Frozen visual crops:
- D04 Cargo Cockpit: `654,314 · 380×414`
- D05 Operational Timeline: `1050,314 · 354×414`

The committed WebP references are intentionally reduced to 50% for perceptual regression speed. Runtime geometry is still checked at full size with ±2 px tolerance.

The isolated Storybook stories are the certification surfaces:
- `Page 62 / D04 Cargo Cockpit / Reference`
- `Page 62 / D05 Operational Timeline / Reference`


## D06–D07 component contract

The next desktop journey bite reuses Page 62 frame 20 as the source for isolated component certification.

Frozen crops:
- D06 Documents & Evidence: frame-relative `98,302 · 600×548`
- D07 Risk & Occurrence: frame-relative `712,302 · 660×548`

Isolated Storybook certification surfaces:
- `Page 62 / D06 Documents & Evidence / Reference`
- `Page 62 / D07 Risk & Occurrence / Reference`

These surfaces intentionally validate the reusable operational panels before the complete D06/D07 screen composition.
