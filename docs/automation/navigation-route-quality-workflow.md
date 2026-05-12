# Workflow: Qualidade de Navegação e Rotas

Data: 2026-05-11

## Objetivo

Evitar rotas órfãs, menus inconsistentes e acesso indevido, garantindo que navegação reflita:

- fronteiras de produto (Home vs Dashboard vs Marketplace vs Privado);
- permissões/capabilities (role-based);
- i18n e copy humanizada;
- active state correto.

## Checklist

- Toda rota principal tem:
  - item no menu **ou**
  - decisão documentada (por que não aparece no menu).
- Header condiz com a rota real (Home não se chama Dashboard).
- Active state:
  - não usa `includes`/`startsWith` genérico que marque item errado;
  - considera rotas detalhe (ex.: `/minhas-cargas/[id]` marca “Minhas Cargas”).
- Rotas públicas/privadas documentadas (ver `docs/product/roles-and-permissions.md`).
- Acesso direto sem permissão:
  - mostra “acesso negado” humanizado ou redirect seguro conforme padrão;
  - não mostra 404 genérico como “controle de acesso”;
  - não vaza dados privados.
- i18n:
  - labels de navegação existem em `pt-BR`, `en`, `es`.
- Testes:
  - smoke tests de navegação por role (menu renderiza itens corretos);
  - rotas restritas exibem fallback correto.

