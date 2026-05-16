import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const targets = [
  'src/app/[locale]/cargas/[id]/cargo-map-immersive-client.tsx',
  'src/shared/layout/admin-chrome/admin-chrome.tsx',
];

function read(file) {
  const full = path.join(root, file);

  if (!fs.existsSync(full)) {
    console.log(`skip missing: ${file}`);
    return null;
  }

  return {
    file,
    full,
    text: fs.readFileSync(full, 'utf8'),
  };
}

function write(target, text) {
  const backup = `${target.full}.bak-canonical-cargo-return-${Date.now()}`;
  fs.writeFileSync(backup, target.text, 'utf8');
  fs.writeFileSync(target.full, text, 'utf8');
  console.log(`patched: ${target.file}`);
  console.log(`backup: ${path.relative(root, backup)}`);
}

function insertAfterImports(text, snippet) {
  if (text.includes(snippet.trim())) {
    return text;
  }

  const imports = [...text.matchAll(/^import[\s\S]*?;\n/gm)];

  if (imports.length === 0) {
    return `${snippet}\n${text}`;
  }

  const lastImport = imports[imports.length - 1];
  const insertAt = lastImport.index + lastImport[0].length;

  return `${text.slice(0, insertAt)}\n${snippet}\n${text.slice(insertAt)}`;
}

function patchMapClient(target) {
  let text = target.text;

  // O mapa deve voltar para a lista canonica de cargas, nao marketplace.
  text = text.replace(
    /const\s+cargoesHref\s*=\s*appRoutes\.cargos\.marketplace\([^;\n]*\);/,
    'const cargoesHref = `/${locale}/cargas`;',
  );

  // Se por acaso algum patch anterior deixou outro destino para cargoesHref,
  // padroniza qualquer definicao simples.
  text = text.replace(
    /const\s+cargoesHref\s*=\s*[^;\n]*\/marketplace[^;\n]*;/g,
    'const cargoesHref = `/${locale}/cargas`;',
  );

  // Remove comportamento dependente do historico.
  text = text.replace(/router\.back\(\)/g, 'router.replace(cargoesHref)');
  text = text.replace(/window\.history\.back\(\)/g, 'router.replace(cargoesHref)');
  text = text.replace(/\bhistory\.back\(\)/g, 'router.replace(cargoesHref)');

  // Se existe handler canonico, garante replace nele.
  text = text.replace(
    /const\s+handleReturnToCargoes\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\n\s*\};/,
    `const handleReturnToCargoes = () => {
    router.replace(cargoesHref);
  };`,
  );

  if (text !== target.text) {
    write(target, text);
  } else {
    console.log(`no changes needed: ${target.file}`);
  }
}

function patchAdminChrome(target) {
  let text = target.text;

  const helper = "const getHydriCargoesListHref = (locale: string) => `/${locale}/cargas`;";

  // Se o AdminChrome usa appRoutes.cargos.marketplace para o item Cargas,
  // troca por rota canonica real da lista.
  if (text.includes('appRoutes.cargos.marketplace(')) {
    text = insertAfterImports(text, helper);

    text = text.replace(
      /appRoutes\.cargos\.marketplace\(([^)]*)\)/g,
      'getHydriCargoesListHref($1)',
    );
  }

  // Alguns menus bloqueiam clique quando o item esta ativo.
  // Em /[locale]/cargas/[id], Cargas pode estar ativo visualmente,
  // mas o clique nao pode virar no-op: precisa voltar para /[locale]/cargas.
  //
  // Patch conservador para padroes comuns.
  text = text.replace(
    /if\s*\(\s*isActive\s*\)\s*\{\s*event\.preventDefault\(\);\s*return;\s*\}/g,
    "if (isActive && pathname === href) {\n      event.preventDefault();\n      return;\n    }",
  );

  text = text.replace(
    /if\s*\(\s*item\.isActive\s*\)\s*\{\s*event\.preventDefault\(\);\s*return;\s*\}/g,
    "if (item.isActive && pathname === item.href) {\n      event.preventDefault();\n      return;\n    }",
  );

  text = text.replace(
    /if\s*\(\s*active\s*\)\s*\{\s*event\.preventDefault\(\);\s*return;\s*\}/g,
    "if (active && pathname === href) {\n      event.preventDefault();\n      return;\n    }",
  );

  if (text !== target.text) {
    write(target, text);
  } else {
    console.log(`no changes needed: ${target.file}`);
  }
}

for (const file of targets) {
  const target = read(file);

  if (!target) {
    continue;
  }

  if (file.includes('cargo-map-immersive-client.tsx')) {
    patchMapClient(target);
  }

  if (file.includes('admin-chrome.tsx')) {
    patchAdminChrome(target);
  }
}

console.log('');
console.log('Audit after patch:');
console.log('1) Map must not use router.back/history.back.');
console.log('2) Map cargoesHref must be /${locale}/cargas.');
console.log('3) AdminChrome Cargas must not point to marketplace.');
