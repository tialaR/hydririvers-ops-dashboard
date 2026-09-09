# Workflow de qualidade — consistência de interface entre rotas

## Objetivo

Garantir que as rotas do HydriRivers compartilhem a mesma linguagem visual sem perder a responsabilidade de produto de cada tela.

## Checklist

- [ ] A rota tem papel claro.
- [ ] O título e subtítulo explicam a tela para pessoa leiga.
- [ ] A navegação mostra a rota correta como ativa.
- [ ] Home/Início não fica órfã no shell.
- [ ] Dashboard não vira lista de cargas.
- [ ] Cargas permanece como marketplace público.
- [ ] Minhas cargas permanece como área privada.
- [ ] Cards, chips e botões seguem a paleta operacional.
- [ ] Empty/loading/error states estão humanizados.
- [ ] O design dark/light continua consistente.
- [ ] A experiência mobile continua legível e tocável.
- [ ] Não há wrappers visuais redundantes em controles compactos.
- [ ] i18n foi atualizado em `pt-BR`, `en-US` e `es`.
- [ ] Acessibilidade de foco e `aria-label` foi revisada.

## Quality gates

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm test`
- `npm run build`

## Observações

- Mudanças visuais devem ser cirúrgicas.
- Um novo componente compartilhado só deve nascer quando houver uso real em pelo menos duas áreas.
