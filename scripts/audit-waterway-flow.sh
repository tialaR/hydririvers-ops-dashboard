#!/usr/bin/env bash
set -euo pipefail

echo "== Audit 1: cargo list + waterway domain =="
grep -RInE "operations-board|filteredCargo|cargoCard|statusFilter|advancedFilters|CargoWaterwayTracking|waterway" src/features src/shared || true

echo
echo "== Audit 2: selected cargo + immersive map =="
grep -RInE "immersive|map|selectedCargo|selected|cargo-action-sheet|Visão geral|Jornada|Documentos|Custos|Prioridade|CargoWaterwayTracking|waterway" src || true

echo
echo "== Audit 3: final safety scan =="
grep -RInE "Math.random|Date.now|getRandom|TODO|FIXME|hardcoded|waterway|CargoWaterwayTracking|HydroRoute" src || true

echo
echo "== Audit 4: locale route safety =="
grep -RInE "href=\"/cargas|href='\/cargas|router\.push\(\"/cargas|router\.push\('/cargas|replace\(\"/cargas|replace\('/cargas" src || true

echo
echo "== Validation =="
npm run lint
npm run typecheck
npm run check:i18n
npm run build
npm test
npm run test:mock-mode
