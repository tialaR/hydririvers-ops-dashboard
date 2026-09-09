# ADR 0023 — Padrão de layout mobile (bottom nav + bottom sheets)

- **Status**: Aceito  
- **Data**: 2026-05-11  

## Contexto

A aplicação precisa funcionar em viewports estreitas com navegação inferior, overlays (BottomSheet, popovers) e áreas seguras (`safe-area`), sem conteúdo escondido atrás da bottom nav nem conflitos de z-index.

## Decisão

1. Tratar **bottom navigation + safe-area + padding inferior** como requisito transversal nas telas com nav fixa.  
2. Padronizar **BottomSheet** com `role="dialog"`, rótulos ARIA, scroll interno e bloqueio de scroll do body quando aberto.  
3. Centralizar **camadas (z-index)** em tokens compartilhados em vez de valores mágicos espalhados.  
4. Manter detalhes operacionais e checklist em documentação de produto/arquitetura, não duplicados neste ADR.

## Consequências

- Novas telas mobile devem validar sobreposição com header, bottom nav e sheets antes do merge.  
- Alterações em tokens de camada exigem revisão de regressão visual rápida nas rotas com mapa/filtros.

## Alternativas consideradas

- **Estilos ad hoc por página**: rejeitado por alto risco de inconsistência e bugs de sobreposição.  
- **Biblioteca de sheet proprietária sem ARIA**: rejeitado por impacto em acessibilidade.

## Referências

- [Diretrizes de layout mobile (produto)](../product/mobile-layout-guidelines.md)  
- [Arquitetura UI mobile](../architecture/mobile-ui-architecture.md)  
- [ADR legado — bottom sheet e mapa](./ADR-mobile-bottom-sheet-and-map-pattern.md)
