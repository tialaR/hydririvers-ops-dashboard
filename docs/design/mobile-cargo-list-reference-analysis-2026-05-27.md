# Mobile Cargo List Lab — análise dos anexos iOS/dark e vídeo

Data: 2026-05-27  
Escopo: `/{locale}/dev/mobile-cargo-list-lab` e primitives Hydro DS usados pela lab.

## Pacotes analisados

- `hydririvers_migration_context_pack_2026-05-27.zip`: contexto de continuidade, foco em dark mode first na rota dev mobile de cargas.
- `Archive.zip`: snapshot do projeto sem `node_modules`, com rota lab, Hydro DS, docs e testes.
- `IOS-IMAGES-WHATS.zip`: referências iOS/Apple em claro e escuro, incluindo Weather, Fitness, Maps, search, chips, sheets e dock/tab bar.
- `darck-images-ios.zip`: recorte dark mode first das mesmas referências.
- `bottom-sheet-behavior.mp4`: referência de comportamento do dock/tab bar inferior com bolha ativa deslizante.

## Direção visual extraída das imagens

1. **Canvas dark não é preto chapado.** As referências usam cinza profundo com leve variação de luminosidade, superfícies elevadas e separadores quase invisíveis.
2. **Hierarquia por profundidade.** O conteúdo principal fica em cards/sheets com borda e sombra discretas; ações e controles flutuam com blur e material translúcido.
3. **Search e chips são controles quietos.** Eles não competem com o conteúdo; recebem foco por elevação, borda e leve glow, não por cor sólida.
4. **Sheets têm folha nativa.** Raio alto no topo, grabber pequeno, close circular, padding interno generoso e transição vertical macia.
5. **Dock inferior é uma lente, não uma barra fixa.** O track é uma cápsula escura translúcida; a bolha ativa desliza dentro dela e muda o peso visual do item selecionado.
6. **Cores de estado aparecem pontualmente.** Accent, warning e success devem ser usados como brilho ou tint local, não como tema dominante.

## Comportamento extraído do vídeo

- O dock mantém posição fixa no rodapé e respeita safe area.
- A bolha ativa se move horizontalmente de item para item com transição elástica curta.
- A área ativa tem glow/tint específico, enquanto os itens inativos permanecem em branco/cinza suave.
- O track continua legível por cima do conteúdo graças a blur, borda translúcida e sombra inferior.
- A animação não troca layout nem empurra a tela; só move a lente dentro da cápsula.

## Decisões aplicadas nesta rodada

- Mantida a lab isolada em `/{locale}/dev/mobile-cargo-list-lab`; a rota real `/cargas` continua fora de escopo.
- Removido o componente hero morto da lab, porque o estado visual aprovado caminha para large title + subtítulo + search/chips/cards.
- Ajustado `LiquidGlassSheet` para expandir visualmente durante drag para cima, não apenas mudar snap no fim do gesto.
- Mantido o drag para baixo como `translateY`, preservando sensação de folha escorregando para fechar.
- Adicionado `height` transition ao sheet e removida transição durante drag ativo.
- Adicionado `data-active-id` ao `LiquidGlassBottomDock` para permitir tint contextual da lente ativa.
- Dock agora usa accent para `cargas`, warning para `attention` e success para `map`, sempre como tint/glow controlado.
- Teste de sheet atualizado para consolidar o contrato: closed overlay usa `inert`, não `aria-hidden`, evitando o warning de foco retido.

## O que ainda precisa de validação visual manual

- Screenshot 390×844 da tela inicial da lab.
- Screenshot 390×844 com sheet de filtros aberto.
- Screenshot 390×844 com sheet de ações aberto após tocar em um card.
- Vídeo curto mostrando busca, chips, botão filtros, cards, sheet drag/snap e dock.

Sem essa validação visual, não promover para `/cargas` real.
