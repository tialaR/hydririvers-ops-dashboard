# Auditoria de estado atual — Mock Mode / Auth / QA

Última revisão: **Fase 1** (docs + higiene de catálogo). Contrato de API auth **inalterado**.

## Onde vive hoje

O Mock Mode vive principalmente em `src/shared/ui/mock-mode/` e usa camada de dados/suporte em `src/shared/server/`, `src/shared/qa/` e `src/shared/config/`.

### Mock Mode — painel flutuante

| Arquivo | Função |
|---------|--------|
| `src/shared/ui/mock-mode/mock-mode.tsx` | Shell do botão **M**; oculta em rotas auth públicas |
| `src/shared/ui/mock-mode/mock-scenario-control.tsx` | Troca de dataset (`POST /api/mock-mode`) |
| `src/shared/ui/mock-mode/mock-qa-hub.tsx` | Cartões de personas + prefill / login-as |
| `src/shared/ui/mock-mode/mock-qa-assistant.tsx` | Catálogo filtrável de cenários QA |
| `src/shared/ui/mock-mode/mock-qa-scenarios.ts` | Definição do catálogo (~40 cenários) |
| `src/shared/server/mock-scenarios.ts` | Estados consistentes por `MockScenarioId` |
| `src/shared/server/mock-db.ts` | Leitura/escrita `.mock-data` |
| `src/app/api/mock-mode/route.ts` | Listar/ativar cenário global |
| `src/app/api/mock-mode/login-as/route.ts` | Login direto QA por `userId` |
| `src/shared/qa/mock-qa-personas.ts` | `MOCK_QA_PERSONAS` (hub + whitelist parcial) |
| `src/shared/qa/mock-qa-ui-env.ts` | Flags de exibição do painel |
| `src/shared/qa/login-prefill.ts` | Chave `sessionStorage` para prefill |

### Login / Register (somente referência — fora do escopo de alteração)

| Arquivo | Função |
|---------|--------|
| `src/app/api/auth/login/route.ts` | Login em duas etapas: credenciais → OTP → sessão |
| `src/app/api/auth/register/route.ts` | Cadastro em duas etapas: dados → OTP → `upsertUser` |
| `src/features/auth/components/auth-form/auth-form.tsx` | UI login/cadastro/OTP |
| `src/features/auth/components/auth-form/phone-input.tsx` | `PhoneInput` com países suportados |
| `src/features/auth/domain/auth-schemas.ts` | Validação Zod login/register/OTP |
| `src/features/auth/domain/auth-normalization.ts` | Normalização e-mail/telefone |
| `src/features/auth/domain/auth-phone-countries.ts` | Países do dial (`AUTH_PHONE_COUNTRIES`) |
| `src/features/auth/domain/auth-constants.ts` | `demoPassword`, `otpLength`, expiração OTP |
| `src/features/auth/services/auth.client.ts` | Cliente HTTP auth + `mockModeLoginAs` |
| `src/shared/routing/app-routes.ts` | `isAuthPublicShellPathname` (login/register) |

### OTP mock

| Arquivo | Função |
|---------|--------|
| `src/features/auth/server/mock-otp-challenges.ts` | Desafios em memória (login + register) |
| `src/app/api/auth/login/route.ts` | `createLoginChallenge` / `verifyLoginChallenge` |
| `src/app/api/auth/register/route.ts` | `createRegisterChallenge` / `verifyRegisterChallenge` |

### Auth service / API (demais rotas)

| Arquivo | Função |
|---------|--------|
| `src/app/api/auth/me/route.ts` | Sessão atual |
| `src/app/api/auth/logout/route.ts` | Encerrar sessão |
| `src/app/api/auth/profile/route.ts` | Atualizar perfil |
| `src/app/api/auth/qa-direct-login/route.ts` | Login direto por e-mail (whitelist QA) |
| `src/shared/server/auth.ts` | `hashPassword`, `verifyPassword`, `toPublicUser` |
| `src/features/auth/domain/access-control.ts` | Capabilities e `requiresAuth` por rota |
| `src/features/auth/hooks/use-auth-session.ts` | Hook de sessão no cliente |
| `src/features/auth/data/auth.mock.ts` | `defaultUsers` (seed TypeScript) |
| `.mock-data/users.json` | Massa runtime (pode ser sobrescrita por cenário) |

### Mock users / personas

| Fonte | Conteúdo |
|-------|----------|
| `.mock-data/users.json` | 6 usuários BR com `phoneE164` |
| `src/features/auth/data/auth.mock.ts` | Espelho TypeScript dos seed users |
| `src/shared/qa/mock-qa-personas.ts` | 5 personas no hub (sem Mariana) |
| i18n `mockMode.qaHub.personas.*` | Copy dos cartões no hub |

## Regras atuais

### Geração e exposição OTP

1. Código numérico de 6 dígitos (`otpLength`).
2. Geração: `randomInt(0, 1_000_000)` ou `000000` se `HYDRORIVERS_MOCK_FIXED_OTP=true`.
3. Expiração: `otpExpiresInSeconds` (5 min) em memória (`Map`).
4. **Exposição na API:** `otpCode` incluído na resposta quando `NODE_ENV !== 'production'` **ou** `HYDRORIVERS_EXPOSE_OTP_CODE=true` (login e register).
5. Verificação: comparação exata (`acceptsMockOtp`); desafio invalidado após uso ou expiração.
6. **Menu QA:** não exibe OTP; depende da UI de auth ou da resposta da API.

### Lookup por telefone

- `findUserByPhone(users, phoneE164)` — match por dígitos normalizados de `phoneE164`.
- `isPhoneE164Taken` — impede cadastro com telefone duplicado.
- Login (etapa 1): resolve usuário **por telefone**; exige `email` coerente com o usuário encontrado **e** senha válida.

### Divergência documentada

| Aspecto | Comportamento |
|---------|---------------|
| Identificador único mock | `phoneE164` para existência e OTP |
| Formulário de login | Ainda pede e-mail + senha + telefone |
| Coerência | E-mail informado deve corresponder ao usuário do telefone |

Fase 4 endereça login/register orientado a telefone para usuário recorrente.

### Países no PhoneInput

`AUTH_PHONE_COUNTRIES` (`auth-phone-countries.ts`): **+55** BR, **+1** US, **+34** ES, **+57** CO, **+51** PE, **+56** CL.

### Seed users

Todos os usuários em `users.json` / `defaultUsers` são **BR-only** (`countryCode: +55`). Não há personas demo US/ES no seed (gap Fase 2).

### Rotas públicas / privadas

- `/cargas` — `requiresAuth: false` (`access-control.ts`, `cargo-visibility-policy` tier `public`).
- `/minhas-cargas` — `requiresAuth: true`, capability `view-my-cargoes`.
- Mock mode oculto em `/login` e `/register` via `isAuthPublicShellPathname`.

## Catálogo QA Assistant — higiene Fase 1

Arquivo: `src/shared/ui/mock-mode/mock-qa-scenarios.ts` (41 cenários, IDs estáveis).

### Cenários `status: 'partial'`

| ID | Motivo |
|----|--------|
| `cargos-market-and-filters` | Filtros avançados / estados documentais nem sempre alinhados ao dataset ativo |
| `notifications-one-unread` | Exige preparação manual de estado (4 lidas, 1 pendente) |

### Sobreposição / duplicados funcionais (não remover — IDs usados em testes)

| Cenário “guarda-chuva” | Cenários mais específicos | Nota |
|-------------------------|---------------------------|------|
| `negotiations-flow` | `negotiations-counteroffer-review`, `negotiations-quote-waiting`, `negotiations-contract-advanced`, `negotiations-empty-list` | O guarda-chuva permanece em `recommendedJourneyIds`; os específicos cobrem humanização |
| `impact-and-government` | `impact-overview-layperson`, `impact-environmental-estimate`, `impact-detail-estimate-limits`, `impact-public-context-to-validate` | Visão geral vs. indicadores individuais |
| `profile-operational-identity-review` | `profile-edit-basic-fields`, `profile-long-name-header`, `profile-access-status-explained` | Perfil dividido por aspecto |

### Cenários mortos

Nenhum ID removido nesta fase — todos referenciados pelo assistant ou por `tests/unit/shared/ui/mock-qa-scenarios.test.ts`.

### Dívida de i18n (Fase 6)

Títulos, descrições e passos do catálogo estão em **pt-BR hardcoded** no TS. Migrar para next-intl sem quebrar IDs.

### Personas TS

- Campo `suggestedActions` **removido** de `MockQaPersona` (nunca renderizado; tipo `MockQaActionKey` eliminado).

## Como é ativado

- Botão flutuante `M` → painel Mock mode (exceto login/register).
- Troca de dataset: `POST /api/mock-mode` com `{ "scenario": "<id>" }`.
- Login direto QA: `POST /api/mock-mode/login-as` com `{ "userId": "u-..." }`.
- Prefill login: `sessionStorage` + redirect para `/login`.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Catálogo grande desatualizado vs. produto | Fases 6–7; manter auditoria junto a PRs de fluxo |
| Divergência entre `auth.mock.ts`, `users.json`, `MOCK_QA_PERSONAS` | Fase 2 registry único |
| Login exige e-mail + telefone confunde QA | Fase 3–4 copy e fluxo |
| OTP só na API/UI auth, não no menu | Fase 5 |
| Seed só BR com PhoneInput multi-país | Fase 2 personas US/ES |
| Strings hardcoded no catálogo QA | Fase 6 i18n |

## Próximos passos por fase

| Fase | Entrega |
|------|---------|
| 1 | ✅ Docs + remoção `suggestedActions` + inventário partial/duplicados |
| 2 | Registry único; Mariana no hub; alinhar seed |
| 3 | Simplificar UI/copy login |
| 4 | Returning user por telefone |
| 5 | OTP colapsável no menu QA |
| 6 | Menu compacto por abas + i18n catálogo |
| 7 | Cobertura unit/e2e ampliada |

## Documentação relacionada

- [`docs/MOCK-MODE-QA-HUB.md`](../MOCK-MODE-QA-HUB.md)
- [`docs/audits/mock-users-and-permissions.md`](mock-users-and-permissions.md)
- [`docs/MOCK-MODE-USE-CASES.md`](../MOCK-MODE-USE-CASES.md)
- [`docs/business-rules.md`](../business-rules.md)
