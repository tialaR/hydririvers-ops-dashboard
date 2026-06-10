#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
OUT_DIR="$ROOT_DIR/_agent_context"
ZIP_NAME="hydri-agent-context-$(date +%Y%m%d-%H%M).zip"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
mkdir -p "$OUT_DIR/code"
mkdir -p "$OUT_DIR/code/shared"
mkdir -p "$OUT_DIR/code/cargo"
mkdir -p "$OUT_DIR/code/layout"
mkdir -p "$OUT_DIR/code/tests"
mkdir -p "$OUT_DIR/docs"

echo "Exportando contexto do HydriRivers..."

git branch --show-current > "$OUT_DIR/01_branch.txt" || true
git status --short > "$OUT_DIR/00_git_status.txt" || true
git diff --name-only > "$OUT_DIR/02_changed_files.txt" || true
git ls-files > "$OUT_DIR/03_repo_files.txt" || true

cp package.json "$OUT_DIR/package.json" 2>/dev/null || true
cp tsconfig.json "$OUT_DIR/tsconfig.json" 2>/dev/null || true
cp next.config.* "$OUT_DIR/" 2>/dev/null || true
cp AGENTS.md "$OUT_DIR/" 2>/dev/null || true
cp README.md "$OUT_DIR/" 2>/dev/null || true

find docs -maxdepth 1 -type f \
  \( -name "*.md" -o -name "*.txt" \) \
  -exec cp {} "$OUT_DIR/docs/" \; 2>/dev/null || true

cp src/shared/layout/mobile-product-shell/product-mobile-bottom-nav.tsx "$OUT_DIR/code/layout/" 2>/dev/null || true
cp src/shared/layout/mobile-product-shell/resolve-mobile-page-title.ts "$OUT_DIR/code/layout/" 2>/dev/null || true

cp src/shared/components/bottom-nav/BottomNav.tsx "$OUT_DIR/code/shared/" 2>/dev/null || true
cp src/shared/components/bottom-nav/BottomNav.module.sass "$OUT_DIR/code/shared/" 2>/dev/null || true
cp src/shared/components/bottom-nav/BottomNavLegacy.tsx "$OUT_DIR/code/shared/" 2>/dev/null || true
cp src/shared/components/bottom-nav/BottomNavLegacy.module.sass "$OUT_DIR/code/shared/" 2>/dev/null || true
cp src/shared/components/bottom-nav/index.ts "$OUT_DIR/code/shared/" 2>/dev/null || true
cp src/shared/components/bottom-nav/bottom-nav-icons.tsx "$OUT_DIR/code/shared/" 2>/dev/null || true
cp src/shared/components/bottom-nav/bottom-nav-motion.tsx "$OUT_DIR/code/shared/" 2>/dev/null || true
cp src/shared/components/bottom-nav/bottom-nav-state.ts "$OUT_DIR/code/shared/" 2>/dev/null || true

cp src/shared/components/icon-button/IconButton.module.scss "$OUT_DIR/code/shared/" 2>/dev/null || true
cp src/shared/components/icon-button/IconButton.tsx "$OUT_DIR/code/shared/" 2>/dev/null || true

cp src/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list.tsx "$OUT_DIR/code/cargo/" 2>/dev/null || true
cp src/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list.module.scss "$OUT_DIR/code/cargo/" 2>/dev/null || true

cp tests/unit/shared/layout/product-mobile-bottom-nav.test.ts "$OUT_DIR/code/tests/" 2>/dev/null || true

find src/app -maxdepth 4 -type f \
  \( -name "page.tsx" -o -name "layout.tsx" -o -name "*.module.sass" -o -name "*.module.scss" \) \
  | sort > "$OUT_DIR/04_app_route_files.txt" 2>/dev/null || true

find src/features src/shared -maxdepth 5 -type f \
  \( -name "*.tsx" -o -name "*.ts" -o -name "*.module.sass" -o -name "*.module.scss" \) \
  | sort > "$OUT_DIR/05_src_key_files.txt" 2>/dev/null || true

zip -r "$ZIP_NAME" "_agent_context" \
  -x "*/node_modules/*" \
  -x "*/.next/*" \
  -x "*/.git/*" \
  -x "*/.env*" \
  >/dev/null

echo "Contexto gerado:"
echo "$ZIP_NAME"