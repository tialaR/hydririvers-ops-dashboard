# HydroRivers overview reference patch

Este pacote substitui os arquivos abaixo para deixar o card de overview de `/[locale]/cargas` no layout idêntico ao mock de referência:

- `src/features/dashboard/components/operations-board/operations-board.tsx`
- `src/app/globals.scss`

## Como aplicar

No projeto local:

```bash
cd ~/Desktop/hydririvers-ops-dashboard
unzip -o ~/Downloads/hydririvers-overview-identical-reference-fix.zip -d .
rm -rf .next
npm run typecheck
npm run dev
```

Abra:

- `http://localhost:3000/pt-BR/cargas`
- `http://localhost:3000/en-US/cargas`
- `http://localhost:3000/es/cargas`

## Observação

O zip já está no formato "opção 1": extração direta no root do projeto com sobrescrita dos arquivos.
