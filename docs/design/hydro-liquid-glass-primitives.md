# Hydro Liquid Glass Primitives

Primitives oficiais e unicos aceitos para UI liquid glass no Hydro DS.

## Surface

- Path: `src/shared/design-system/primitives/liquid-glass-surface`
- Objetivo: container base glass para cards e paineis.
- Quando usar: base estrutural de bloco visual.
- Quando nao usar: acao clicavel primaria (usar Button).

## Button

- Path: `src/shared/design-system/primitives/liquid-glass-button`
- Objetivo: botao de acao principal/secundaria.
- Quando usar: CTA e acoes de fluxo.
- Quando nao usar: selecao persistente de estado (usar Switch/SegmentedControl).

## SegmentedControl

- Path: `src/shared/design-system/primitives/liquid-glass-segmented-control`
- Objetivo: alternancia entre opcoes mutuamente exclusivas.
- Quando usar: filtros de estado/tipo.
- Quando nao usar: menu longo com muitas opcoes.

## SearchField

- Path: `src/shared/design-system/primitives/liquid-glass-search-field`
- Objetivo: entrada de busca otimizada para mobile.
- Quando usar: pesquisa textual.
- Quando nao usar: formulario geral (usar TextField).

## Toolbar

- Path: `src/shared/design-system/primitives/liquid-glass-toolbar`
- Objetivo: acoes contextuais em faixa fixa.
- Quando usar: header/footer de acoes.
- Quando nao usar: navegacao de abas (usar TabBar).

## Sheet

- Path: `src/shared/design-system/primitives/liquid-glass-sheet`
- Objetivo: superficie modal/bottom sheet.
- Quando usar: fluxo contextual temporario.
- Quando nao usar: tela principal persistente.

## Menu

- Path: `src/shared/design-system/primitives/liquid-glass-menu`
- Objetivo: lista de opcoes acionaveis.
- Quando usar: overflow/context menu.
- Quando nao usar: tabs de navegacao principal.

## ScrollEdge

- Path: `src/shared/design-system/primitives/liquid-glass-scroll-edge`
- Objetivo: indicacao visual de borda em scroll.
- Quando usar: areas com overflow vertical.
- Quando nao usar: paginas sem rolagem relevante.

## TextField

- Path: `src/shared/design-system/primitives/liquid-glass-text-field`
- Objetivo: campo textual generico.
- Quando usar: formulario e filtros textuais.
- Quando nao usar: campo exclusivo de busca (usar SearchField).

## Progress

- Path: `src/shared/design-system/primitives/liquid-glass-progress`
- Objetivo: feedback de progresso/espera.
- Quando usar: carregamento ou evolucao de etapa.
- Quando nao usar: status binario simples.

## Switch

- Path: `src/shared/design-system/primitives/liquid-glass-switch`
- Objetivo: liga/desliga booleano.
- Quando usar: preferencia persistente.
- Quando nao usar: escolha entre varias opcoes.

## TabBar

- Path: `src/shared/design-system/primitives/liquid-glass-tab-bar`
- Objetivo: navegacao primaria por abas.
- Quando usar: secao raiz mobile.
- Quando nao usar: grupo curto de filtros (usar SegmentedControl).

## Popover

- Path: `src/shared/design-system/primitives/liquid-glass-popover`
- Objetivo: conteudo flutuante ancorado.
- Quando usar: detalhes/acoes contextuais.
- Quando nao usar: fluxo modal completo (usar Sheet).

## Window

- Path: `src/shared/design-system/primitives/liquid-glass-window`
- Objetivo: painel estilo janela para composicoes avançadas.
- Quando usar: composicoes desktop-like isoladas.
- Quando nao usar: card simples.
