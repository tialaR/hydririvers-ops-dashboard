# Liquid Glass Bottom Dock

Primitive de navegação inferior flutuante com efeito glass e bolha/lente ativa deslizante.

## Origem

Inspirado nos vídeos de referência iOS do projeto (`APP-IOS-VIDEOS-REFERENCES`, WhatsApp 2026-05-26) e na validação visual da rota dev `mobile-cargo-list-lab`.

## API

```tsx
<LiquidGlassBottomDock
  items={[
    { id: 'cargas', label: 'Cargas', icon: <Icon /> },
    { id: 'attention', label: 'Atenção', icon: <Icon /> },
    { id: 'map', label: 'Mapa', icon: <Icon />, disabled: false },
  ]}
  activeId="cargas"
  tone="dark"
  aria-label="Navegação inferior"
  onChange={(id) => {}}
/>
```

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `items` | `LiquidGlassBottomDockItem[]` | Tabs com `id`, `label`, `icon`, `disabled?`, `badge?` |
| `activeId` | `string` | Item ativo |
| `onChange` | `(id: string) => void` | Callback de troca |
| `tone` | `'auto' \| 'light' \| 'dark'` | Paleta do dock |
| `className` | `string` | Classe extra no `<nav>` host |
| `aria-label` | `string` | Nome acessível do `<nav>` |

## Dark mode

- `tone="dark"` (recomendado na lab): cores inativas legíveis, accent via `--hydro-color-accent`.
- Track usa `--hydro-color-fill-secondary` e `--hydro-color-separator` com fallbacks glass.
- Bolha ativa: gradiente translúcido + borda leve (lens), não bloco azul sólido.
- `data-active-id` permite tint contextual: lista usa accent, atenção usa warning e mapa usa success como glow discreto.

## Safe area

- `padding-block-end: calc(env(safe-area-inset-bottom, 0px) + 12px)` no host.
- Track em cápsula (`border-radius: var(--hydro-radius-pill)`), largura máx. ~`360px`, altura `76px`.

## Bolha ativa (lens)

- Elemento `.activeBubble` medido com `ResizeObserver` + `getBoundingClientRect`.
- Transição `320ms` com `cubic-bezier(0.22, 1, 0.36, 1)`.
- `transform: translateX(...)` + largura do botão ativo.
- `prefers-reduced-motion`: transição desligada.

## Quando usar

- Labs mobile e fluxos compostos que precisam de **tab bar flutuante** sem substituir a bottom nav oficial do produto.
- Navegação primária entre 2–4 destinos claros (ex.: lista, atenção, mapa).

## Quando não usar

- Rotas oficiais com `AdminChrome` / bottom nav real (ainda não promovido).
- Ações secundárias que competem com filtros no header (ex.: não duplicar “Filtros” no dock — usar botão de filtros + sheet).
- Substituir `BottomSheet` do mapa ou sheets modais de detalhe.

## Lab `mobile-cargo-list-lab`

Itens atuais: **Cargas**, **Atenção**, **Mapa** (sem item Filtros).

| Item | Comportamento |
|------|----------------|
| Cargas | Limpa filtros e rola para o topo |
| Atenção | Aplica filtro de atenção |
| Mapa | `disabled` sem carga selecionada; com seleção, navega para `/{locale}/cargas/{id}/mapa` |

O dock é ocultado enquanto qualquer sheet (ações, filtros, map hint) está aberto.
