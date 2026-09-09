# Evidências Portfolio-Ready

Este documento é o índice reproduzível do estado apresentado no `README.md`. Ele não declara deploy público, promoção para `main` ou infraestrutura real.

## Primeiro acesso

```bash
npm ci
cp .env.example .env.local
npm run dev
```

1. Abra `http://localhost:3000`.
2. Confirme o redirecionamento para `/pt-BR`.
3. Selecione **Explorar demonstração**.
4. Confirme a chegada a `/pt-BR/minhas-cargas` com a persona fictícia da Cooperativa Açaí Norte.

Se o login direto estiver desabilitado, a interface leva ao login manual já preenchido com o e-mail da demo. Use `hydro123`; com a configuração de `.env.example`, o OTP fictício aparece na tela.

## Matriz visual automatizada

| Dimensão | Cobertura |
|---|---|
| Viewports | Desktop 1440; Mobile 375, 390 e 430 |
| Temas | Light e Dark |
| Idiomas | `pt-BR`, `en-US`, `es` |
| Superfícies | entrada, login, lista, filtros, detalhe, mapa, timeline/riscos, documentos e negociação |
| Ação | confirmação e resolução de pendência documental |
| Integridade | overflow horizontal, hierarquia visível e controles nomeados |
| Regressão | baselines seletivos para lista/detalhe; mapas dinâmicos fora do pixel-diff |

Comando:

```bash
npm run test:portfolio-visual
```

Saídas locais:

- `reports/portfolio-visual-evidence/` — screenshots da matriz;
- `reports/portfolio-visual-html/` — relatório Playwright no CI;
- `test-results/portfolio-visual/` — traces e falhas quando existirem;
- `tests/visual-baselines/` — dez baselines estáveis revisados.

## Screenshots versionados

| Superfície | Light | Dark |
|---|---|---|
| Lista desktop | [ver](../tests/visual-baselines/desktop-1440/cargo-list-light.png) | [ver](../tests/visual-baselines/desktop-1440/cargo-list-dark.png) |
| Detalhe desktop | [ver](../tests/visual-baselines/desktop-1440/cargo-detail-light.png) | [ver](../tests/visual-baselines/desktop-1440/cargo-detail-dark.png) |
| Lista mobile | [ver](../tests/visual-baselines/mobile-390/cargo-list-light.png) | [ver](../tests/visual-baselines/mobile-390/cargo-list-dark.png) |
| Detalhe mobile | [ver](../tests/visual-baselines/mobile-390/cargo-detail-light.png) | [ver](../tests/visual-baselines/mobile-390/cargo-detail-dark.png) |
| Espanhol | [desktop](../tests/visual-baselines/desktop-1440/cargo-detail-es-light.png) | [mobile](../tests/visual-baselines/mobile-390/cargo-detail-es-light.png) |

## Gates de fechamento

```bash
npm run verify
npm run build
npm run build-storybook
npm run test:shipper-mobile-p0
npm run test:portfolio-visual
```

No GitHub, todo PR relevante deve encerrar com **CI**, **PR Quality** e **Visual Quality** verdes. O artefato `portfolio-visual-evidence` é gerado mesmo em falha para permitir diagnóstico visual.
