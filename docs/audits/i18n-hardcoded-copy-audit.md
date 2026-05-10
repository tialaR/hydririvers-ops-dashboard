# Auditoria de textos hardcoded e copy multilíngue — HydroRivers

## Strings encontradas

- Textos de negociação ainda emitidos como valores literais em mocks e persistência:
  - `A combinar`
  - `A validar`
  - `Embarcador`
  - `Proposta criada`
  - `Status atualizado para pending`
  - `Status atualizado para accepted`
  - `Status atualizado para rejected`
  - `Status atualizado para cancelled`
  - `Alteração realizada por HydroRivers.`
- Textos já cobertos por `translateMock`, mas auditados como origem de conteúdo operacional:
  - descrições de documentos na carga
  - estados de embarque e propostas
  - nomes e rótulos de cargas mockadas

## Strings migradas

- Adicionados mapeamentos multilíngues em `src/shared/i18n/mock-content.ts` para:
  - `A combinar`
  - `A validar`
  - `Embarcador`
  - `Proposta criada`
  - `Status atualizado para pending`
  - `Status atualizado para accepted`
  - `Status atualizado para rejected`
  - `Status atualizado para cancelled`
  - `Alteração realizada por HydroRivers.`
- Mantida a tradução existente dos textos operacionais de documentos e cargas que já estavam cobertos.
- Adicionado teste para garantir que os novos textos continuam traduzindo para `en-US` e `es`.

## Lacunas restantes

- Algumas mensagens de histórico de negociação são montadas dinamicamente no backend com nome da empresa do usuário. Elas continuam legadas por dependerem do contexto operacional do servidor.
- Strings muito técnicas de API e erros internos permanecem fora do i18n porque não chegam diretamente ao usuário.
- Há ainda alguns textos técnicos/legados em testes e shims que não fazem parte da experiência de tela.

## Comandos executados

- `npm run check:i18n`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `ps -Ao pid,command | rg "next build|Creating an optimized production build|turbopack|webpack"`
- `kill 68387`

## Resultados

- `check:i18n`: passou, `1230` chaves alinhadas em `pt-BR`, `en-US`, `es`.
- `typecheck`: passou.
- `lint`: passou.
- `npm test`: passou, `33` arquivos e `212` testes.
- `build`: travou em `Creating an optimized production build ...`; o processo `node /Users/tialarocha/Desktop/hydrorivers-dashboard-v27-sidebar-controls/node_modules/.bin/next build` foi identificado com PID `68387` e encerrado manualmente.

## Arquivos alterados

- `src/shared/i18n/mock-content.ts`
- `tests/unit/shared/i18n/mock-content.test.ts`
- `docs/audits/i18n-hardcoded-copy-audit.md`

