# Theme

## Tokens

- `--hx-bg`
- `--hx-card`
- `--hx-text`
- `--hx-muted`
- `--hx-line`
- `--hx-primary`
- `--hx-cyan`
- `--hx-green`
- `--hx-yellow`
- `--hx-red`

## Regras

- **Padrão inicial (sem cookie):** light — ver `resolveServerTheme` e layout `[locale]`.
- Dark mode permanece disponível via toggle; preferência salva em cookie/localStorage.
- Light mode precisa continuar legível.
- Não usar cores fixas fora dos tokens quando houver alternativa.
- Não usar `prefers-color-scheme` como fallback do tema da aplicação.

