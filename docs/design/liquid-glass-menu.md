## Liquid Glass — Menu (`LiquidGlassMenu` / `LiquidGlassEditMenu`)

### Origem (anexos)

Este design deriva dos anexos de **Menus / Context Menus / Edit Menu** exportados do Figma, nos exemplos:
- **Menus / Context Menus (Light + Dark)**: lista vertical com seções, separadores sutis, rótulos com tipografia de 17/20px (aprox.), atalhos alinhados à direita e indicador de submenu.
- **Edit Menu (Light + Dark)**: ações horizontais compactas, separadas por divisores verticais e superfície “glass” com sombra suave.

### O que foi removido do CSS bruto

O CSS exportado do Figma continha detalhes de protótipo que **não** foram reaproveitados:
- `left/top` e coordenadas baseadas em canvas
- `width/height` fixos do mock
- camadas de “wallpaper/fundos” e estruturas de exemplo (ex.: seções duplicadas para previews)
- qualquer lógica de posicionamento flutuante (o menu apenas renderiza, sem ancoragem)

### Componentes

#### `LiquidGlassMenu`

- **Layout**: vertical (`role="menu"`), com itens (`role="menuitem"`) em coluna.
- **Suporte de item**:
  - `icon` (opcional)
  - `subtitle` (opcional, texto menor)
  - `shortcut` (opcional, alinhado à direita)
  - `hasSubmenu` (opcional, com chevron “›”)
  - `destructive` (opcional, exibe estado visual em vermelho)
  - `disabled` (opcional, reduz opacidade e bloqueia interação)
  - `sectionTitle` (opcional, renderizado acima do item)

#### `LiquidGlassEditMenu`

- **Layout**: horizontal (ações compactas), com divisores sutis entre itens.
- **Sem** seções/subtitles/shortcuts: o foco é em ações curtas (ex.: “Undo/Redo”, “Cut/Copy/Paste”).
- **Suporte**:
  - `destructive` (vermelho)
  - `disabled` (opcional)

### Tokens usados (e fallbacks)

O styling foi construído para usar tokens com fallback, incluindo:
- `--hydro-color-surface`, `--hydro-color-surface-elevated`
- `--hydro-color-label-primary`, `--hydro-color-label-secondary`, `--hydro-color-label-tertiary`
- `--hydro-color-separator`
- `--hydro-color-danger`
- `--hydro-color-fill-secondary`
- `--hydro-radius-card`, `--hydro-radius-pill`
- `--hydro-motion-control`, `--hydro-motion-easing-standard`
- `--hydro-font-family-system`

E variáveis auxiliares locais com fallback (ex.):
- `--menu-radius`, `--menu-shadow`, `--menu-item-height`, `--menu-padding-x`, `--menu-separator`
- `--menu-font-size`, `--menu-line-height`, `--menu-section-font-size`

### Diferença importante vs layout flutuante

Esses componentes **não** implementam comportamento de ancoragem/posicionamento. A camada de composição responsável por anexar o menu a um elemento (ex.: toolbar overflow, context menu de card, filtros avançados) deve decidir onde ele aparece e como gerenciar focus/trap.

### Usos futuros

Sugestões de evolução e consumo:
- ações de `Card` (menu contextual)
- menus contextuais para listas/itens
- filtros avançados
- ações de documento
- `toolbar overflow`

### Não substituir

Não usar como **bottom sheet principal**. Use como primitive de menu em contextos onde a ação é apresentada como menu (vertical) ou como ações compactas (horizontal).

