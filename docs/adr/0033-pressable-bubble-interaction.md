# 0033 - Pressable Bubble Interaction

## Status

Accepted

## Context

O menu mobile validou um feedback de click/tap em que o item pressionado cresce de forma sutil, como uma bolha, e retorna ao tamanho original ao soltar. Esse comportamento deve virar um padrao reutilizavel para componentes clicaveis sem mudar o visual permanente, a cor, o background, a borda ou a sombra base dos componentes.

O efeito precisa ser opt-in para preservar a separacao entre experiencias mobile e desktop, evitar regressao visual em massa e manter o uso de Sass/CSS Modules nas features.

## Decision

Criar mixins compartilhados em `src/shared/styles/interactions/_pressable.scss` para aplicar o padrao em componentes que escolherem esse feedback explicitamente:

- `pressableBubble`: mixin principal para botoes, chips e superficies clicaveis.
- `pressableIconButton`: variacao com escala um pouco maior para botoes iconicos compactos.
- `pressableCard`: variacao mais contida para cards clicaveis.
- `focusBubble`: variacao opcional para casos em que o foco tambem deve comunicar pressabilidade, como search bars ou controles com foco visual proprio.

Valores base:

- escala: entre `1.035` e `1.06`;
- duracao: entre `120ms` e `180ms`;
- easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`;
- origem: `transform-origin: center`;
- layout: usar apenas `transform: scale(...)`, sem deslocar elementos ou recalcular fluxo.

O estado normal do componente nao muda. Durante `:active`, o componente escala de forma transitoria e volta a `scale(1)` quando o click/tap termina.

## Usage

O padrao deve ser aplicado em CSS Modules do proprio componente:

```scss
@use '@/shared/styles/interactions/pressable' as pressable;

.filterChip {
  @include pressable.pressableBubble;
}

.iconButton {
  @include pressable.pressableIconButton;
}

.cardButton {
  @include pressable.pressableCard;
}
```

## Where To Use

Usar em componentes clicaveis que se beneficiam de feedback fisico curto:

- icon buttons;
- buttons;
- chips;
- search bar/focus, quando o padrao fizer sentido para a interacao;
- botao de fechar bottom sheet;
- cards clicaveis que abrem informacoes;
- demais controles clicaveis com area delimitada.

## Where Not To Use

Nao usar em:

- containers nao interativos;
- componentes que ja possuem animacao de press propria;
- elementos cuja escala possa cortar conteudo por overflow do pai;
- regioes densas em que multiplos elementos escalando prejudiquem leitura;
- transicoes permanentes de estado, como selecao, sucesso, erro ou loading.

## Accessibility

Os mixins respeitam `prefers-reduced-motion: reduce`. Nesse modo, a transicao e reduzida e a escala de press/focus e removida para evitar movimento desnecessario.

O padrao nao substitui estilos de foco acessiveis. Componentes devem continuar expondo `:focus-visible`, semantica correta de botao/link e nomes acessiveis quando aplicavel.

## Why Not globals.scss

Nao usar `globals.scss` porque o efeito precisa ser opt-in, local ao componente e sem impacto amplo em componentes existentes. CSS global tornaria facil aplicar a interacao por acidente em superficies que nao foram revisadas, aumentando risco de regressao entre mobile e desktop.

Sass Modules mantem o padrao compartilhado sem criar seletores globais: cada componente importa o mixin e decide quando aplicar.

## Consequences

- Positivas:
  - feedback de press consistente entre componentes;
  - nenhum componente muda ate optar pelo mixin;
  - sem dependencia nova;
  - sem alteracao em cor, background, borda, sombra ou layout.
- Custos:
  - cada componente precisa importar e aplicar o mixin durante migracoes futuras;
  - componentes com `transform` proprio precisam compor o efeito com cuidado para nao sobrescrever transformacoes existentes.

## Data

2026-05-31

## Responsaveis

HydroRivers frontend/product team
