# ADR 0025: Header responsivo (busca nao pode esmagar acoes)

Status: **accepted**  
Data: 2026-05-11

## Contexto

O header do shell administrativo reune:

- contexto da rota (titulo/subtitulo),
- busca global,
- status do sistema,
- notificacoes,
- perfil.

Em larguras intermediarias (desktop menor/tablet), a busca pode competir por espaco e acabar esmagando controles criticos.

## Problema

- busca sem limite claro pode invadir a coluna de acoes;
- perfil com nome longo pode quebrar layout;
- notificacoes/status podem perder area clicavel.

## Decisao

Adotar um padrao responsivo onde:

- titulo pode encolher (`minmax(0, 1fr)`),
- busca tem limite (`max-width`/`minmax(0, 520px)`),
- acoes nao encolhem (status/notificacoes/perfil com `flex: 0 0 auto`),
- nome do perfil e compacto (primeiro + ultimo sobrenome) com ellipsis.

## Alternativas consideradas

1. Permitir que a busca cresca e reduzir acoes (nao adotado).
2. Remover a busca do desktop (nao adotado).
3. Mover busca para segunda linha sempre (risco de redesign).
4. Padrao com limites e prioridades (decisao adotada).

## Consequencias positivas

- header mais previsivel e legivel;
- melhor acessibilidade (alvos clicaveis preservados);
- menos bugs visuais por nomes longos.

## Trade-offs

- em telas menores, a busca pode ficar mais curta (placeholder menos visivel).

## Criterios de revisao futura

- se a busca precisar de mais capacidade em tablet, considerar modo "botao de busca" com sheet/modal, sem quebrar desktop.

## Links relacionados

- `docs/audits/header-responsive-layout-current-state.md`
- `docs/audits/header-responsive-layout-implementation.md`

