# Mock vessel images — `public/mock/vessels/`

Acervo alinhado ao manifesto **`hydririvers-vessel-hero-kit/manifest/vessel-assets.manifest.json`** (fase 2). Ficheiros servidos em Next como `/mock/vessels/<nome>`.

## Ficheiros em uso pelo helper `getVesselVisual`

| Ficheiro | Formato | Notas |
|----------|---------|--------|
| `cargo-vessel-real-water-01.webp` | WebP | Água escura / cabotagem. |
| `cargo-container-aerial-blue-01.webp` | WebP | Contêineres, vista aérea. |
| `cargo-container-open-water-01.webp` | WebP | Mar aberto, maior porte. |
| `trade-boat-river-01.webp` | WebP | Manifest: `rustic-moody` → helper expõe **`foggy-cinematic`** (CSS atual). |
| `cargo-vessel-port-01.jpg` | JPEG | Porto / entardecer. |
| `rustic-fishing-boat-dusk-01.avif` | AVIF | Idem mapeamento para **`foggy-cinematic`**. |
| `vessel-foggy-cinematic-01.avif` | AVIF | Neblina / clima escuro. |

**Não** copiado para o helper: `river-night-background-01.jpg` (manifest `background-only` — sem embarcação dominante).

## Helper determinístico

`getVesselVisual(cargo)` em `src/features/cargo-market/components/cargo-detail/cargo-vessel-visual.ts` escolhe sempre o mesmo `src`, `treatment`, `objectPosition` e `vesselName` para o mesmo `Cargo` (combinação estável de `id`, origem/destino, tipo, `serviceType`, `mainRiver`, `corridor`). Índice: `(stableHash(id) ^ stableHash(route) ^ stableHash(kind)) % 7`.

`getCargoDetailOverviewVisuals(cargo)` reutiliza esse helper.

## Critério de uso

- Sem `Math.random()` / `Date.now()` para imagem.
- Sem URLs remotas.
- Confirmar licenças antes de uso público (ver nota no manifest do kit).
