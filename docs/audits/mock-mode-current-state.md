# Auditoria de estado atual — Mock Mode / QA Assistant

## Onde vive hoje

O Mock Mode vive principalmente em `src/shared/ui/mock-mode/` e usa a camada de dados/suporte em `src/shared/server/`, `src/shared/qa/` e `src/shared/config/`.

### Arquivos centrais

- `src/shared/ui/mock-mode/mock-mode.tsx`
- `src/shared/ui/mock-mode/mock-scenario-control.tsx`
- `src/shared/ui/mock-mode/mock-qa-hub.tsx`
- `src/shared/ui/mock-mode/mock-qa-assistant.tsx`
- `src/shared/ui/mock-mode/mock-qa-scenarios.ts`
- `src/shared/server/mock-scenarios.ts`
- `src/shared/server/mock-db.ts`
- `src/app/api/mock-mode/route.ts`
- `src/app/api/mock-mode/login-as/route.ts`
- `src/shared/qa/mock-qa-personas.ts`
- `src/shared/qa/mock-qa-ui-env.ts`

## Como é ativado

- O botão flutuante `M` abre o painel `Mock mode`.
- O painel é exibido fora de production quando `HYDRORIVERS_FORCE_MOCK_QA_UI=true` ou quando a lógica atual de ambiente permite.
- A troca de dataset é feita por `POST /api/mock-mode`.
- O login direto de QA é feito por `POST /api/mock-mode/login-as`.
- O pré-preenchimento do formulário de login usa `sessionStorage` via `QA_LOGIN_PREFILL_STORAGE_KEY`.

## O que cobre

- Cenários de auth e onboarding com personas demo.
- Troca de dataset mock por cenário global.
- Rota administrativa para reset de cenário.
- Acesso direto por persona demo.
- Um catálogo de QA Assistant com cenários de produto, rota inicial, passos e resultado esperado.

## Fluxos cobertos

- Auth/login/cadastro/OTP.
- Dashboard.
- Cargas públicas e minhas cargas.
- Rastreio/mapa.
- Negociações.
- Embarcações.
- Impacto e governo.
- Mobile overlays, bottom sheets, tema e i18n.

## Limitações

- Os cenários de QA Assistant são guiados por catálogo e não substituem um E2E completo em navegador real.
- O reset de dataset depende de sessão admin e da flag `HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true`.
- O login direto de QA permanece restrito ao fluxo de mock / CI.
- Alguns fluxos ainda dependem de estados locais do app, como notificações lidas/não lidas e interação manual em mobile.

## Riscos

- O painel pode virar apenas uma lista bonita se o catálogo não for mantido junto com os fluxos reais.
- A camada de mock pode divergir da regra de negócio real se datasets e testes não forem atualizados em conjunto.
- Persistência local em browser precisa continuar isolada por usuário para evitar hidratação inconsistente.

## Oportunidades

- Expandir o catálogo para novos fluxos assim que novas rotas surgirem.
- Reaproveitar o QA Assistant como base para smoke tests guiados por navegador.
- Integrar o catálogo com um modo de “copiar passos + abrir rota” mais avançado no futuro.

