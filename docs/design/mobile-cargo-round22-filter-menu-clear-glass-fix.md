# Mobile Cargo Round 22 — Filter Menu Clear + Frosted Glass Fix

Correções pontuais:

- `Limpar filtros` usa a mesma função canônica do footer do sheet.
- A ação do menu é capturada no container por `pointerup/click`, tornando o toque mais confiável no mobile.
- O menu glass recebeu fundo e blur mais fortes para impedir leitura nítida do conteúdo por baixo.
- A transição de estado do menu é diferida para depois do ciclo de pointer/click, evitando vazamento de evento para chips/search/lista.
