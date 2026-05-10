# Acessibilidade

## Regras base

- usar elementos semânticos;
- `button` para ações;
- `a` para navegação;
- `label` associado a inputs;
- `aria-describedby` para erros;
- `aria-expanded` em accordion, dropdown e sheets;
- `aria-selected` em tabs;
- `role="dialog"` e `aria-modal="true"` em bottom sheets e modais.

## Foco e teclado

- foco visível;
- `Escape` fecha overlays;
- `Tab` não fica preso fora do modal;
- retorno de foco ao botão de origem;
- setas em tabs quando houver padrão.

## Mobile

- touch targets de 44px;
- bottom sheets para ações secundárias;
- menu mobile com labels curtas;
- mapa com alternativa textual.

## Contraste e motion

- texto sempre legível no dark/light;
- status não depende só de cor;
- respeitar `prefers-reduced-motion`.
