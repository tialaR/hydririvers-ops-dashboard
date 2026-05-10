# Testing strategy

## Comandos base

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- `npm test` quando houver suíte disponível

## Cobertura esperada

- testes unitários para helpers e regras;
- testes de componentes para UI compartilhada;
- testes de hooks de feature;
- testes de acessibilidade;
- smoke tests de telas principais;
- validação mobile/responsiva;
- validação de i18n.

## Áreas críticas

- Dashboard público vs Minhas Cargas;
- tabs da carga;
- bottom sheets;
- notificações;
- mapa mobile;
- timeline;
- agente de cargas.

## Manual

- 360px, 390px, 414px, tablet e desktop;
- tema claro/escuro;
- troca de idioma;
- teclado e foco.
