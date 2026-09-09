# Arquitetura: Access Control (Roles, Capabilities e Guardas)

Data: 2026-05-11

## 1. Objetivo

Definir uma camada central de autorização **mock-friendly** e **testável**, para evitar permissões espalhadas no JSX e manter consistência entre:

- navegação (itens do menu);
- acesso a rotas (guardas);
- filtragem de dados (services/mocks);
- cenários do Mock Mode/QA Assistant.

## 2. Onde ficam roles/capabilities

Fonte de verdade (implementado):

- `src/features/auth/domain/access-control.ts`

O módulo deve:

- expor tipos de role/capability (ou equivalentes);
- expor helpers puros (sem dependência de React);
- permitir testes unitários.

## 3. Como a navegação consome permissões

Fonte de verdade (implementado):

- `src/shared/config/navigation.ts`

Regra: o menu deve esconder itens sem permissão/capability, em vez de “deixar e quebrar depois”.

## 4. Como services/mocks consomem permissões

Princípio:

- Dados privados não podem depender apenas de “esconder UI”.
- Services devem filtrar por usuário atual e regra de negócio.

Exemplos (implementado, mock-first):

- Marketplace (`/cargas`) pode ser compartilhado.
- “Minhas Cargas” (`/minhas-cargas`) deve ser por usuário/persona:
  - shipper: `shipperId/ownerUserId === user.id`
  - carrier: `assignedCarrierId/carrierId/operatorId === user.id`

## 5. Guardas de rota e fallback

Regras:

- rota privada acessada sem autenticação deve redirecionar/mostrar estado seguro conforme padrão do app;
- rota restrita acessada sem permissão deve exibir **acesso negado humanizado** (não 404 genérico);
- não vazar dados privados em erro/fallback.

## 6. Como adicionar uma role/capability

Checklist:

- adicionar o tipo/enum no módulo de access control;
- definir capabilities da role;
- atualizar navegação (itens visíveis);
- atualizar services/mocks (filtragem de dados);
- criar/ajustar testes unitários;
- atualizar docs em `docs/product/roles-and-permissions.md`.

## 7. Riscos e cuidados

- Evitar import circular (domain não deve depender de UI).
- Evitar strings soltas em múltiplos lugares.
- Evitar “if (role === ...)” espalhado no JSX.
- Não implementar RBAC enterprise com backend real nesta fase; manter foco em mock-first e previsibilidade.

