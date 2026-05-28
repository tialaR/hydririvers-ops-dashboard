# Mobile Cargo List — Round 4 Tsunami Notes

## O que esta rodada corrige

### Azul removido
A cor ativa principal foi trocada para `#9CFF39`, aproximando o visual de um iOS dark mais enérgico e menos “dashboard azul”.

### Cards menos estranhos
O contorno laranja forte foi removido como hierarquia dominante. A informação de atenção continua no pill/estado, mas o card volta para uma superfície neutra.

### Card action sheet separado
O sheet aberto ao clicar em um card agora usa um componente dedicado dentro da lab:
- `cardActionOverlay`
- `cardActionSheet`
- `cardActionGrabber`
- `cardActionCloseButton`
- `cardActionList`
- `cardActionRow`

Isso evita que ele pareça o mesmo componente de filtro com outro conteúdo.

### Bottom dock
A tab bar recebeu bolha ativa mais marcada, motion mais suave e accent lime.

### Search e filtros
Search, filtros e botões receberam fills mais próximos de iOS dark, com foco/ativo em lime e menos aura azul.

## Próximo passo se ainda faltar fidelidade
Separar completamente a arquitetura dos componentes:
- `CargoCardActionSheet` em arquivo próprio;
- `MobileCargoFilterSheet` em arquivo próprio;
- `IosGlassTabBar` dedicada;
- tokens específicos para `iosDarkMaterial`, `iosDarkFill`, `iosInteractiveAccent`.
