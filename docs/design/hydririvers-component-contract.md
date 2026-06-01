# HydriRivers DS — Contrato de Componentes

| Metadado | Valor |
|----------|-------|
| **Status** | **Contrato de implementação** — documentação apenas |
| **Escopo** | Componentes base do HydriRivers DS, catálogo visual leve e relação com produto mobile Embarcador |
| **Stack alvo** | React 19 · Next.js App Router · TypeScript · Sass Modules (`*.module.scss`) |
| **Não substitui** | Código, testes ou ADRs — em divergência com o repo, atualizar este doc ou o código em PRs dedicados |

**Source of truth visual e de tokens:** [`hydririvers-design-system.md`](./hydririvers-design-system.md)  
**Referência rápida:** [`hydririvers-design-system-quick-reference.md`](./hydririvers-design-system-quick-reference.md)  
**Produto (as-is):** [`hydririvers-business-flow-blueprint.md`](../product/hydririvers-business-flow-blueprint.md)  
**Produto (to-be Embarcador mobile):** [`mobile-shipper-use-cases.md`](../product/mobile-shipper-use-cases.md)  
**Fluxo visual (referência):** [`../product/references/mobile-shipper-flow/hydririvers-mobile-shipper-core-flow.png`](../product/references/mobile-shipper-flow/hydririvers-mobile-shipper-core-flow.png)

> **Nota:** `docs/product/mobile-shipper-core-flow-visual-reference.md` ainda não existe no repositório; o diagrama acima cobre a referência visual do fluxo núcleo.

---

## Índice

1. [Decisão de abordagem](#1-decisão-de-abordagem)
2. [Tokens e estilos compartilhados](#2-tokens-e-estilos-compartilhados)
3. [Contratos por componente](#3-contratos-por-componente)
4. [Catálogo visual (`/dev/design-system`)](#4-catálogo-visual-devdesign-system)
5. [Relação com produto e migração](#5-relação-com-produto-e-migração)
6. [Critérios de aceite deste documento](#6-critérios-de-aceite-deste-documento)
7. [Próximo PR sugerido](#7-próximo-pr-sugerido)

---

## 1. Decisão de abordagem

### 1.1 O que decidimos agora

| Decisão | Motivo |
|---------|--------|
| **Não usar Storybook nesta fase** | Evitar dependência e manutenção paralela; o repo já documenta [storybook-readiness](../design-system/storybook-readiness.md) como futuro opcional. O catálogo vive **no próprio app**. |
| **Rota visual leve em `/[locale]/dev/design-system`** | Ambiente dev-only, localizado (`pt-BR`, `en-US`, `es`), isolado do shell de produção e do laboratório `dev-v2`. |
| **Componentes reais do projeto** | O catálogo importa implementações em `src/shared/design-system` e `src/shared/components`, não mocks de Figma nem duplicatas só para demo. |
| **Sass Modules por componente** | `Component.tsx` + `Component.module.scss` (+ `Component.types.ts` quando necessário). |
| **Sem CSS global amplo** | Theme layer mínimo para variáveis (`data-theme`, `--hydro-*` / `--color-*`); **não** estilizar features em `globals.scss`. |
| **Sem novas dependências de UI** | Alinhado a `AGENTS.md`, blueprint §9 e DS §12. |

### 1.2 O que o catálogo **não** é

- Não substitui testes unitários nem E2E.
- Não é rota de produto nem entrada do embarcador pós-login.
- Não autoriza copiar markup/estado inline de `MobileCargoListLabV2` sem extrair contrato.

### 1.3 Localização sugerida no código (próximos PRs)

| Camada | Caminho sugerido |
|--------|------------------|
| Componentes DS base | `src/shared/design-system/components/<nome>/` |
| Primitivos glass (legado lab) | `src/shared/design-system/primitives/liquid-glass-*` — convergir tokens, não duplicar API pública |
| BottomSheet (casca mobile) | `src/shared/components/bottom-sheet/` (já existente) |
| Página do catálogo | `src/app/[locale]/dev/design-system/page.tsx` (somente dev; proteger por env ou flag) |

---

## 2. Tokens e estilos compartilhados

Todos os componentes deste contrato consomem **tokens semânticos** do HydriRivers DS, mapeados para CSS custom properties no theme layer (`data-theme="dark|light"`).

### 2.1 Identidade visual

| Dimensão | Regra |
|----------|-------|
| **Dark premium** | Fundo `#070B12` → superfícies em camadas; texto `#EAF0FF`; profundidade com `shadow/1` e `shadow/2`, sem neon. |
| **Light fiel** | Mesma hierarquia do dark; ajuste de contraste em superfícies e bordas (`color.surface/*`, `color.border/*`). |
| **Glass / blur controlado** | `color.surface/glass` + `blur/sm|md|lg` em nav, sheets e toolbars; `shadow/glass` quando aplicável. |
| **Status** | `color.status/success`, `warning`, `danger` — badges e alertas; nunca cores soltas no JSX. |
| **Ação primária** | `color.action/primary` — CTAs principais (limpar filtros, ver cargas, salvar). |

### 2.2 Layout e tipografia

| Token | Uso nos componentes |
|-------|----------------------|
| `space/4` … `space/40` | Padding interno, gaps entre chips, margens de seção |
| `radius/card` (20) | Cards (`CargoCard`, `MapPreviewCard`, métricas) |
| `radius/sheet` (24) | `BottomSheet`, painéis elevados |
| `radius/input` (16) | `SearchField`, campos em sheets |
| `radius/chip` (full) | `FilterChip` |
| `stroke/1` … `stroke/2` | Bordas `color.border/subtle` e `strong` |
| Tipografia DS | `Title/M`, `Body/M`, `Body/S`, `Label/M`, `Caption` — ver [§3.3 do DS](./hydririvers-design-system.md#33-tipografia) |

### 2.3 Bubble Press (obrigatório)

**Regra global:** no press/tap o elemento **cresce** sutilmente; ao soltar, retorna. **Proibido** `scale(0.98)` ou “afundar” como feedback principal.

| Elemento | `motion.scale/*` | Duração |
|----------|------------------|---------|
| `Button` | `motion.scale/button` → **1.035** | press 140ms, return 160ms |
| `IconButton` | `motion.scale/iconButton` → **1.05** | idem |
| `FilterChip` | `motion.scale/chip` → **1.06** | idem |
| `SearchField` (press/focus) | `motion.scale/searchFocus` → **1.01** | idem |
| `CargoCard` (clicável) | `motion.scale/card` → **1.012** + overlay leve | idem |
| `BottomNav` item | mesmo patamar que `IconButton` | idem |

**Hover:** apenas `@media (hover: hover) and (pointer: fine)` — nunca feedback principal em touch.

**Reduced motion:** `@media (prefers-reduced-motion: reduce)` → `scale(1)`; manter highlight/overlay ou mudança de cor.

**Fora do Bubble Press:** links de texto puro (`<button>` ghost sem superfície perceptível), labels estáticos, texto de badge.

Implementação sugerida: classe utilitária compartilhada (ex. `bubble-press` em SCSS module do DS) ou `PressableSurface` existente — **sem** duplicar curvas de easing por componente.

---

## 3. Contratos por componente

Convenções comuns a todos:

- **i18n:** strings de produto via `next-intl`; o catálogo pode usar chaves de exemplo.
- **Tema:** respeitar `data-theme` do ancestral.
- **Testes:** estados default, disabled, selected/active e reduced motion quando houver interação.

---

### 3.1 Button

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Ação primária ou secundária com superfície clara (confirmar, limpar filtros, ver cargas, salvar). |
| **Onde aparece** | Rodapé de `BottomSheet` (filtros), formulários, empty states com CTA, detalhe da carga. |
| **Props sugeridas** | `variant: 'primary' \| 'secondary' \| 'ghost' \| 'danger'` · `size?: 'sm' \| 'md' \| 'lg'` · `loading?: boolean` · `loadingLabel?: ReactNode` · `disabled?` · `type?: 'button' \| 'submit'` · `children` · `onClick` · extensão `ButtonHTMLAttributes` |
| **Variantes** | `primary` (ação principal) · `secondary` (cancelar/alternativa) · `ghost` (terciária em fundo glass) · `danger` (destrutiva futura) |
| **Estados** | default · hover* (pointer fino) · pressed (Bubble Press) · disabled · loading (`aria-busy`) |
| **Tokens** | `color.action/primary`, `color.surface/secondary`, `color.text/primary`, `radius/input`, `motion.scale/button` |
| **Bubble Press** | Obrigatório em todas as variantes com superfície. |
| **Acessibilidade** | `<button>` nativo; label visível ou `aria-label` se só ícone (preferir `IconButton`); foco `:focus-visible` com outline semântico. |
| **Quando usar** | Uma ação clara por contexto (ex.: “Ver cargas” no sheet de filtros). |
| **Quando não usar** | Navegação entre abas (usar `BottomNav`); filtros rápidos (usar `FilterChip`); ícone isolado (usar `IconButton`). |
| **Exemplo Embarcador mobile** | Em `/minhas-cargas`, sheet de filtros: **Limpar filtros** (`secondary`) + **Ver cargas** (`primary`) conforme microcopy em [`mobile-shipper-use-cases.md` §11](../product/mobile-shipper-use-cases.md#11-microcopy). |

---

### 3.2 IconButton

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Ação compacta baseada em ícone (filtros, tema, fechar auxiliar, overflow). |
| **Onde aparece** | Header da lista (`filter`, `theme`), toolbar do sheet, ações secundárias no card. |
| **Props sugeridas** | `icon: ReactNode` · `ariaLabel: string` (obrigatório) · `variant?: 'ghost' \| 'glass' \| 'solid'` · `size?: 'sm' \| 'md' \| 'lg'` · `active?: boolean` · `disabled?` · `aria-pressed?` quando toggle |
| **Variantes** | `glass` (header mobile premium) · `ghost` (sobre mapa/lista) · `solid` (ênfase pontual) |
| **Estados** | default · active (`aria-pressed`) · pressed · disabled |
| **Tokens** | `color.surface/glass`, `color.border/subtle`, `blur/md`, `motion.scale/iconButton` |
| **Bubble Press** | Obrigatório. **Migrar** implementações legadas que usam `scale(0.965)` no `:active` para o contrato DS (crescimento no press). |
| **Acessibilidade** | `aria-label` obrigatório; alvo mínimo **44×44** em `size` mobile (`lg` ou padding equivalente). |
| **Quando usar** | Uma ação por botão; ícone + tooltip opcional em desktop. |
| **Quando não usar** | Texto longo ou duas ações no mesmo controle; CTA principal (usar `Button`). |
| **Exemplo Embarcador mobile** | Header em `/cargas` e `/minhas-cargas`: ícone de filtros abre sheet; ícone sol/lua alterna `data-theme`. |

---

### 3.3 FilterChip

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Seleção rápida de filtro em grupo (status, terminal, tipo, etc.). |
| **Onde aparece** | `BottomSheet` de filtros; barra horizontal opcional na lista (futuro). |
| **Props sugeridas** | `label: string` · `selected: boolean` · `onToggle: () => void` · `group: string` (para `aria` em grupo) · `disabled?` · `density?: 'default' \| 'compact'` |
| **Variantes** | unselected (borda sutil) · selected (fill `color.action/primary` ou superfície elevada + borda forte) |
| **Estados** | default · selected (`aria-pressed="true"`) · pressed (Bubble Press independente de selected) · disabled |
| **Tokens** | `radius/chip`, `color.border/subtle`, `color.action/primary`, `motion.scale/chip` |
| **Bubble Press** | Obrigatório em selected **e** unselected; press não remove seleção visual até `onToggle`. |
| **Acessibilidade** | `role="button"` ou `<button>`; `aria-pressed`; agrupar com `role="group"` + `aria-labelledby` via `SectionHeader`. |
| **Quando usar** | Filtros discretos com rótulo curto; seleção múltipla ou única por grupo. |
| **Quando não usar** | Navegação principal; enums com dezenas de opções (usar lista/search). |
| **Exemplo Embarcador mobile** | Sheet de filtros com grupos de [`cargo-filter-options.mock`](../../src/features/cargo/mocks/cargo-filter-options.mock.ts): status, origem, destino — alinhado ao blueprint §6.1. |

---

### 3.4 StatusBadge

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Comunicar status operacional em uma linha (em trânsito, cotação, atenção, entregue). |
| **Onde aparece** | `CargoCard`, header do detalhe, linhas de timeline resumida. |
| **Props sugeridas** | `children: ReactNode` · `tone?: 'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` · `density?: 'default' \| 'compact'` |
| **Variantes** | Mapeamento de domínio → `tone` (ex.: `open`/`bidding` → `info`; atraso → `warning`; bloqueio → `danger`) |
| **Estados** | Estático (sem press); pode coexistir com card pressable por baixo. |
| **Tokens** | `color.status/*`, `Label/M` ou `Caption`, padding `space/4`–`space/8` |
| **Bubble Press** | Não aplicar no badge isolado; press no `CargoCard` pai. |
| **Acessibilidade** | Texto legível; não depender só de cor (`children` descritivo). |
| **Quando usar** | Status único dominante no scan do card. |
| **Quando não usar** | Parágrafos de erro longos (`AlertState`); métricas numéricas (`OperationalMetricCard`). |
| **Exemplo Embarcador mobile** | Card em `/minhas-cargas` com badge “Documentação pendente” (`warning`) quando `documentReadiness < 100%`. |

---

### 3.5 SearchField

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Busca textual na lista (ID, título, origem, destino, embarcação). |
| **Onde aparece** | Topo fixo de `/cargas`, `/minhas-cargas`, catálogo dev. |
| **Props sugeridas** | `value` · `onChange` · `placeholder: string` · `ariaLabel: string` · `onClear?: () => void` · `disabled?` · `minCharsHint?: number` (ex.: 2 para filtrar) |
| **Variantes** | default · filled (com valor) · focus (anel/borda `color.action/primary`) |
| **Estados** | default · hover* · pressed/focus (scale 1.01) · disabled |
| **Tokens** | `radius/input`, `color.surface/secondary`, `color.text/secondary`, ícone `color.text/tertiary` |
| **Bubble Press** | Feedback leve no container no focus/press (`motion.scale/searchFocus`). |
| **Acessibilidade** | `<input type="search">` ou `text` com `role="searchbox"`; botão limpar com `aria-label`; associar `<label>` visualmente oculto se necessário. |
| **Quando usar** | Listas com > ~8 itens ou necessidade de achar CRG rapidamente. |
| **Quando não usar** | Filtros estruturados (usar chips); busca global cross-domínio (futuro). |
| **Exemplo Embarcador mobile** | `/minhas-cargas`: busca ≥2 caracteres; empty filtrado com microcopy §11 do doc de casos de uso. |

---

### 3.6 CargoCard

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Resumo operacional de uma carga — responde: o quê, onde, status, quando, precisa de ação? |
| **Onde aparece** | Listas `/cargas`, `/minhas-cargas`, vitrine do catálogo. |
| **Props sugeridas** | `cargoId: string` · `title: string` · `routeSummary: string` · `statusBadge: ReactNode` · `etaLabel?: string` · `nextStepLabel?: string` · `selected?: boolean` · `onPress: () => void` · `trailingAction?: ReactNode` |
| **Variantes** | default · selected/active (borda ou fundo elevado) · com CTA trailing (“Acompanhar”) |
| **Estados** | default · selected · pressed (card inteiro, scale 1.012 + overlay) · hover* |
| **Tokens** | `radius/card`, `color.surface/primary`, `shadow/1`, `data-status` opcional para tema de borda |
| **Bubble Press** | Obrigatório no container clicável; independente de `selected`. |
| **Acessibilidade** | Elemento único focável (`<button>` ou `<a>`); resumo em ordem lógica para leitor de tela; não aninhar botões interativos sem necessidade. |
| **Quando usar** | Qualquer lista de cargas mobile/tablet. |
| **Quando não usar** | Detalhe completo (usar seções no sheet); KPI agregado (`OperationalMetricCard`). |
| **Exemplo Embarcador mobile** | Lista privada: hierarquia **status > título > rota > ETA > próximo passo** ([§12 mobile-shipper](../product/mobile-shipper-use-cases.md#12-design-guidance-baseado-no-ds)). |

---

### 3.7 BottomNav

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Navegação primária mobile (3–4 destinos). |
| **Onde aparece** | Shell mobile embarcador; ocultar ou diminuir z-index quando sheet full estiver aberto. |
| **Props sugeridas** | `items: Array<{ id, label, href, icon, badge?: number }>` · `activeId: string` · `onNavigate: (id) => void` · `hidden?: boolean` |
| **Variantes** | item inactive · item active (cor/ícone `color.action/primary`) |
| **Estados** | active/inactive + pressed por item (Bubble Press) |
| **Tokens** | `color.surface/glass`, `blur/lg`, safe-area inset, `shadow/glass` |
| **Bubble Press** | Cada item, active ou não. |
| **Acessibilidade** | `<nav aria-label="...">` · item atual `aria-current="page"` · rótulos visíveis ou `aria-label` |
| **Quando usar** | MVP mobile embarcador (minhas cargas, marketplace secundário, perfil). |
| **Quando não usar** | Desktop cockpit; telas imersivas de mapa full-screen sem nav. |
| **Exemplo Embarcador mobile** | Item ativo = **Minhas cargas** pós-login ([§1 mobile-shipper](../product/mobile-shipper-use-cases.md#1-decisão-principal)); marketplace como entrada secundária, não home. |

---

### 3.8 BottomSheet

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Container modal inferior para filtros, detalhe e fluxos que não exigem página inteira no mobile. |
| **Onde aparece** | Filtros (~40vh compact / ~98vh expanded), detalhe da carga (~90dvh), confirmações. |
| **Props sugeridas** | Ver casca em [`src/shared/components/bottom-sheet/README.md`](../../src/shared/components/bottom-sheet/README.md): `open`, `onOpenChange`, `title`, `description`, `children`, `footer`, snaps (`snapHeights`, `snapOrder`, `initialSnap`), `enableDrag`, `variant`, `overlayVariant`, `closeAriaLabel`, etc. |
| **Variantes** | `variant`: `default` \| `strong` \| `map` · snaps: `compact` / `expanded` / custom · `viewportAnchor`: `inset` \| `flush` |
| **Estados** | closed · animating · open (snap atual) · dragging |
| **Tokens** | `radius/sheet`, `color.surface/glass`, `blur/md`, scrim sem neon |
| **Bubble Press** | No **fechar** (`IconButton` / CloseButton) e ações do `footer`; não no drag handle. |
| **Acessibilidade** | Foco preso enquanto aberto; `aria-modal`; título acessível; fechar com Esc; `prefers-reduced-motion` sem animação agressiva. |
| **Quando usar** | Filtros e detalhe no fluxo lista → filtro → detalhe (DS §8). |
| **Quando não usar** | Conteúdo longo que exige URL dedicada e SEO (preferir página `/cargas/[id]`); desktop split (painel lateral). |
| **Exemplo Embarcador mobile** | Abrir filtros da lista → selecionar chips → **Ver cargas** fecha mantendo estado; tap no card abre detalhe em snap ~90dvh. |

---

### 3.9 MapPreviewCard

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Preview estático ou semi-interativo da rota/corredor dentro do detalhe — **não** mapa produção completo. |
| **Onde aparece** | Detalhe da carga (thumb); catálogo DS; futuro `/cargas/[id]/mapa` como entrada. |
| **Props sugeridas** | `routeLabel: string` · `corridorLabel?: string` · `imageSlot?: ReactNode` · `onOpenMap?: () => void` · `aspectRatio?: '16/9' \| '2/1'` |
| **Variantes** | placeholder (fake premium) · com thumbnail GeoJSON renderizado · disabled (sem rota) |
| **Estados** | default · pressed (se `onOpenMap`) · loading skeleton |
| **Tokens** | `radius/card`, `color.surface/secondary`, borda `color.border/subtle`; sem mapa real obrigatório no MVP |
| **Bubble Press** | Se card inteiro for clicável para “Abrir mapa”. |
| **Acessibilidade** | `aria-label` descrevendo rota; botão “Ver no mapa” explícito se preview não for só decorativo. |
| **Quando usar** | Contexto espacial secundário no detalhe ([§10 mobile-shipper — Próximo](../product/mobile-shipper-use-cases.md#10-regras-de-priorização)). |
| **Quando não usar** | Lista MVP embarcador; cockpit desktop central (usar `MapContainer` futuro). |
| **Exemplo Embarcador mobile** | No sheet de detalhe, abaixo de rota/ETA: thumb com corredor Madeira–Tapajós (dados mock GeoJSON). |

---

### 3.10 OperationalMetricCard

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Exibir **um** KPI operacional acionável ou contextual (ex.: cargas com doc pendente, propostas abertas). |
| **Onde aparece** | Dashboard mobile simplificado (futuro); governo/impacto; **não** na lista embarcador MVP. |
| **Props sugeridas** | `label: string` · `value: string | number` · `tone?: StatusBadgeTone` · `hint?: string` · `onPress?: () => void` · `icon?: ReactNode` |
| **Variantes** | informativo · alerta (`warning`/`danger`) · sucesso |
| **Estados** | static · pressable (Bubble Press leve se `onPress`) |
| **Tokens** | `radius/card`, `Title/M` para valor, `Caption` para hint |
| **Bubble Press** | Apenas se navegar para lista filtrada. |
| **Acessibilidade** | Valor anunciado antes do hint; se clicável, nome acessível da ação. |
| **Quando usar** | Agregado com ação clara (“ver 3 pendências”). |
| **Quando não usar** | Decorar lista de cargas; gráficos sem ação ([§9 matriz — remover gráficos na lista](../product/mobile-shipper-use-cases.md#9-matriz-de-decisão)). |
| **Exemplo Embarcador mobile** | **Futuro** dashboard: “2 cargas aguardando documento” → navega para lista filtrada. |

---

### 3.11 EmptyState

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Lista ou seção sem dados — orientar próximo passo sem culpar o usuário. |
| **Onde aparece** | Lista vazia, busca/filtro sem resultado, seção de jornada sem eventos. |
| **Props sugeridas** | `title: string` · `description?: string` · `illustration?: ReactNode` · `primaryAction?: { label, onClick }` · `secondaryAction?` |
| **Variantes** | `noData` · `noResults` (busca/filtro) · `noPermission` (delegar a `PermissionGateCard` se bloqueio de role) |
| **Estados** | Estático |
| **Tokens** | `color.text/primary`, `color.text/secondary`, espaçamento `space/24` |
| **Bubble Press** | Apenas nos botões de ação (`Button`). |
| **Acessibilidade** | Título em heading (`h2`/`h3`); descrição associada; foco no CTA se existir. |
| **Quando usar** | Zero itens após load bem-sucedido ou filtro válido. |
| **Quando não usar** | Erro de rede (`AlertState`); loading (skeleton). |
| **Exemplo Embarcador mobile** | `/minhas-cargas` vazia: título e CTA conforme chaves `pages.myCargoes.emptyTitle` no doc de microcopy. |

---

### 3.12 AlertState

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Erro, aviso operacional ou falha de carregamento — banner persistido, não modal intrusivo no MVP. |
| **Onde aparece** | Topo da lista, bloco no detalhe (atraso, doc crítico), falha de fetch. |
| **Props sugeridas** | `variant: 'error' \| 'warning' \| 'info'` · `title: string` · `message?: string` · `onRetry?: () => void` · `dismissible?: boolean` |
| **Variantes** | inline banner · compact (uma linha) |
| **Estados** | visible · dismissed (opcional) |
| **Tokens** | `color.status/*` em fundo suave; borda `color.border/subtle`; sem glow |
| **Bubble Press** | Só no botão “Tentar novamente” se houver. |
| **Acessibilidade** | `role="alert"` ou `role="status"` conforme severidade; não roubar foco no mount. |
| **Quando usar** | Falha de API/mock, atraso crítico, documentação bloqueante. |
| **Quando não usar** | Toast efêmero para sucesso; empty de lista. |
| **Exemplo Embarcador mobile** | Falha ao carregar minhas cargas: mensagem `common.loadError` + retry. |

---

### 3.13 PermissionGateCard

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Explicar bloqueio por papel ou capability e oferecer caminho seguro (login, voltar, contato admin). |
| **Onde aparece** | Rotas privadas, seções de admin/governo, mock-mode. |
| **Props sugeridas** | `title: string` · `description: string` · `requiredCapability?: string` · `primaryAction?: { label, href \| onClick }` |
| **Variantes** | `unauthenticated` · `forbidden` · `mockOnly` |
| **Estados** | Estático |
| **Tokens** | Superfície `color.surface/primary`, ícone neutro, sem dados sensíveis na UI |
| **Bubble Press** | CTA principal apenas. |
| **Acessibilidade** | Mensagem clara; não expor IDs internos de capability ao usuário final. |
| **Quando usar** | `canUserViewPrivateCargo` falso ou nav filtrada. |
| **Quando não usar** | Empty legítimo (usuário autorizado sem dados). |
| **Exemplo Embarcador mobile** | Transportador tenta `/minhas-cargas` de outro shipper — bloqueio sem vazar título da carga. |

---

### 3.14 SectionHeader

| Campo | Especificação |
|-------|----------------|
| **Propósito** | Título de seção + ação opcional (“Ver todos”, “Limpar”) em listas, sheets e detalhe. |
| **Onde aparece** | Grupos de filtros (`FilterGroup`), blocos no detalhe (Jornada, Documentos, Custos). |
| **Props sugeridas** | `title: string` · `subtitle?: string` · `trailing?: ReactNode` · `level?: 2 \| 3` (heading) |
| **Variantes** | default · compact (sheet de filtros) |
| **Estados** | Estático; ação trailing pode ser `Button` ghost ou `IconButton` |
| **Tokens** | `Title/M` ou `Label/M`, `color.text/secondary` no subtitle |
| **Bubble Press** | Apenas no trailing interativo. |
| **Acessibilidade** | Heading semântico; trailing com nome acessível. |
| **Quando usar** | Separar grupos de chips ou seções scrolláveis no detalhe. |
| **Quando não usar** | Título de página inteira (usar header de rota). |
| **Exemplo Embarcador mobile** | No sheet de filtros: `SectionHeader` “Status” + row de `FilterChip`; repetir para origem/destino conforme §7.2 do doc de casos de uso. |

---

## 4. Catálogo visual (`/dev/design-system`)

### 4.1 Objetivo da rota

Página **dev-only** que documenta visualmente o contrato deste arquivo: tokens, variantes, estados e exemplos dark/light — sem Storybook e sem dependências novas.

**Rota alvo:** `/[locale]/dev/design-system`  
**Implementação futura:** `src/app/[locale]/dev/design-system/page.tsx` (+ layout mínimo se necessário).

### 4.2 Proteção e escopo

| Regra | Detalhe |
|-------|---------|
| Ambiente | Visível apenas em desenvolvimento ou com flag explícita (mesmo padrão de `/dev/mobile-cargo-list-lab`). |
| i18n | Locale no path; textos de demo podem usar namespace `dev.designSystem` |
| Dados | Fixtures determinísticas locais na página — **não** importar mocks de negócio com PII |

### 4.3 Seções da página (ordem sugerida)

1. **Tokens** — swatches de `color.*`, radius, spacing, tipografia, motion scales  
2. **Button** — variantes + loading + disabled + Bubble Press demo  
3. **IconButton** — sizes + glass/ghost + active  
4. **FilterChip** — selected/unselected + grupo exemplo  
5. **StatusBadge** — todos os `tone`  
6. **SearchField** — empty, filled, focus  
7. **CargoCard** — default + selected + com `nextStepLabel`  
8. **BottomNav** — 3–4 itens mock  
9. **BottomSheet** — trigger + exemplo filtros e exemplo detalhe (estado controlado)  
10. **MapPreviewCard** — placeholder premium  
11. **OperationalMetricCard** — 2–3 KPIs exemplo  
12. **EmptyState** / **AlertState** / **PermissionGateCard** — lado a lado  
13. **SectionHeader** — com trailing “Limpar”  
14. **Tema** — toggle `data-theme` dark/light na própria página  

Cada seção deve exibir **nome do componente**, link para este contrato (âncora) e nota “implementado | planejado”.

### 4.4 O que o catálogo não precisa fazer (MVP da rota)

- Drag físico completo do sheet além do que o componente já suporta  
- Dados reais de marketplace ou persistência `.mock-data`  
- Paridade desktop cockpit  

---

## 5. Relação com produto e migração

### 5.1 Ordem de consumo em telas reais

| Ordem | Rota | Papel | Componentes prioritários |
|-------|------|-------|---------------------------|
| **1ª** | `/[locale]/cargas` (marketplace público) | Primeira tela real a adotar o contrato unificado | `SearchField`, `FilterChip`, `CargoCard`, `StatusBadge`, `BottomSheet`, `EmptyState`, `AlertState` |
| **2ª** | `/[locale]/minhas-cargas` (privado embarcador) | Segunda — home operacional do shipper | Idem + `nextStepLabel`, `PermissionGateCard`, `BottomNav` wired |
| **Lab** | `/[locale]/dev-v2` (`MobileCargoListLabV2`) | Laboratório visual até paridade | Referência de comportamento, **não** fonte de cópia |

Fluxo núcleo (DS §8 e blueprint §5): **Lista → Filtros (sheet) → Detalhe (sheet)** — ver diagrama [hydririvers-mobile-shipper-core-flow.png](../product/references/mobile-shipper-flow/hydririvers-mobile-shipper-core-flow.png).

### 5.2 dev-v2 vs extração limpa

| Fazer | Não fazer |
|-------|-----------|
| Extrair `FilterChip` a partir do comportamento validado de `FilterChipButton` no lab | Copiar SCSS inteiro do lab para produção sem tokens semânticos |
| Alinhar `IconButton` ao Bubble Press do DS | Manter `scale(0.965)` no `:active` |
| Reutilizar `BottomSheet` shared para filtros e detalhe | Criar terceiro motor de sheet na feature cargo |
| Conectar `/cargas` aos mocks canônicos (`marketplace`, `cargo-filter-options`) | Manter array `CARGOES` inline no TSX de produção |

### 5.3 Coexistência com Hydro / Liquid Glass

O repositório contém primitivos `liquid-glass-*` usados no lab. **Decisão:** componentes deste contrato são a **API pública** alvo; primitivos glass convergem por tokens (`--hydro-*`) até substituição gradual ([`hydro-design-system.md`](./hydro-design-system.md), ADR-0032). O catálogo `/dev/design-system` mostra os componentes do **contrato HydriRivers DS**, não todas as variantes experimentais do lab.

### 5.4 Desktop

Componentes são **os mesmos**; a composição muda (painel lateral vs sheet). `BottomNav` permanece **mobile-only**. Não regressar `OperationsBoard` desktop ao refatorar mobile.

---

## 6. Critérios de aceite deste documento

| Critério | Status esperado |
|----------|-----------------|
| Arquivo `docs/design/hydririvers-component-contract.md` criado | ✓ (este arquivo) |
| Nenhum código, teste, config ou `package.json` alterado | ✓ escopo documentação apenas |
| Cada componente base listado tem contrato (props, variantes, estados, tokens, Bubble Press, a11y, uso) | ✓ §3 |
| Rota visual futura `/[locale]/dev/design-system` definida com seções | ✓ §4 |
| Relação com `/cargas`, `/minhas-cargas`, `dev-v2` documentada | ✓ §5 |
| Referências ao DS oficial, quick reference, blueprint e mobile-shipper | ✓ cabeçalho e links |
| Próximo PR pode implementar a rota e os componentes sem ambiguidade | ✓ §7 |

---

## 7. Próximo PR sugerido

**Título sugerido:** `feat(ds): add dev design-system catalog route`

**Escopo mínimo:**

1. Criar `src/app/[locale]/dev/design-system/page.tsx` (guard dev).  
2. Implementar ou reexportar componentes conforme §3 (prioridade: `Button`, `FilterChip`, `StatusBadge`, `SearchField`, `CargoCard`, `BottomSheet`).  
3. Corrigir Bubble Press em `IconButton` legado se ainda houver scale down.  
4. Testes unitários por componente tocado; screenshots 375/390px no PR.  
5. **Não** alterar `/cargas` produção no mesmo PR se o diff visual for grande — preferir PR seguinte “adopt DS on /cargas”.

**Validações (PR de implementação):**

```bash
npm run lint
npm run typecheck
npm run check:i18n
npm run test:unit
npm run build
```

---

## Apêndice — Mapa componente → arquivo atual (referência)

| Contrato | Situação no repo (2026-06-01) |
|----------|-------------------------------|
| `Button` | `src/shared/ui/button` (evoluir para DS tokens + danger) |
| `IconButton` | `src/shared/design-system/components/icon-button` |
| `FilterChip` | Lógica em `mobile-cargo-list-lab-v2` — **extrair** |
| `StatusBadge` | `src/shared/design-system/components/status-badge` |
| `SearchField` | Primitivo `liquid-glass-search-field` + UI legada — **unificar** |
| `CargoCard` | Feature cargo / lab — **extrair** para DS ou feature/shared cargo |
| `BottomNav` | Lab v2 — **extrair** |
| `BottomSheet` | `src/shared/components/bottom-sheet` ✓ |
| Demais §3.9–3.14 | **A criar** conforme contrato |

Este apêndice é informativo; a fonte de verdade de comportamento desejado permanece nas seções §3–§5 acima.
