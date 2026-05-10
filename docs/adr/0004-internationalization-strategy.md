# Estratégia de i18n para pt-BR, en-US e es-ES

## Status

Aprovado

## Contexto

O produto precisa falar a língua do usuário em diferentes mercados, sem strings hardcoded espalhadas.

## Decisão

Usar namespaces por domínio e manter `pt-BR`, `en-US` e `es-ES` sincronizados.

## Consequências

- Troca de idioma fica previsível.
- Hardcodes ficam mais fáceis de auditar.
- Novas features precisam nascer já localizadas.

## Alternativas consideradas

- Misturar texto fixo com traduções parciais.

## Data

2026-05-09

## Responsáveis

HydroRivers frontend/product team

