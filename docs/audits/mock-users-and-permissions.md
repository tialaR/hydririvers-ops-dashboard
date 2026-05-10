# Usuários mockados e permissões

## Usuários encontrados

| id | nome | role | status | Cargas | Minhas cargas | Criar carga | Negociar | Operar / rastrear | Governo / Admin |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `u-shipper-1` | Tiala Rocha | shipper | approved | pode ver marketplace e fluxos públicos | vê suas cargas privadas | sim | sim | sim | não |
| `u-carrier-1` | João Navegante | carrier | approved | pode ver marketplace e cargas atribuídas | vê suas cargas operacionais | não | sim | sim | não |
| `u-admin-1` | Operação HydroRivers | admin | approved | vê visões amplas | não é o foco principal | não | sim | sim | sim |
| `u-shipper-2` | Mariana Tapajós | shipper | approved | pode ver marketplace | teria Minhas cargas se houver dados próprios | sim | sim | sim | não |
| `u-carrier-2` | Carlos Madeira | carrier | approved | pode ver marketplace | teria Minhas cargas se houver dados próprios | não | sim | sim | não |
| `u-carrier-3` | Ana Solimões | carrier | pending/false approval | acesso limitado conforme shell | acesso limitado | não | limitado | limitado | não |

## Observações

- O usuário recorrente do fluxo privado é `u-shipper-1` / Tiala Rocha.
- Os dados de `src/features/my-cargos/mocks/myCargos.mock.ts` estão vinculados a `u-shipper-1`.
- O mock de permissões ainda é simples e deve ser expandido se novos fluxos precisarem de mais personas.

## Recomendação

Manter pelo menos estas personas:

- embarcador;
- operador/carrier;
- admin;
- stakeholder de governo, se houver tela específica.
