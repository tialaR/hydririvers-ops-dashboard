# Usuários mockados e permissões

Matriz de referência para QA e Fase 2 (registry único). Senha demo comum: **`hydro123`** (`demoPassword`).

## Matriz principal

| id | Nome | role | phoneE164 | Aprovado | Hub QA | Cargas públicas | Minhas cargas | Criar carga | Negociar | Operar / rastrear | Governo / Admin |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `u-shipper-1` | Tiala Rocha | shipper | +5591999990001 | sim | sim (`tiala`) | sim | sim (owner) | sim | sim | sim | não |
| `u-shipper-2` | Mariana Tapajós | shipper | +5593999990004 | sim | **não** (gap Fase 2) | sim | sim se houver dados | sim | sim | sim | não |
| `u-carrier-1` | João Navegante | carrier | +5592999990002 | sim | sim (`joao`) | sim | sim (atribuídas) | não | sim | sim | não |
| `u-carrier-2` | Carlos Madeira | carrier | +5569999990005 | sim | sim (`carlos`) | sim | sim se houver dados | não | sim | sim | não |
| `u-carrier-3` | Ana Solimões | carrier | +5597999990006 | **não** (pending) | sim (`ana`) | limitado | limitado | não | limitado | limitado | não |
| `u-admin-1` | Operação HydroRivers | admin | +5591999990003 | sim | sim (`admin`) | visão ampla | não é foco | não | sim | sim | sim |
| — | Visitante não autenticado | — | — | — | — | `/cargas` apenas | **bloqueado** | não | não | não | não |

### E-mails (login ainda exige coerência com telefone)

| Nome | E-mail |
|------|--------|
| Tiala Rocha | tiala@hydrorivers.com |
| Mariana Tapajós | mariana@bioamazonia.coop |
| João Navegante | joao@naveganorte.com |
| Carlos Madeira | carlos@hidroviasmadeira.com |
| Ana Solimões | ana@rioslog.com |
| Operação HydroRivers | admin@hydrorivers.com |

## Gaps de persona

| Persona de negócio | Auth persona | Notas |
|--------------------|--------------|-------|
| Embarcador | Tiala, Mariana | Mariana fora do hub QA até Fase 2 |
| Transportador / operador | João, Carlos, Ana | Ana = moderação pendente |
| Admin / operação | Operação HydroRivers | Mock mode reset, visões amplas |
| Operador portuário | **sem persona auth** | Usar fluxos públicos ou Fase 2+ |
| Documental / compliance | **sem persona auth** | Testar via negociações/cargas com usuário existente |
| Regulatório / governo | **sem persona auth** | Rotas `impact`/`government` com admin ou visitante conforme regra |
| Visitante | não autenticado | Marketplace `/cargas` |
| US / ES (PhoneInput) | **sem seed** | Dial +1/+34 suportados na UI; seed só +55 |

## Regra de telefone único

- `phoneE164` é único na massa mock (`isPhoneE164Taken`).
- Cadastro com telefone existente → `phone-already-registered` (409).
- Login localiza usuário por telefone; e-mail deve corresponder ao registro.

Ver [`docs/business-rules.md`](../business-rules.md) e [`docs/MOCK-MODE-QA-HUB.md`](../MOCK-MODE-QA-HUB.md).

## Dados vinculados

- `u-shipper-1` / Tiala: dona principal em `src/features/my-cargos/mocks/` (minhas cargas embarcador).
- Transportadores: cargas atribuídas via `carrierId` nos mocks de marketplace.
- `MOCK_QA_PERSONAS`: 5 entradas alinhadas por `mockUserId` e e-mail a `defaultUsers` (teste unitário).

## Fontes (divergência até Fase 2)

| Fonte | Usuários |
|-------|----------|
| `.mock-data/users.json` | 6 (incl. Mariana) |
| `auth.mock.ts` / `defaultUsers` | 6 |
| `MOCK_QA_PERSONAS` | 5 (sem Mariana) |
| Hub QA UI | 5 cartões |

**Fase 2:** registry único consumido por todas as fontes acima.

## Recomendação

Manter no mínimo: embarcador aprovado, transportador aprovado, transportador pendente, admin, visitante. Expandir com Mariana no hub e personas US/ES quando o registry existir.
