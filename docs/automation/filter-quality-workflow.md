# Workflow: Qualidade de Filtros (Desktop + Mobile)

Data: 2026-05-11

## Objetivo

Garantir que filtros sejam:

- úteis por contexto (não “painel gigante genérico”);
- consistentes visualmente com o tema operacional;
- acessíveis (labels, foco, teclado);
- previsíveis no mobile (BottomSheet estável);
- testáveis (com cenários e resultados verificáveis).

## Checklist

- Existe pelo menos 1 caso “com resultado” e 1 caso “sem resultado”.
- Existe “Limpar filtros” (subtle/secondary) e ele restaura a lista.
- Filtros não geram overflow horizontal em 360px.
- Labels e placeholders estão i18n (`pt-BR`, `en`, `es`).
- Mobile:
  - filtros abrem em BottomSheet (quando aplicável);
  - footer de ações não fica atrás da bottom nav;
  - scroll interno do sheet funciona;
  - dropdown/select não atravessa camadas (z-index ok).
- Empty state de filtros é humanizado (sem termos técnicos).
- Testes:
  - unit/integration para lógica de filtros (quando existir);
  - smoke test de render/ação principal (abrir, limpar, aplicar).

## Referências

- `docs/product/mobile-layout-guidelines.md`
- `docs/architecture/mobile-ui-architecture.md`

