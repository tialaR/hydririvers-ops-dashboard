# Mobile Cargo Round 7 — Stability + Motion Fix

## Problemas reportados

1. Bottom dock com comportamento estranho e labels/ícones sobrepostos.
2. Espaço lateral à direita no mobile.
3. Scrollbar visível no mobile.
4. Sheet com fechamento inconsistente.
5. Manter animações de click/foco desejadas, mas sem quebrar layout.

## Soluções aplicadas

### Bottom dock
- Removida expansão por label e seta ativa.
- Mantido dock minimalista: track translúcido + bolha circular ativa.
- Itens com largura fixa para evitar medição instável e overflow.

### Viewport/lista
- `overflow-x: clip` e `max-width: 100%` em root, viewport, section e scroller.
- Scrollbar visual escondida no mobile.

### Sheet
- Overlays fechados agora usam `visibility: hidden` e `pointer-events: none`.
- Sheet fechado sai com `translateY(110%)`.
- Card action sheet com altura máxima e scroll interno invisível.

### Microinterações
- Preservado press state em cards, chips, botões e foco do search.
- Mantida animação de entrada da lista.

## Observação

Esta rodada é um fix cirúrgico em cima da Round 6, não uma nova linguagem visual.
