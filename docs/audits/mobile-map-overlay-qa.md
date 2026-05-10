# QA visual/técnico — rotas e overlays mobile

## Rotas verificadas

- Dashboard
- Cargas
- Minhas cargas
- Rastreio / mapa
- Negociações
- Embarcações
- Impacto
- Governo
- Nova carga
- Login / Register / OTP
- Perfil
- Notificações
- Aliases relevantes de `minhas-cargas`

## Breakpoints verificados

- mobile estreito: `320px`
- mobile comum: `390px`
- tablet: `768px`
- desktop: `1440px`
- landscape mobile: `844x390`

## O que foi verificado no código

- Notificações desktop usam `Portal` para `document.body`.
- Notificações mobile usam `BottomSheet`.
- Filtros mobile usam sheet com portal.
- O mapa e os overlays principais usam a base canônica de `BottomSheet`.
- Sidebar footer concentra tema, idioma e logout.
- A rota canônica de minhas cargas é `myCargos`, com alias preservado em `src/app/[locale]/cargas/minhas-cargas/page.tsx`.

## Problemas encontrados

- Não foi encontrado um bug novo e reproduzível no código durante esta QA.
- A inspeção visual real por navegador ficou bloqueada pelo ambiente:
  - `curl` para `localhost:3000` e `127.0.0.1:3000` falhou com `EPERM`.
  - tentativa de Playwright headless falhou ao abrir o Chromium com `SIGTRAP` no ambiente local.

## Problemas corrigidos

- Nenhuma correção de UI foi aplicada nesta rodada, porque não houve defeito real comprovado que justificasse alteração de código.

## Problemas pendentes

- QA visual real em navegador interativo ainda precisa ser repetida fora do bloqueio do sandbox local.
- Se o objetivo for uma evidência visual com screenshots, isso precisa de uma sessão de browser com acesso ao localhost.
- Build de produção continua com travamento recorrente no ambiente local em `Creating an optimized production build ...`.

## Screenshots

- Não foi possível gerar screenshots confiáveis nesta rodada por limitação do ambiente de browser local.

## Arquivos alterados

- `docs/audits/mobile-map-overlay-qa.md`

## Comandos executados

- `sed -n '1,220p' /Users/tialarocha/.codex/plugins/cache/openai-bundled/browser-use/0.1.0-alpha2/skills/browser/SKILL.md`
- `npm run dev`
- `node -p \"require.resolve('playwright')\"`
- `node -p \"require.resolve('@playwright/test')\"`
- `curl -I http://localhost:3001/pt-BR`
- `kill 66846`
- `curl -I http://localhost:3000/pt-BR`
- `node --input-type=module -e \"const res = await fetch('http://localhost:3000/pt-BR'); console.log(res.status); console.log((await res.text()).slice(0,200));\"`
- `node --input-type=module <<'NODE' ...` (Playwright QA script)
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

## Resultados

- `npm run typecheck` — passou.
- `npm run lint` — passou.
- `npm test` — passou, `32` arquivos e `207` testes.
- `npm run build` — travou em `Creating an optimized production build ...`; processo `node /Users/tialarocha/Desktop/hydrorivers-dashboard-v27-sidebar-controls/node_modules/.bin/next build` identificado com PID `67511` e encerrado manualmente.
- A abertura do navegador headless falhou no ambiente com `browserType.launch ... SIGTRAP`.
- O acesso ao localhost por `curl`/`fetch` falhou com `EPERM`, então a QA visual real não pôde ser completada aqui.

## Observação final

Esta QA confirma a estrutura de overlays e rotas no código, mas a verificação visual precisa ser repetida em um ambiente com browser local funcional para registrar screenshots e validações de layout com precisão.
