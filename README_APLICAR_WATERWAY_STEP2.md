# HydriRivers Waterway Step 2

Este pacote conecta o domínio hidroviário criado no Step 1 à lista mobile de cargas.

## O que ele faz

- Adiciona contexto hidroviário compacto nos cards de carga:
  - corredor;
  - risco principal;
  - tom visual por severidade.
- Preserva filtros, busca, lista, empty state e mapa.
- Não mexe no bottom sheet de filtros.
- Não mexe no mapa imersivo ainda.
- Não mexe no bottom nav.
- Faz backup dos arquivos alterados antes de editar.

## Como aplicar

Na raiz do projeto:

```bash
unzip -o ~/Downloads/hydririvers-waterway-step2-list-root.zip -d .
chmod +x scripts/apply-waterway-step2.mjs
node scripts/apply-waterway-step2.mjs
npm run lint
npm run typecheck
npm run check:i18n
npm run build
```

## Arquivos alterados pelo script

- `src/features/dashboard/components/operations-board/operations-board.tsx`
- `src/features/dashboard/components/operations-board/operations-board.module.scss`

## Pré-requisito

O Step 1 precisa existir:

- `src/features/waterway-tracking/index.ts`
