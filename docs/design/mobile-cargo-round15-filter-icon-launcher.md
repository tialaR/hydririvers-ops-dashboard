# Mobile Cargo Round 15 — Filter Icon Launcher

## Referência

Vídeo anexado pelo usuário mostrando um botão circular no topo da interface que, ao toque, comprime e expande em uma cápsula translúcida antes de revelar conteúdo/contexto.

## Implementação

- Novo estado `filterLauncherSource` controla se a animação está ativa no botão do header ou no botão compacto.
- O sheet abre após `420ms`, dando tempo para a microinteração visual.
- A cápsula é feita em CSS com `::before`, `backdrop-filter`, blur, sombra interna e easing `cubic-bezier(0.16, 1, 0.3, 1)`.
- `prefers-reduced-motion` remove transições.

## Critério de aceite

- O botão não deve abrir o sheet imediatamente.
- Deve haver feedback visual perceptível antes da abertura.
- A cápsula deve expandir para a esquerda, sem alterar layout.
- O comportamento deve funcionar no header principal e no header compacto.
