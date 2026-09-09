# HydriRivers DS — Design System (Oficial) + Handoff

- **Nome:** HydriRivers DS  
- **Status:** **Oficial / Source of truth** do HydriRivers DS  
- **Stack alvo:** React / Next.js App Router / TypeScript / Sass Modules  
- **Regras:** sem CSS global amplo; sem ferramentas pagas extras além de **Figma/FigmaPRO, ChatGPT Business, Codex e Cursor**

HydriRivers DS é o Design System oficial do **HydriRivers Ops Dashboard**, uma aplicação web responsiva para **operação logística hidroviária** no Brasil. O produto funciona como um **cockpit operacional** para visualizar, negociar, acompanhar e gerenciar **cargas**, **embarcações**, **jornadas/eventos**, **documentos**, **custos** e **mapa operacional**, conectando perfis distintos (embarcador, operador, governo, admin e usuário individual).

---

## Índice

- [1. Nome do Design System](#1-nome-do-design-system)
- [2. Produto e propósito](#2-produto-e-propósito)
- [3. Foundations](#3-foundations)
  - [3.1 Breakpoints e regras de composição](#31-breakpoints-e-regras-de-composição)
  - [3.2 Cores (Dark/Light)](#32-cores-darklight)
  - [3.3 Tipografia](#33-tipografia)
  - [3.4 Spacing, Radius, Stroke](#34-spacing-radius-stroke)
  - [3.5 Shadows / Elevation](#35-shadows--elevation)
  - [3.6 Blur / Glass](#36-blur--glass)
  - [3.7 Interaction / Motion](#37-interaction--motion)
- [4. Tokens](#4-tokens)
  - [4.1 Convenção](#41-convenção)
  - [4.2 Tokens essenciais (tabela)](#42-tokens-essenciais-tabela)
  - [4.3 Tokens por tema (Dark/Light)](#43-tokens-por-tema-darklight)
- [5. Interaction & Motion](#5-interaction--motion)
  - [5.1 Interaction Contract](#51-interaction-contract)
  - [5.2 Bubble Press](#52-bubble-press)
  - [5.3 Hover por pointer fino](#53-hover-por-pointer-fino)
  - [5.4 Estados (Active/Selected/Focus/Disabled)](#54-estados-activeselectedfocusdisabled)
  - [5.5 Reduced Motion](#55-reduced-motion)
  - [5.6 Interaction Do/Don't](#56-interaction-dodont)
- [6. Component Library](#6-component-library)
  - [6.1 Button](#61-button)
  - [6.2 IconButton](#62-iconbutton)
  - [6.3 CloseButton](#63-closebutton)
  - [6.4 Chips](#64-chips)
  - [6.5 SearchField](#65-searchfield)
  - [6.6 CargoCard](#66-cargocard)
  - [6.7 BottomNav](#67-bottomnav)
  - [6.8 BottomSheet](#68-bottomsheet)
  - [6.9 FilterGroup](#69-filtergroup)
  - [6.10 CargoDetailPanel](#610-cargodetailpanel)
  - [6.11 MapContainer (Fake Map Premium)](#611-mapcontainer-fake-map-premium)
  - [6.12 StatusBadge](#612-statusbadge)
- [7. Layout Variants (Mobile/Tablet/Desktop)](#7-layout-variants-mobiletabletdesktop)
- [8. Fluxo principal do protótipo](#8-fluxo-principal-do-protótipo)
- [9. Desktop Cockpit (1440)](#9-desktop-cockpit-1440)
- [10. User roles](#10-user-roles)
- [11. Rotas e telas esperadas](#11-rotas-e-telas-esperadas)
- [12. Handoff para desenvolvimento (React/Next.js/TS/Sass Modules)](#12-handoff-para-desenvolvimento-reactnextjstssass-modules)
  - [12.1 Estrutura sugerida de componentes](#121-estrutura-sugerida-de-componentes)
  - [12.2 Checklist de implementação](#122-checklist-de-implementação)
  - [12.3 O que NÃO implementar ainda](#123-o-que-não-implementar-ainda)
- [13. O que não fazer](#13-o-que-não-fazer)

---

## 1. Nome do Design System

**HydriRivers DS**

---

## 2. Produto e propósito

HydriRivers é uma aplicação web responsiva para **gestão operacional** de logística hidroviária. O objetivo é oferecer um painel moderno para tomada de decisão rápida, com foco em:

- cargas fluviais (status, origem/destino, janela operacional, ETA)
- embarcações (capacidade, compatibilidade, disponibilidade)
- jornada/eventos (tracking, checkpoints, atrasos, atracação/saída/chegada)
- documentos (anexos, certificados, comprovações)
- custos (composição, pagamentos, histórico)
- negociações (propostas/contrapropostas/aceite/contratação)
- mapa operacional (hidrovias, portos/terminais, rotas e estados)

---

## 3. Foundations

### 3.1 Breakpoints e regras de composição

**Breakpoints**
- Mobile safety: **375px**
- Mobile baseline: **390px** (iPhone 14/15)
- Tablet: **768px / 834px**
- Desktop baseline: **1440px**

**Regra (responsivo de verdade)**
- **Não** tratar tablet/desktop como "mobile esticado".
- **Não** tratar mobile como "desktop comprimido".
- Mobile: bottom nav + cards + bottom sheets (touch-first).
- Tablet: composição intermediária com mais respiro; split view/painéis.
- Desktop: cockpit operacional (lista + mapa + detalhe lado a lado).

---

### 3.2 Cores (Dark/Light)

**Regra**
- Componentes usam apenas **tokens semânticos** (`color.*`).
- Dark e Light são **modes** do mesmo token (Figma Variables).
- Light Mode é **conversão fiel do Dark** (mesma hierarquia, mesma profundidade; ajusta contraste/superfícies).
- Sem glow/neon exagerado.

---

### 3.3 Tipografia

- Família base: **SF Pro / iOS look**
- Estilos (Figma Text Styles)
  - `Display/L` 34/40 Semibold
  - `Title/L` 24/30 Semibold
  - `Title/M` 20/26 Semibold
  - `Body/M` 16/22 Regular
  - `Body/S` 14/20 Regular
  - `Label/M` 13/18 Semibold
  - `Caption` 12/16 Medium

---

### 3.4 Spacing, Radius, Stroke

**Spacing (4pt grid)**
- `space/4, 8, 12, 16, 20, 24, 32, 40`

**Radius (recomendado)**
- `radius/card = 20`
- `radius/sheet = 24`
- `radius/input = 16`
- `radius/chip = full`

**Stroke**
- `stroke/1, stroke/1.5, stroke/2` (quando necessário)

---

### 3.5 Shadows / Elevation

> Profundidade controlada (premium). Sem efeitos chamativos.

- `shadow/0`: none
- `shadow/1`: card/sheet leve (difusa)
- `shadow/2`: modal/sheet forte (maior altura)

---

### 3.6 Blur / Glass

- `blur/sm = 8`
- `blur/md = 16`
- `blur/lg = 24`

**Uso**
- superfícies "glass" (nav, sheet, painéis) usam `color.surface/glass` + blur no backdrop.
- `shadow/glass` (conceito) = combinação de glass + `shadow/1`.

---

### 3.7 Interaction / Motion

Foundation obrigatória para consistência de clique/tap no protótipo e no produto.

Resumo:
- **Bubble Press** = padrão principal de press/tap para elementos clicáveis com superfície.
- **Hover** = apenas Desktop + Tablet **com pointer fino** (mouse/trackpad).
- **Selected/Active não substitui Press**.
- Touch puro não depende de hover.
- Respeitar reduced motion.
- **Proibido** usar "scale down 0.98" como padrão.
- **Proibido** glow/neon exagerado.

---

## 4. Tokens

### 4.1 Convenção

**Padrão:** `namespace.category/role`

Exemplos:
- `color.bg/default`
- `color.surface/primary`
- `color.text/primary`
- `color.border/subtle`
- `color.action/primary`
- `color.status/success`
- `motion.duration/press`
- `motion.scale/chip`
- `radius/card`
- `shadow/glass`

---

### 4.2 Tokens essenciais (tabela)

| Categoria | Tokens (mínimo obrigatório) |
|---|---|
| Background/Surface | `color.bg/default`, `color.bg/elevated`, `color.surface/primary`, `color.surface/secondary`, `color.surface/glass` |
| Texto | `color.text/primary`, `color.text/secondary` |
| Bordas | `color.border/subtle` |
| Ação | `color.action/primary` |
| Status | `color.status/success`, `color.status/warning`, `color.status/danger` |
| Motion | `motion.duration/press`, `motion.duration/pressReturn`, `motion.easing/bubble`, `motion.scale/chip`, `motion.scale/iconButton`, `motion.scale/button`, `motion.scale/card`, `motion.scale/searchFocus` |
| Radius | `radius/card`, `radius/sheet`, `radius/input` |
| Blur/Shadow | `blur/sm`, `blur/md`, `blur/lg`, `shadow/1`, `shadow/2`, `shadow/glass` |

---

### 4.3 Tokens por tema (Dark/Light)

> Valores abaixo são base inicial; ajuste fino no Figma conforme o visual aprovado.

#### Dark Mode
- `color.bg/default`: `#070B12`
- `color.bg/elevated`: `#0B1220`
- `color.surface/primary`: `#0F1828`
- `color.surface/secondary`: `#121F33`
- `color.surface/glass`: `rgba(18,31,51,0.55)`
- `color.text/primary`: `#EAF0FF`
- `color.text/secondary`: `rgba(234,240,255,0.72)`
- `color.text/tertiary`: `rgba(234,240,255,0.52)`
- `color.border/subtle`: `rgba(255,255,255,0.08)`
- `color.border/strong`: `rgba(255,255,255,0.14)`
- `color.action/primary`: `#4F8BFF`
- `color.status/success`: `#34D399`
- `color.status/warning`: `#FBBF24`
- `color.status/danger`: `#FB7185`

#### Light Mode (conversão fiel)
- `color.bg/default`: `#E9EFF8`
- `color.bg/elevated`: `#DDE6F3`
- `color.surface/primary`: `rgba(255,255,255,0.72)`
- `color.surface/secondary`: `rgba(255,255,255,0.58)`
- `color.surface/glass`: `rgba(255,255,255,0.62)`
- `color.text/primary`: `#0B1220`
- `color.text/secondary`: `rgba(11,18,32,0.72)`
- `color.text/tertiary`: `rgba(11,18,32,0.52)`
- `color.border/subtle`: `rgba(11,18,32,0.08)`
- `color.border/strong`: `rgba(11,18,32,0.12)`
- `color.action/primary`: `#2F6BFF`

---

## 5. Interaction & Motion

### 5.1 Interaction Contract

- **Bubble Press = padrão principal de press/tap.**
- **Hover = só Desktop + Tablet com pointer fino** (`hover:hover` + `pointer:fine`).
- **Selected/Active não substitui Press.**
- **Touch puro não depende de hover.**
- **Nada de scale down 0.98.**
- **Nada de glow/neon exagerado.**

---

### 5.2 Bubble Press

**Aplicação**
- Aplicar Bubble Press a todo **elemento clicável com superfície** que dispara ação (navegação, abertura de sheet, filtros, toggle, seleção).

**Tokens**
- `motion.duration/press = 140ms`
- `motion.duration/pressReturn = 160ms`
- `motion.easing/bubble = cubic-bezier(0.2, 0.8, 0.2, 1)`
- `motion.scale/chip = 1.06`
- `motion.scale/iconButton = 1.05`
- `motion.scale/button = 1.035`
- `motion.scale/card = 1.012` (**cards: scale + overlay leve**)
- `motion.scale/searchFocus = 1.01`

**Comportamento**
- No press/tap: cresce sutilmente (bubble).
- Ao soltar: retorna.
- Não muda visual permanente.
- Não depende de Selected/Active.

**Onde aplicar (obrigatório)**
- Buttons (Primary/Secondary/Tertiary/Ghost/Destructive)
- IconButton
- CloseButton (incl. "X" de BottomSheet)
- Chips (selected e unselected)
- BottomNav items (active e inactive)
- SearchField (press / focus press feedback)
- Theme toggle (dark/light)
- Cards clicáveis (opcional e sutil) → scale 1.012 + overlay leve

**Fora do Bubble Press**
- Ações "somente texto" (links/text actions): feedback tipográfico, sem bolha.

---

### 5.3 Hover por pointer fino

**Regra**
- Hover só quando houver suporte real a hover/pointer fino:
  - `hover: hover` + `pointer: fine` (desktop e tablet com mouse/trackpad)

**Touch puro**
- Não depender de hover.
- Press/tap (Bubble Press) é o feedback principal.

---

### 5.4 Estados (Active/Selected/Focus/Disabled)

- `Pressed` é temporário e existe mesmo em `Active/Selected`.
- `Focus` é persistente (inputs) e separado.
- `Disabled` remove interação e mantém acessibilidade.

---

### 5.5 Reduced Motion

**Obrigatório**
- Respeitar `prefers-reduced-motion`.

**Regra**
- Em reduced motion: remover scale (scale=1), manter feedback por highlight/overlay.

---

### 5.6 Interaction Do/Don't

**Do**
- Usar Bubble Press em todo elemento clicável com superfície que dispara ação.
- Aplicar hover em Desktop/Tablet somente com pointer fino (mouse/trackpad).
- Manter feedback de press independente de estado ativo/selecionado.

**Don't**
- Não usar hover como feedback principal em touch puro.
- Não trocar Bubble Press por scale down 0.98.
- Não criar glow/neon exagerado que mude a identidade visual.

---

## 6. Component Library

> Componentes não devem ser duplicados por breakpoint. O que muda é a **composição/layout**.

### 6.1 Button
- Variantes: `primary | secondary | ghost | danger`
- Estados: `default | hover* | pressed | disabled | loading`
- Bubble Press obrigatório; hover apenas pointer fino.

### 6.2 IconButton
- Estados: `default | hover* | pressed | disabled`
- Bubble Press obrigatório.

### 6.3 CloseButton
- Uso: "X" de BottomSheet e painéis.
- Bubble Press obrigatório.
- Hit target mínimo 44×44 (mobile).

### 6.4 Chips
- Estados: `default | hover* | pressed | disabled`
- `selected` on/off
- Bubble Press obrigatório em selected e unselected.

### 6.5 SearchField
- Estados: `default | hover* | pressed | focus | filled | disabled`
- Press/focus feedback; hover apenas pointer fino.

### 6.6 CargoCard
- Anatomia: ID + rota + status + ETA + CTA opcional
- Estados: default; selected/active; pressed (opcional) com scale 1.012 + overlay leve; hover* (pointer fino)

### 6.7 BottomNav
- Mobile-only
- Active/inactive + pressed (Bubble Press)
- Não usar como padrão no desktop.

### 6.8 BottomSheet
- Modos: compact (~40vh), expanded (~98vh), closed
- Backdrop scrim + blur; header/title/close; content; footer opcional
- Drag behavior planejado (protótipo pode simular).

### 6.9 FilterGroup
- Title + chips
- Agrupar por categoria (Status/Origem/Destino/Tipo etc.)

### 6.10 CargoDetailPanel (híbrido aprovado)
- Mobile: BottomSheet (Full)
- Tablet/Desktop: Painel ou página quando necessário
- Conteúdo: route summary, ações, entradas para Jornada/Docs/Custos

### 6.11 MapContainer (Fake Map Premium)
- Desktop cockpit: centro
- Deve parecer crível (hidrovias, rota, markers, labels sutis)
- Não é placeholder simples; não é mapa final ainda.

### 6.12 StatusBadge
- available/spot; in transit; docked; completed; delayed
- Cores via `color.status/*`.

---

## 7. Layout Variants (Mobile/Tablet/Desktop)

**Mobile**
- bottom nav fixa
- lista de cards
- filtros e detalhe como bottom sheets

**Tablet**
- composição intermediária; split view/painéis
- hover somente com pointer fino

**Desktop**
- cockpit 3 colunas: lista + filtros (esq), mapa (centro), detalhe (dir)

---

## 8. Fluxo principal do protótipo

**Fluxo oficial**
1) Lista de Cargas  
2) Filtros (BottomSheet)  
3) Detalhe da Carga  

**Mobile**
- Lista → Filtros (sheet) → Lista filtrada
- Tap no card → Detalhe (sheet full)

**Tablet/Desktop**
- Lista + painel de detalhe (split/cockpit)
- Mesmo conteúdo do detalhe; muda container (painel/página)

---

## 9. Desktop Cockpit (1440)

**Composição**
- Esquerda: lista de cargas + filtros
- Centro: **Fake Map Premium**
- Direita: painel de detalhe

**Fake Map Premium**
- operacional, crível, limpo
- rota + markers + labels sutis
- sem dados reais nesta fase (valida composição/hierarquia)

---

## 10. User roles

Perfis do produto:
- Embarcador
- Transportador / Operador
- Governo / Institucional
- Admin
- Perfil individual

> Podem alterar permissões, navegação e prioridades de informação.

---

## 11. Rotas e telas esperadas

- login
- cadastro
- dashboard
- cargas
- detalhe da carga
- mapa da carga
- minhas cargas
- nova carga
- negociações
- embarcações
- rastreio
- perfil
- admin
- governo
- impacto
- dev-v2 (laboratório visual mobile)

---

## 12. Handoff para desenvolvimento (React/Next.js/TS/Sass Modules)

### Contexto técnico (obrigatório)
- React
- Next.js App Router
- TypeScript
- Sass Modules / CSS Modules (`.module.scss` por componente)
- Sem CSS global amplo
- Sem depender de `globals.scss` para estilos de componente
- Sem Tailwind obrigatório
- Sem styled-components
- Sem bibliotecas novas de UI

---

### 12.1 Estrutura sugerida de componentes

Nomes recomendados (design → código):
- `Button`, `IconButton`, `CloseButton`
- `Chip`, `SearchField`
- `CargoCard`, `StatusBadge`
- `BottomNav`, `BottomSheet`, `FilterGroup`
- `CargoDetailPanel`, `CargoDetailContent`
- `MapContainer`

Arquivos por componente:
- `Component.tsx`
- `Component.module.scss`
- `Component.types.ts` (quando necessário)

---

### 12.2 Checklist de implementação

**Tokens / Theme**
- [ ] Mapear tokens semânticos para CSS custom properties (ex.: `--color-bg-default`)
- [ ] Alternar tema via atributo no root (`data-theme="dark|light"`)
- [ ] Evitar CSS global amplo: theme layer mínimo apenas para variáveis

**Interaction & Motion**
- [ ] Bubble Press em todos os surface clickables (cresce no press)
- [ ] Proibir padrão "scale down 0.98"
- [ ] Press independente de Selected/Active
- [ ] Hover só com `hover:hover` + `pointer:fine`
- [ ] Respeitar `prefers-reduced-motion` (sem scale; mantém highlight)

**Responsividade**
- [ ] Mobile: bottom nav + bottom sheets
- [ ] Tablet: split view/painéis (não esticar mobile)
- [ ] Desktop: cockpit 3 colunas com mapa central + painel detalhe

**Acessibilidade**
- [ ] Hit targets mínimos (44×44 em mobile) para Icon/Close
- [ ] Estados disabled/focus definidos

---

### 12.3 O que NÃO implementar ainda

- Mapa real com hidrovias/portos/terminais/telemetria
- Jornada/Documentos/Custos como telas completas (por ora: entradas no detalhe)
- Drag físico completo do BottomSheet se for caro (protótipo pode simular)

---

## 13. O que não fazer

- Não sugerir ferramentas pagas extras além de Figma/FigmaPRO, ChatGPT Business, Codex e Cursor.
- Não depender de CSS global amplo para estilos de componente.
- Não usar hover como feedback principal em touch puro.
- Não trocar Bubble Press por scale down 0.98.
- Não criar glow/neon exagerado.
- Não tratar tablet como mobile esticado.
- Não tratar mobile como desktop comprimido.
- Não gerar "código final do Figma" como única fonte de verdade.

---
