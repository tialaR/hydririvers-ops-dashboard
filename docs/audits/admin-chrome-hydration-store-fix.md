# Auditoria de correção — AdminChrome, hydration e store de notificações

## Causa raiz do `getServerSnapshot`

- `useSyncExternalStore` em `src/shared/layout/admin-chrome/admin-chrome.tsx` usava `() => []` como `getServerSnapshot`.
- Isso criava uma nova referência em cada chamada e quebrava a expectativa de snapshot cacheado.
- Além disso, o snapshot de notificações podia disparar geração/leitura com efeitos colaterais quando a sessão do usuário ainda não estava estável.

## Causa raiz do hydration mismatch da sidebar

- `useAuthSession()` iniciava com `getCachedUser()` durante o primeiro render do cliente.
- No SSR, a árvore era renderizada sem depender de `localStorage`.
- No primeiro render do cliente, a sessão já podia existir localmente, mudando a filtragem da navegação antes da hidratação concluir.
- Isso alterava a sidebar entre servidor e cliente: por exemplo, `Embarcações` no SSR e `Minhas cargas` no cliente.

## Causa raiz do `Maximum update depth exceeded`

- A store de notificações retornava um novo array a cada snapshot.
- A leitura de notificações podia criar estado e persistência no caminho do snapshot.
- Isso fazia o `useSyncExternalStore` entender que havia mudança constante e re-renderizar em loop.

## Arquivos alterados

- `src/shared/layout/admin-chrome/admin-chrome.tsx`
- `src/features/auth/hooks/use-auth-session.ts`
- `src/features/notifications/services/notifications.client.ts`
- `tests/unit/features/notifications.client.test.ts`
- `tests/unit/shared/config/navigation.test.ts`

## Solução aplicada

- `useAuthSession()` passou a iniciar com `user = null` e só hidratar a sessão após o mount. O cache local só entra como fallback se a requisição falhar por erro de rede, não quando o servidor responde `401`.
- `AdminChrome` agora usa `emptyNotificationsSnapshot` como snapshot inicial estável.
- O `getServerSnapshot` passou a usar `getNotificationsServerSnapshot()`, que retorna a mesma referência congelada.
- A store de notificações ganhou cache por usuário, evitando recriação de array em toda leitura.
- `persistNotifications`, `markAllNotificationsRead` e `resetNotifications` atualizam o cache de forma previsível.
- A navegação canônica foi coberta por teste para garantir que `Cargas`, `Minhas cargas` e `Embarcações` mantêm paths e ordem estáveis.

## Como a sidebar ficou estável entre SSR e client

- A primeira renderização do cliente agora começa com a mesma estrutura do SSR.
- Diferenças de sessão e notificações aparecem só depois que o componente monta.
- Isso elimina a troca de item visual durante a hidratação.

## Como as notificações ficaram estáveis

- O badge passa a usar snapshot cacheado por usuário.
- O snapshot do servidor é constante e vazio.
- A geração fake por usuário continua determinística, mas não recria arrays em todo render.
- `markAllAsRead` continua funcionando e atualiza a contagem imediatamente.

## Testes criados ou alterados

- `tests/unit/features/notifications.client.test.ts`
- `tests/unit/shared/config/navigation.test.ts`

## Comandos executados

- `npm run test:mock-mode`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run check:i18n`
- `npm run build`
- `ps -Ao pid,command | rg "next build|Creating an optimized production build|turbopack|webpack"` com `require_escalated`
- `kill 76192`

## Resultados

- `test:mock-mode` passou.
- `typecheck` passou.
- `lint` passou.
- `check:i18n` passou com 1263 chaves alinhadas em pt-BR, en-US e es.
- `npm test` passou.
- `build` travou em `Creating an optimized production build ...`; o processo `next build` ficou com PID `76192` e foi encerrado manualmente.

## Pendências

- Validação visual em navegador real para confirmar que a hidratação não troca a sidebar e que o badge de notificações permanece coerente em runtime.
- O `build` segue apresentando o travamento recorrente do ambiente.
