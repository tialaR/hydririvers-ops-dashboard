# Hydro Design Tokens

## Fonte

Os tokens vem dos ZIPs exportados do Figma e entram no pipeline em `tools/design-token-import/input`.

## Prefixos oficiais

- Brutos: `--hydro-kit-*`
- Semanticos: `--hydro-*`
- Proibido para novos usos: `--ios-*`

## Pipeline

Execute:

```bash
npm run tokens:design
```

Alias legado (mantido para compatibilidade):

```bash
npm run tokens:ios
```

Saidas geradas:

- `src/shared/design-system/tokens/generated/hydro-kit.raw-tokens.json`
- `src/shared/design-system/tokens/generated/hydro-kit.css`
- `src/shared/design-system/tokens/generated/hydro-kit.module.scss`
- `src/shared/design-system/tokens/generated/hydro-kit.tokens.ts`
- `src/shared/design-system/tokens/generated/hydro.semantic.module.scss`
- `src/shared/design-system/tokens/generated/index.ts`
- `tools/design-token-import/output/import-report.md`

## Modos visuais

- Light
- Dark
- Increased contrast (quando presente no bundle de origem)

## Disponibilidade no app

Os tokens oficiais sao aplicados pelo `HydroDesignSystemRoot` no layout localizado (`src/app/[locale]/layout.tsx`), evitando import manual por feature.
