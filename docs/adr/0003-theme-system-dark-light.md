# Sistema de temas dark/light com tokens globais

## Status

Aprovado

## Contexto

O dashboard consolidou um visual dark premium, mas a aplicação também precisa responder a light mode sem perda de contraste.

## Decisão

Centralizar tokens no tema global e fazer os componentes consumirem variáveis de design em vez de cores fixas.

## Consequências

- Dark mode preserva identidade.
- Light mode passa a ser viável sem retrabalho por tela.
- Exige revisão contínua de cores hardcoded.

## Alternativas consideradas

- Tema por componente isolado.

## Data

2026-05-09

## Responsáveis

HydroRivers frontend/product team

