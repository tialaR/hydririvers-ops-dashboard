# ADR 0019: Home navigation boundaries

**Status:** accepted  
**Data:** 2026-05-10

## Contexto

A página inicial com o hero narrativo do produto vivia dentro do shell administrativo, mas não aparecia com clareza na navegação lateral e podia ser confundida com `Dashboard`.

## Problema

- A Home ficava órfã no menu.
- O cabeçalho mostrava `Dashboard · Operações Fluviais` mesmo quando a rota atual era `/`.
- A navegação não deixava claro o papel distinto entre Home e Dashboard.

## Decisão

- Exibir `Home`/`Início` como item explícito na navegação do shell.
- Ajustar o cabeçalho para refletir a rota ativa.
- Manter `Dashboard` como cockpit operacional separado.
- Manter `Cargas` como marketplace público.

## Alternativas consideradas

1. Deixar a Home sem item no menu.
2. Tratar a Home como Dashboard.
3. Remover a página Home.
4. Criar item `Início` e manter Dashboard separado.
5. Mover a landing para fora do shell administrativo.

## Consequências positivas

- A Home deixa de ficar órfã.
- A leitura da navegação fica mais clara para usuários leigos.
- O shell passa a refletir a rota ativa com menos ambiguidade.

## Trade-offs

- A sidebar fica com mais um item visível.
- O cabeçalho precisa de texto roteado por contexto.

## Critérios de revisão futura

- Se a Home deixar de existir como porta narrativa, este ADR deve ser revisto.
- Se uma nova tela de entrada pública for criada fora do shell, a estrutura de navegação deve ser reavaliada.

## Links relacionados

- [docs/product/hydririvers-visual-language.md](../product/hydririvers-visual-language.md)
- [docs/audits/home-navigation-and-dashboard-theme-implementation.md](../audits/home-navigation-and-dashboard-theme-implementation.md)
