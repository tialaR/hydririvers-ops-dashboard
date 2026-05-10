# Workflow de design system

## Objetivo

Criar componentes consistentes, acessíveis e reaproveitáveis sem transformar `shared` em uma camada genérica demais.

## Quando criar componente novo

- existe repetição real em duas ou mais features;
- o comportamento é visual ou estrutural e não contém regra de negócio;
- o componente precisa ser usado em vários layouts ou overlays;
- o estado e os slots são claros o bastante para virar API estável.

## Quando colocar em `shared/ui`

- botão, badge, card, dialog, bottom sheet, tabs, skeleton, tooltip, input base;
- layout e shell globais;
- utilitários visuais realmente transversais.

## Quando ficar em `features`

- componentes que conhecem domínio;
- cards e listas com semântica de negócio;
- views de formulários que dependem de services/hook da feature;
- elementos que misturam dados, regras e copy do domínio.

## Como documentar estados

- default;
- hover;
- focus;
- disabled;
- loading;
- error;
- empty;
- mobile compact;
- dark/light.

## Como validar

- verificar contraste e foco;
- conferir responsividade em mobile e desktop;
- testar com i18n real;
- revisar se o componente ainda fica compreensível com dados mockados.

## Como evitar duplicação

- primeiro extrair o padrão, depois especializar;
- não criar abstração se há uso único e sem recorrência;
- não mover regra de negócio para `shared`.
