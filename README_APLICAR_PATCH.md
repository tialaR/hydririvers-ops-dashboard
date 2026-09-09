# Patch final — Visão Geral da página de Cargas

Este pacote foi criado para corrigir de forma direta a página `/[locale]/cargas`, sem depender do Cursor reinterpretar o layout.

## O que ele faz

- Remove referências antigas `/vessels/overview/*` da página de cargas.
- Remove `Math.random()` / `getRandomVesselImage()` da seleção de imagens.
- Usa seleção determinística de embarcação.
- Corrige o helper `cargo-vessel-visual.ts` para não quebrar com `preset.src`.
- Copia as 12 imagens hero para `public/mock/vessels/`.
- Aplica CSS final para a aba **Visão geral** ficar no padrão dos anexos 2 e 3:
  - card principal à esquerda;
  - imagem integrada no hero;
  - rota dentro do mesmo bloco;
  - faixa inferior de 4 métricas;
  - coluna lateral com 4 KPIs.

## Como aplicar

Na raiz do projeto:

```bash
unzip -o hydririvers-final-overview-layout.zip -d .
node scripts/apply-final-overview-layout.mjs
rm -rf .next
```

Depois valide:

```bash
grep -RInE "Math\.random|getRandomVesselImage|/vessels/overview" src/features/dashboard/components/operations-board/operations-board.tsx
```

Esse comando não deve retornar nada.

## Checks recomendados

```bash
npm run typecheck
npm run lint
npm run check:i18n
npm test
npm run build
npm run test:mock-mode
```

## Rotas para validar

- `/pt-BR/cargas`
- `/en-US/cargas`
- `/es/cargas`
- `/pt-BR/minhas-cargas/MY-CARGO-001`
