# Componentes

## shared/ui

Componentes genéricos, sem regra de negócio.

## shared/layout

Componentes de estrutura global.

## features

Componentes com contexto e regra específica de domínio.

## Convenção

- API explícita.
- estados `default`, `disabled`, `loading`, `error` quando aplicável.
- `aria-label` e `aria-*` propagados quando fizer sentido.
- estilos separados da lógica quando o componente cresce.
