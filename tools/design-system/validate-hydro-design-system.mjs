#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const docsDir = path.join(root, 'docs');
const dsDir = path.join(srcDir, 'shared', 'design-system');

const errors = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function shouldIgnoreForTokenChecks(filePath) {
  const rel = toPosix(path.relative(root, filePath));
  return (
    rel.includes('/docs/design/audits/') ||
    rel.includes('/docs/design/migration/') ||
    rel === 'tools/design-system/validate-hydro-design-system.mjs' ||
    rel === 'tools/design-token-import/output/import-report.md'
  );
}

async function validateTokenPrefixes(files) {
  for (const file of files) {
    if (shouldIgnoreForTokenChecks(file)) {
      continue;
    }
    const rel = toPosix(path.relative(root, file));
    const content = await readFile(file, 'utf8');
    if (rel.startsWith('src/') && content.includes('--ios-')) {
      errors.push(`Token proibido '--ios-*' encontrado em ${rel}`);
    }
    if (rel.startsWith('src/') && content.includes('--cargo-lab-')) {
      errors.push(`Token legado '--cargo-lab-*' fora de docs encontrado em ${rel}`);
    }
    if (
      rel.startsWith('src/') &&
      !rel.startsWith('src/shared/design-system/') &&
      /(--)((hydro-kit|hydro)-)/.test(content)
    ) {
      errors.push(`Token Hydro definido fora de src/shared/design-system em ${rel}`);
    }
  }
}

async function validatePrimitiveImports(files) {
  const brokenImportRegex =
    /from\s+['"]([^'"]*\/primitives\/liquid-glass-([^/'"]+)\/liquid-glass-([^/'"]+))['"]/g;
  for (const file of files) {
    const rel = toPosix(path.relative(root, file));
    if (!rel.startsWith('src/')) {
      continue;
    }
    const content = await readFile(file, 'utf8');
    for (const match of content.matchAll(brokenImportRegex)) {
      const [, importPath, folderSlug, fileSlug] = match;
      if (folderSlug !== fileSlug) {
        errors.push(`Import quebrado de primitive Liquid Glass em ${rel}: ${importPath}`);
      }
    }
    if (/\/primitives\/liquid-glass-[^/'"]+\/liquid-glass-[^/'"]+\/liquid-glass-/.test(content)) {
      errors.push(`Import aninhado inválido de primitive Liquid Glass em ${rel}`);
    }
  }
}

async function validateBackupsInApp(files) {
  for (const file of files) {
    const rel = toPosix(path.relative(root, file));
    if (!rel.startsWith('src/app/')) {
      continue;
    }
    if (rel.includes('.backup-') || rel.includes('.before')) {
      errors.push(`Arquivo de backup proibido em src/app: ${rel}`);
    }
  }
}

async function validateNonEmptyDesignSystem(files) {
  for (const file of files) {
    const rel = toPosix(path.relative(root, file));
    if (!rel.startsWith('src/shared/design-system/')) {
      continue;
    }
    const fileStat = await stat(file);
    if (fileStat.size === 0) {
      errors.push(`Arquivo vazio em design-system: ${rel}`);
    }
  }
}

async function validateRequiredFiles() {
  const requiredFiles = [
    path.join(dsDir, 'tokens', 'generated', 'index.ts'),
    path.join(dsDir, 'materials', 'liquid-glass-material', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-surface', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-button', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-segmented-control', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-search-field', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-toolbar', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-sheet', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-menu', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-scroll-edge', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-text-field', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-progress', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-switch', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-tab-bar', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-popover', 'index.ts'),
    path.join(dsDir, 'primitives', 'liquid-glass-window', 'index.ts'),
  ];

  for (const requiredFile of requiredFiles) {
    try {
      await stat(requiredFile);
    } catch {
      errors.push(`Arquivo obrigatório ausente: ${toPosix(path.relative(root, requiredFile))}`);
    }
  }
}

async function validateGeneratedHeaders(files) {
  for (const file of files) {
    const rel = toPosix(path.relative(root, file));
    if (!rel.startsWith('src/shared/design-system/tokens/generated/')) {
      continue;
    }
    const content = await readFile(file, 'utf8');
    const firstChunk = content.slice(0, 300);
    const isGeneratedScssBridge =
      rel.endsWith('hydro-kit.module.scss') && firstChunk.includes('hydroKitTheme');
    if (!/generated/i.test(firstChunk) && !isGeneratedScssBridge) {
      errors.push(`Arquivo gerado sem header de generated: ${rel}`);
    }
  }
}

const LOCAL_THEME_CLASS_BY_FILE = {
  'hydro.semantic.module.scss': 'hydroSemanticTheme',
  'hydro-kit.module.scss': 'hydroKitTheme',
};

async function validateCssModuleNoGlobalUse(files) {
  for (const file of files) {
    const rel = toPosix(path.relative(root, file));
    if (!rel.endsWith('.module.scss') || !rel.startsWith('src/shared/design-system/tokens/generated/')) {
      continue;
    }
    const content = await readFile(file, 'utf8');
    if (/@use\s+['"]\.\/hydro-kit\.css['"]/.test(content)) {
      errors.push(
        `@use de hydro-kit.css em ${rel} puxa seletores globais para CSS Modules — carregue hydro-kit.css só no HydroDesignSystemRoot`,
      );
    }
  }
}

async function validateCssModulePureSelectors(files) {
  for (const file of files) {
    const rel = toPosix(path.relative(root, file));
    if (!rel.endsWith('.module.scss') || !rel.startsWith('src/shared/design-system/tokens/generated/')) {
      continue;
    }

    const content = await readFile(file, 'utf8');
    const fileName = path.basename(rel);
    const localClass = LOCAL_THEME_CLASS_BY_FILE[fileName];

    if (/:root\s*\{/.test(content)) {
      errors.push(`Seletor impuro ':root' em ${rel} — use classe local (.${localClass ?? 'hydro*Theme'})`);
    }

    if (/:global\([^)]+\)\s*\{/.test(content)) {
      errors.push(`Seletor impuro ':global(...){' sem classe local em ${rel}`);
    }

    const ruleBlocks = content.match(/[^{}]+\{/g) ?? [];
    for (const block of ruleBlocks) {
      const selector = block.slice(0, -1).trim();
      if (!selector || selector.startsWith('@') || selector === ':export') {
        continue;
      }

      const usesDataTheme = /\[data-theme/.test(selector);
      const usesDataContrast = /\[data-contrast/.test(selector);
      if (!usesDataTheme && !usesDataContrast) {
        continue;
      }

      if (!localClass || !selector.includes(`.${localClass}`)) {
        errors.push(
          `Seletor [data-theme]/[data-contrast] sem classe local (.${localClass ?? 'hydro*Theme'}) em ${rel}: ${selector}`,
        );
      }
    }
  }
}

const srcFiles = await walk(srcDir);
const docFiles = await walk(docsDir);
const toolFiles = await walk(path.join(root, 'tools'));
const allFiles = [...srcFiles, ...docFiles, ...toolFiles];

await validateTokenPrefixes(allFiles);
await validatePrimitiveImports(srcFiles);
await validateBackupsInApp(srcFiles);
await validateNonEmptyDesignSystem(srcFiles);
await validateRequiredFiles();
await validateGeneratedHeaders(srcFiles);
await validateCssModuleNoGlobalUse(srcFiles);
await validateCssModulePureSelectors(srcFiles);

if (errors.length > 0) {
  console.error('Hydro DS check falhou:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Hydro DS check passou.');
