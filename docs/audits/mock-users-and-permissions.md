# Usuários mockados e permissões

Matriz de referência para QA. **Fonte canônica:** `src/shared/mock-data/mock-user-registry.ts`. Senha demo comum: **`hydro123`** (`demoPassword`).

## Registry e consumidores

| Camada | Origem |
|--------|--------|
| Registry canônico | `MOCK_USER_REGISTRY` em `mock-user-registry.ts` |
| Auth seed | `defaultUsers` = `toHydroUsers()` em `auth.mock.ts` |
| Runtime JSON | `.mock-data/users.json` derivado de `defaultUsers` via `mock-db.ts` |
| QA Hub | `MOCK_QA_PERSONAS` = `toQaPersonas()` (somente `qaHubVisible`) |
| Login prefill (telefone) | `findSeedPhoneByEmail()` |
| QA direct login whitelist | `getQaDirectLoginEmails()` |

**Visitante** (`MOCK_PUBLIC_VISITOR`): caso separado, sem telefone, `/cargas` público, `/minhas-cargas` bloqueado.

## Matriz principal — Brasil (operacional)

| id | Nome | role | phoneE164 | Aprovado | Hub QA | Cargas públicas | Minhas cargas | Criar carga | Negociar | Operar / rastrear | Governo / Admin |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `u-shipper-1` | Tiala Rocha | shipper | +5591999990001 | sim | sim (`tiala`) | sim | sim (owner) | sim | sim | sim | não |
| `u-shipper-2` | Mariana Tapajós | shipper | +5593999990004 | sim | sim (`mariana`) | sim | sim se houver dados | sim | sim | sim | não |
| `u-carrier-1` | João Navegante | carrier | +5592999990002 | sim | sim (`joao`) | sim | sim (atribuídas) | não | sim | sim | não |
| `u-carrier-2` | Carlos Madeira | carrier | +5569999990005 | sim | sim (`carlos`) | sim | sim se houver dados | não | sim | sim | não |
| `u-carrier-3` | Ana Solimões | carrier | +5597999990006 | **não** (pending) | sim (`ana`) | limitado | limitado | não | limitado | limitado | não |
| `u-admin-1` | Operação HydroRivers | admin | +5591999990003 | sim | sim (`admin`) | visão ampla | não é foco | não | sim | sim | sim |
| — | Visitante não autenticado | — | — | — | — | `/cargas` apenas | **bloqueado** | não | não | não | não |

## Matriz — EUA (international-demo / locale QA)

| id | Nome | locale | phoneE164 | Aprovado | Hub QA | Notas |
| --- | --- | --- | --- | --- | --- | --- |
| `u-us-shipper-1` | Emily Hartwell | en-US | +15550100001 | sim | sim | Sem cargas US no mock |
| `u-us-carrier-1` | Marcus Whitfield | en-US | +15550100002 | sim | sim | Dial +1, permissões carrier |
| `u-us-carrier-2` | Priya Nair | en-US | +15550100003 | **não** | sim | Par US de Ana (pending) |

## Matriz — Espanha (international-demo / locale QA)

| id | Nome | locale | phoneE164 | Aprovado | Hub QA | Notas |
| --- | --- | --- | --- | --- | --- | --- |
| `u-es-shipper-1` | Lucía Morales | es | +34600999001 | sim | sim | Sem cargas ES no mock |
| `u-es-carrier-1` | Pablo Ribera | es | +34600999002 | sim | sim | Dial +34, permissões carrier |
| `u-es-carrier-2` | Elena Castillo | es | +34600999003 | **não** | sim | Par ES de Ana (pending) |

### E-mails (login ainda exige coerência com telefone)

| Nome | E-mail |
|------|--------|
| Tiala Rocha | tiala@hydrorivers.com |
| Mariana Tapajós | mariana@bioamazonia.coop |
| João Navegante | joao@naveganorte.com |
| Carlos Madeira | carlos@hidroviasmadeira.com |
| Ana Solimões | ana@rioslog.com |
| Operação HydroRivers | admin@hydrorivers.com |
| Emily Hartwell | emily.hartwell@mississippi-logistics.com |
| Marcus Whitfield | marcus.whitfield@ohioriverfreight.com |
| Priya Nair | priya.nair@greatlakesnav.com |
| Lucía Morales | lucia.morales@hidrovia-iberica.es |
| Pablo Ribera | pablo.ribera@riberaebro.es |
| Elena Castillo | elena.castillo@canal-logistica.es |

## Gaps de persona

| Persona de negócio | Auth persona | Notas |
|--------------------|--------------|-------|
| Embarcador BR | Tiala, Mariana | Personas operacionais principais |
| Transportador / operador BR | João, Carlos, Ana | Ana = moderação pendente |
| Admin / operação | Operação HydroRivers | Mock mode reset, visões amplas |
| International-demo US | Emily, Marcus, Priya | Locale/auth QA; massa de cargas BR |
| International-demo ES | Lucía, Pablo, Elena | Locale/auth QA; massa de cargas BR |
| Operador portuário | **sem persona auth** | Usar fluxos públicos ou fase futura |
| Documental / compliance | **sem persona auth** | Testar via negociações/cargas com usuário existente |
| Regulatório / governo | **sem persona auth** | Rotas `impact`/`government` com admin ou visitante |
| Visitante | `MOCK_PUBLIC_VISITOR` | Marketplace `/cargas` |

## Regra de telefone único

- `phoneE164` é único na massa mock (`isPhoneE164Taken`).
- Cadastro com telefone existente → `phone-already-registered` (409).
- Login localiza usuário por telefone; e-mail deve corresponder ao registro.

Ver [`docs/business-rules.md`](../business-rules.md) e [`docs/MOCK-MODE-QA-HUB.md`](../MOCK-MODE-QA-HUB.md).

## Dados vinculados

- `u-shipper-1` / Tiala: dona principal em `src/features/my-cargos/mocks/` (minhas cargas embarcador).
- Transportadores BR: cargas atribuídas via `carrierId` nos mocks de marketplace.
- Personas US/ES: **sem cargas internacionais** nesta fase — validam auth, locale e telefone.

## Recomendação

Manter no mínimo: embarcador aprovado BR, transportador aprovado BR, transportador pendente BR, admin, visitante. Personas US/ES complementam QA de locale e dial internacional.
