# HydriRivers DS — Quick Reference (Contrato de Implementação)

- **Nome:** HydriRivers DS  
- **Status:** **Oficial**  
- **Stack alvo:** React / Next.js App Router / TypeScript / Sass Modules  
- **Regras:** sem CSS global amplo; sem ferramentas pagas extras além de **Figma/FigmaPRO, ChatGPT Business, Codex e Cursor**

Esta é a referência rápida do HydriRivers DS para uso em **Cursor/Codex**, PRs e implementação.  
**Source of truth:** [`hydririvers-design-system.md`](./hydririvers-design-system.md)

---

## Links mais usados em PRs

- [Tokens](./hydririvers-design-system.md#4-tokens)
- [Interaction Contract](./hydririvers-design-system.md#51-interaction-contract)
- [Bubble Press](./hydririvers-design-system.md#52-bubble-press)
- [Component Library](./hydririvers-design-system.md#6-component-library)
- [Breakpoints](./hydririvers-design-system.md#31-breakpoints-e-regras-de-composição)
- [Handoff Checklist](./hydririvers-design-system.md#122-checklist-de-implementação)
- [O que não fazer](./hydririvers-design-system.md#13-o-que-não-fazer)

---

## Índice (Quick)

- [Princípios do DS](#princípios-do-ds)
- [Tokens principais](#tokens-principais)
- [Breakpoints](#breakpoints)
- [Componentes principais](#componentes-principais)
- [Interaction Contract](#interaction-contract)
- [Bubble Press + Hover](#bubble-press--hover)
- [Interaction Do/Don't](#interaction-dodont)
- [Handoff (stack + regras)](#handoff-stack--regras)
- [O que não fazer](#o-que-não-fazer)

---

## Princípios do DS

- **Responsivo de verdade:** tablet/desktop não são "mobile esticado"; mobile não é "desktop comprimido".  
  ↳ Ver: [Foundations → Breakpoints](./hydririvers-design-system.md#31-breakpoints-e-regras-de-composição)
- **Dark + Light:** Light é **conversão fiel** do Dark (mesma hierarquia/profundidade; ajusta contraste/superfícies).  
  ↳ Ver: [Foundations → Cores](./hydririvers-design-system.md#32-cores-darklight)
- **Tokens semânticos:** componentes não usam "valores soltos".  
  ↳ Ver: [Tokens](./hydririvers-design-system.md#4-tokens)
- **Interação consistente:** Bubble Press é padrão de press/tap; hover só com pointer fino.  
  ↳ Ver: [Interaction & Motion](./hydririvers-design-system.md#5-interaction--motion)
- **Premium controlado:** glass/blur + profundidade; **sem neon/glow exagerado**.  
  ↳ Ver: [Foundations → Blur/Glass](./hydririvers-design-system.md#36-blur--glass)

---

## Tokens principais

**Convenção**  
- `namespace.category/role`  
  ↳ Ver: [Tokens → Convenção](./hydririvers-design-system.md#41-convenção)

### Colors (essenciais)
- `color.bg/default`
- `color.bg/elevated`
- `color.surface/primary`
- `color.surface/secondary`
- `color.surface/glass`
- `color.text/primary`
- `color.text/secondary`
- `color.border/subtle`
- `color.action/primary`
- `color.status/success`
- `color.status/warning`
- `color.status/danger`

↳ Ver: [Tokens → Essenciais](./hydririvers-design-system.md#42-tokens-essenciais-tabela) e [Tokens por tema](./hydririvers-design-system.md#43-tokens-por-tema-darklight)

### Motion (Bubble Press)
- `motion.duration/press = 140ms`
- `motion.duration/pressReturn = 160ms`
- `motion.easing/bubble = cubic-bezier(0.2, 0.8, 0.2, 1)`
- `motion.scale/chip = 1.06`
- `motion.scale/iconButton = 1.05`
- `motion.scale/button = 1.035`
- `motion.scale/card = 1.012`
- `motion.scale/searchFocus = 1.01`

↳ Ver: [Bubble Press](./hydririvers-design-system.md#52-bubble-press)

### Radius / Blur / Shadow (resumo)
- `radius/card = 20`, `radius/sheet = 24`, `radius/input = 16`
- `blur/sm = 8`, `blur/md = 16`, `blur/lg = 24`
- `shadow/1`, `shadow/2`, `shadow/glass`

↳ Ver: [Foundations → Spacing/Radius](./hydririvers-design-system.md#34-spacing-radius-stroke), [Shadows](./hydririvers-design-system.md#35-shadows--elevation), [Blur/Glass](./hydririvers-design-system.md#36-blur--glass)

---

## Breakpoints

- Mobile safety: **375px**
- Mobile baseline: **390px**
- Tablet: **768px / 834px**
- Desktop baseline: **1440px**

↳ Ver: [Foundations → Breakpoints](./hydririvers-design-system.md#31-breakpoints-e-regras-de-composição)

---

## Componentes principais

- `Button` ↳ Ver: [Button](./hydririvers-design-system.md#61-button)
- `IconButton` ↳ Ver: [IconButton](./hydririvers-design-system.md#62-iconbutton)
- `CloseButton` ↳ Ver: [CloseButton](./hydririvers-design-system.md#63-closebutton)
- `Chip` ↳ Ver: [Chips](./hydririvers-design-system.md#64-chips)
- `SearchField` ↳ Ver: [SearchField](./hydririvers-design-system.md#65-searchfield)
- `CargoCard` ↳ Ver: [CargoCard](./hydririvers-design-system.md#66-cargocard)
- `BottomNav` (mobile-only) ↳ Ver: [BottomNav](./hydririvers-design-system.md#67-bottomnav)
- `BottomSheet` ↳ Ver: [BottomSheet](./hydririvers-design-system.md#68-bottomsheet)
- `FilterGroup` ↳ Ver: [FilterGroup](./hydririvers-design-system.md#69-filtergroup)
- `CargoDetailPanel` + `CargoDetailContent` ↳ Ver: [CargoDetailPanel](./hydririvers-design-system.md#610-cargodetailpanel)
- `MapContainer` (Fake Map Premium) ↳ Ver: [MapContainer](./hydririvers-design-system.md#611-mapcontainer-fake-map-premium)
- `StatusBadge` ↳ Ver: [StatusBadge](./hydririvers-design-system.md#612-statusbadge)

---

## Interaction Contract

- **Bubble Press = padrão principal de press/tap.**
- **Hover = só Desktop + Tablet com pointer fino** (`hover:hover` + `pointer:fine`).
- **Selected/Active não substitui Press.**
- **Touch puro não depende de hover.**
- **Nada de scale down 0.98.**
- **Nada de glow/neon exagerado.**

↳ Ver: [Interaction Contract](./hydririvers-design-system.md#51-interaction-contract)

---

## Bubble Press + Hover

### Bubble Press (onde aplicar)
Aplicar a todo **elemento clicável com superfície** que dispara ação:

- Buttons (todas variantes)
- IconButton
- CloseButton (incl. X do sheet)
- Chips (selected e unselected)
- BottomNav items (active e inactive)
- SearchField (press / focus press feedback)
- Toggle dark/light
- Cards clicáveis (opcional e sutil) → **scale 1.012 + overlay leve**

**Fora do Bubble Press**
- Ações "somente texto" (links/text actions): feedback tipográfico, sem bolha.

↳ Ver: [Bubble Press](./hydririvers-design-system.md#52-bubble-press)

### Hover (regra)
- Hover só com suporte real: `hover:hover` + `pointer:fine` (desktop e tablet com mouse/trackpad)
- Touch puro não depende de hover

↳ Ver: [Hover por pointer fino](./hydririvers-design-system.md#53-hover-por-pointer-fino)

---

## Interaction Do/Don't

**Do**
- Usar Bubble Press em todo elemento clicável com superfície que dispara ação.
- Aplicar hover em Desktop/Tablet somente com pointer fino (mouse/trackpad).
- Manter feedback de press independente de estado ativo/selecionado.

**Don't**
- Não usar hover como feedback principal em touch puro.
- Não trocar Bubble Press por scale down 0.98.
- Não criar glow/neon exagerado que mude a identidade visual.

↳ Ver: [Interaction Do/Don't](./hydririvers-design-system.md#56-interaction-dodont)

---

## Handoff (stack + regras)

**Stack obrigatória**
- React
- Next.js App Router
- TypeScript
- Sass Modules / CSS Modules (`.module.scss` por componente)
- Sem CSS global amplo
- Sem depender de `globals.scss` para estilos de componente
- Sem Tailwind obrigatório
- Sem styled-components
- Sem bibliotecas novas de UI

**Regras-chave**
- Tokens semânticos → mapear para CSS custom properties (theme layer mínimo).
- Tema via `data-theme="dark|light"` no root (ou equivalente).
- Bubble Press em surface clickables; hover só com pointer fino.
- Respeitar `prefers-reduced-motion` (sem scale; mantém highlight).

↳ Ver: [Handoff para desenvolvimento](./hydririvers-design-system.md#12-handoff-para-desenvolvimento-reactnextjstssass-modules)

---

## O que não fazer

- Não sugerir ferramentas pagas extras além de Figma/FigmaPRO, ChatGPT Business, Codex e Cursor.
- Não depender de CSS global amplo para estilos de componente.
- Não usar hover como feedback principal em touch puro.
- Não trocar Bubble Press por scale down 0.98.
- Não criar glow/neon exagerado.
- Não tratar tablet como mobile esticado.
- Não tratar mobile como desktop comprimido.
- Não gerar "código final do Figma" como única fonte de verdade.

↳ Ver: [O que não fazer](./hydririvers-design-system.md#13-o-que-não-fazer)

---
