# Mock Mode QA Hub — HydroRivers

## Objetivo do menu flutuante de QA

O botão flutuante **M** abre o painel **Mock mode** em ambientes não production (ou quando `HYDRORIVERS_FORCE_MOCK_QA_UI=true` em pipelines controlados). O objetivo é dar a QA e stakeholders uma **superfície visual** para:

- trocar o dataset mock global (cenários em `.mock-data`);
- seguir roteiros guiados no **QA Assistant** (catálogo de cenários);
- entrar rapidamente com personas demo (**QA Hub**) sem depender de logs no terminal.

O terminal **não** é a interface principal de QA. Prefira este hub, a UI e o DevTools (rede).

O painel **não aparece** em rotas públicas de auth (`/login`, `/register`) — ver [Visibilidade do painel](#visibilidade-do-painel).

## Fonte canônica (Fase 2)

**`src/shared/mock-data/mock-user-registry.ts`** é a fonte única de usuários/personas mockadas. Consumidores derivados:

| Consumidor | Derivação |
|------------|-----------|
| `defaultUsers` (`auth.mock.ts`) | `toHydroUsers()` |
| `.mock-data/users.json` | runtime via `mock-db.ts` a partir de `defaultUsers` |
| `MOCK_QA_PERSONAS` | `toQaPersonas()` — somente `qaHubVisible` |
| Hub QA (cartões) | `MOCK_QA_PERSONAS` + i18n `mockMode.qaHub.personas.*` |
| Prefill de telefone no login | `findSeedPhoneByEmail()` |
| Whitelist `qa-direct-login` | `getQaDirectLoginEmails()` |

**Visitante** (`MOCK_PUBLIC_VISITOR`) é caso separado — sem telefone, rota principal `/cargas`, bloqueado em `/minhas-cargas`.

Personas **BR** são operacionais principais (hidrovias amazônicas). Personas **US/en-US** e **ES/es** nesta fase servem para QA de locale, dial internacional e auth — **sem cargas internacionais** no mock.

## Contas demo no hub (12 personas)

O hub lista personas com `qaHubVisible: true` derivadas do registry via `MOCK_QA_PERSONAS`.

### Brasil (pt-BR) — operacionais

| Persona | Telefone (E.164) | E-mail | Papel | Aprovado |
|---------|------------------|--------|-------|----------|
| Tiala Rocha | +5591999990001 | tiala@hydrorivers.com | Embarcador | sim |
| Mariana Tapajós | +5593999990004 | mariana@bioamazonia.coop | Embarcador | sim |
| João Navegante | +5592999990002 | joao@naveganorte.com | Transportador | sim |
| Carlos Madeira | +5569999990005 | carlos@hidroviasmadeira.com | Transportador | sim |
| Ana Solimões | +5597999990006 | ana@rioslog.com | Transportador | não |
| Operação HydroRivers | +5591999990003 | admin@hydrorivers.com | Admin | sim |

### EUA (en-US) — international-demo

| Persona | Telefone (E.164) | E-mail | Papel | Aprovado |
|---------|------------------|--------|-------|----------|
| Emily Hartwell | +15550100001 | emily.hartwell@mississippi-logistics.com | Embarcador | sim |
| Marcus Whitfield | +15550100002 | marcus.whitfield@ohioriverfreight.com | Transportador | sim |
| Priya Nair | +15550100003 | priya.nair@greatlakesnav.com | Transportador | não |

### Espanha (es) — international-demo

| Persona | Telefone (E.164) | E-mail | Papel | Aprovado |
|---------|------------------|--------|-------|----------|
| Lucía Morales | +34600999001 | lucia.morales@hidrovia-iberica.es | Embarcador | sim |
| Pablo Ribera | +34600999002 | pablo.ribera@riberaebro.es | Transportador | sim |
| Elena Castillo | +34600999003 | elena.castillo@canal-logistica.es | Transportador | não |

Senha demo comum para todos: `hydro123`.

Senha demo comum: `hydro123` (`demoPassword` em `src/features/auth/domain/auth-constants.ts`).

Matriz completa (incl. Mariana e visitante): [`docs/audits/mock-users-and-permissions.md`](audits/mock-users-and-permissions.md).

## Telefone como identificador único no mock

No mock-mode, **`phoneE164` é o identificador operacional único** para lookup de usuário existente:

- login resolve o usuário por telefone (`findUserByPhone`);
- cadastro rejeita telefone já cadastrado (`phone-already-registered`);
- OTP mock é emitido para o `phoneE164` do desafio.

**Divergência atual:** o login ainda exige **e-mail + senha + telefone** coerentes com o registro do usuário — o e-mail deve bater com o usuário encontrado pelo telefone. Isso será simplificado na Fase 4.

## Diferença entre os dois botões do hub

1. **Usar no login**  
   Grava e-mail e senha demo em `sessionStorage` (`QA_LOGIN_PREFILL_STORAGE_KEY`) e recarrega a rota de login do locale atual. O formulário lê os valores. **Não** chama a API de login nem cria sessão. Serve para validar o fluxo normal com OTP (ainda é preciso informar telefone no formulário).

2. **Entrar como este usuário**  
   Chama `POST /api/mock-mode/login-as` com `userId` do perfil demo. Em ambientes não production (ou com `HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true` no CI/E2E), o servidor define o cookie `hydrorivers_session` como no login após OTP — **sem OTP**. A resposta inclui `redirectTo`; a UI mostra feedback (~1,4 s) e redireciona.

   _(Existe também `POST /api/auth/qa-direct-login` por e-mail, na lista branca QA; o hub usa `login-as`.)_

## Login, cadastro e OTP no estado atual

- **Login e cadastro** exigem e-mail, senha e telefone (com país) no formulário atual.
- **OTP mock** é obrigatório após credenciais válidas (login) ou após dados válidos no cadastro.
- **OTP visível em dev:** quando `NODE_ENV !== 'production'` ou `HYDRORIVERS_EXPOSE_OTP_CODE=true`, as rotas `POST /api/auth/login` e `POST /api/auth/register` incluem `otpCode` na resposta JSON. A UI exibe o código; o menu QA **não** expõe OTP diretamente (Fase 5).
- **OTP fixo em testes:** `HYDRORIVERS_MOCK_FIXED_OTP=true` gera sempre `000000` (`mock-otp-challenges.ts`).
- **Usuário existente no cadastro:** telefone ou e-mail já cadastrados retornam conflito — não registra novamente.

## Rotas públicas vs privadas (relevante para QA)

| Rota | Acesso | Notas |
|------|--------|-------|
| `/cargas` | **Público** | Marketplace / vitrine; visitante não autenticado pode ver |
| `/minhas-cargas` | **Privado** | Requer sessão; lista carteira do usuário logado |
| `/login`, `/register` | Público (auth shell) | Sem chrome logado; **sem** botão Mock mode |

Ver também [`docs/business-rules.md`](business-rules.md).

## Visibilidade do painel

`MockMode` (`src/shared/ui/mock-mode/mock-mode.tsx`) retorna `null` quando `isAuthPublicShellPathname(pathname)` — ou seja, em `/login` e `/register`. Em demais rotas do app (com shell), o botão **M** aparece conforme regras de ambiente.

## Cargo Status Assistant — como testar por persona

- **Tiala:** Abra uma carga da qual ela é owner; espere card do assistente com resumo, próximos passos, riscos e origem `mock-ai` quando houver pacote i18n para o status.
- **João / Carlos:** Com negociação vinculada à carga e ao `carrierId` correto, assistente autorizado; sem vínculo, bloqueio (403 no endpoint).
- **Ana:** Conta não aprovada — esperar bloqueio do assistente por moderação antes do escopo da carga.
- **Admin:** Pode usar qualquer carga existente no mock para smoke do assistente.

## Limitações atuais (pós-Fase 2)

| Limitação | Fase prevista |
|-----------|---------------|
| Catálogo QA Assistant grande (~40 cenários), difícil de escanear | Fase 6 — menu compacto por abas |
| Sem modo compacto / filtros avançados no hub | Fase 6 |
| OTP mock não aparece no menu QA (só via API/UI de auth) | Fase 5 |
| Personas US/ES sem cargas próprias no mock | Fase futura |
| Strings do catálogo QA em pt-BR hardcoded | Fase 6 — i18n |
| `suggestedActions` removido de personas (nunca renderizado) | — concluído Fase 1 |

## Plano em fases

| Fase | Escopo |
|------|--------|
| **1** | Docs confiáveis + neutralizar ruído óbvio no catálogo/personas |
| **2** (concluída) | Registry único `mock-user-registry.ts` → auth, hub, prefill, whitelist |
| **3** | Simplificar login UI/copy |
| **4** | Returning user / register por telefone |
| **5** | OTP mock dev colapsável no menu QA |
| **6** | Menu QA compacto por abas + i18n do catálogo |
| **7** | Testes unit/e2e ampliados |

## Registry — não duplicar manualmente

Ao adicionar ou alterar persona demo, editar **somente** `src/shared/mock-data/mock-user-registry.ts` e as chaves i18n `mockMode.qaHub.personas.<qaPersonaId>.*` quando o hub exibir o cartão. Não redeclarar e-mail/telefone/role em `auth.mock.ts`, `mock-qa-personas.ts` ou na rota `qa-direct-login`.

## Logs no terminal

Por padrão o projeto **não** imprime:

- `logUseCaseEvent` — só onde o código chamar o utilitário **e** `HYDRORIVERS_USE_CASE_LOGS=true`.
- `reportDevScenario` — só se `HYDRORIVERS_DEV_SCENARIO_LOGS=true`.

Os fluxos de auth e Cargo Status Assistant **não** chamam `reportDevScenario`.

## Variáveis de ambiente

| Variável | Função |
|----------|--------|
| `HYDRORIVERS_ALLOW_QA_DIRECT_LOGIN` | Em não production: `false` desativa login direto do hub (default permitido). |
| `HYDRORIVERS_FORCE_QA_DIRECT_LOGIN` | **Somente pipelines.** Permite login direto com `NODE_ENV=production` (Playwright). |
| `HYDRORIVERS_FORCE_MOCK_QA_UI` | **Somente pipelines.** Mostra painel Mock mode em build production-like. |
| `HYDRORIVERS_EXPOSE_OTP_CODE` | Expõe `otpCode` na API mesmo fora de dev. |
| `HYDRORIVERS_MOCK_FIXED_OTP` | OTP fixo `000000` para testes. |
| `HYDRORIVERS_USE_CASE_LOGS` | Logs de use case onde instrumentado. |
| `HYDRORIVERS_DEV_SCENARIO_LOGS` | Reporter de cenário no terminal. |

Ver também `.env.example` e [`docs/ENVIRONMENT.md`](ENVIRONMENT.md).

## Garantias de segurança

- Login direto por **`/api/mock-mode/login-as`** não existe em `NODE_ENV=production` salvo `HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true` (uso restrito a CI).
- Lista branca de e-mails derivada de `getQaDirectLoginEmails()` (`qa-direct-login`).
- Fluxo real com OTP permanece em `POST /api/auth/login`; contrato de API **não** alterado nesta fase.

## Documentação relacionada

- [`docs/audits/mock-mode-current-state.md`](audits/mock-mode-current-state.md) — auditoria técnica
- [`docs/audits/mock-users-and-permissions.md`](audits/mock-users-and-permissions.md) — matriz de personas
- [`docs/MOCK-MODE-USE-CASES.md`](MOCK-MODE-USE-CASES.md) — cenários de dataset
- [`docs/QA-TEST-MATRIX.md`](QA-TEST-MATRIX.md)
- [`docs/AI-CARGO-STATUS-ASSISTANT.md`](AI-CARGO-STATUS-ASSISTANT.md)
