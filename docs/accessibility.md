# Acessibilidade

## Padrões

- Usar elementos semânticos reais.
- Garantir foco visível.
- Não depender só de cor para comunicar status.
- Preferir botões e links reais.
- Associar `label` aos inputs.
- Usar `aria-expanded`, `aria-controls`, `aria-selected` e `aria-live` quando fizer sentido.
- Respeitar `prefers-reduced-motion`.

## Bottom sheets

- `role="dialog"`
- `aria-modal="true"`
- título ligado por `aria-labelledby`
- descrição opcional com `aria-describedby`
- foco inicial dentro do sheet
- fechamento por Escape e backdrop

## Mapa

- sempre oferecer resumo textual da rota
- manter botões com `aria-label`
- não depender só de hover para tooltips

