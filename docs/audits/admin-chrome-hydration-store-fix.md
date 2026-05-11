# Auditoria — AdminChrome, hidratação da sidebar e store de notificações

## Causa raiz do hydration mismatch na sidebar

- A lista da sidebar em `AdminChrome` filtrava itens com base em `user` vindo de `useAuthSession()`.
- No SSR, `useAuthSession` inicia com `user = null` e `ready = false` (estado inicial de `useState`).
- No primeiro render do cliente, **antes** da correção, qualquer valor de `user` disponível antes de `ready === true` (por exemplo resposta antecipada de cache ou timing de efeito) podia divergir do SSR.
- O caso mais visível: **visitante** (`user === null`) mantém **Embarcações** (`/embarcacoes`) e oculta **Minhas cargas**; **shipper** autenticado inverte (mostra Minhas cargas, oculta Embarcações). A troca na mesma posição da lista gera mismatch de `href`, `aria-label`, `title` e ícone entre HTML do servidor e a árvore hidratada no cliente.

## Causa raiz de `getServerSnapshot` / loops

- O React 19 exige que `getServerSnapshot` devolva **a mesma referência** quando o estado lógico não muda; o projeto já usa `EMPTY_NOTIFICATIONS_SNAPSHOT` congelado e `getNotificationsServerSnapshot()` estável.
- O `getSnapshot` do `useSyncExternalStore` dependia de `authReady` e `user`; alinhar leitura de notificações ao mesmo `navigationUser` usado na sidebar evita leitura com identidade de usuário inconsistente entre subsistemas.
- `readNotifications` já cacheia por `userId` e não dispara evento só na leitura; `markAllNotificationsRead` persiste e notifica uma vez.

## Causa secundária — tempo relativo nas notificações

- `formatNotificationTime` usava `Date.now()` durante o render (instável e proibido pelas regras do projeto). Passou a usar apenas **`Intl.DateTimeFormat`** com data/hora absoluta derivada de `createdAt`, idêntica no servidor e no cliente para o mesmo `locale`.

## Arquivos alterados

- `src/shared/config/navigation.ts` — `filterMainNavigationForUser`, comentários em `resolveActiveNavigationHref`.
- `src/shared/layout/admin-chrome/admin-chrome.tsx` — `navigationUser`, relógio das notificações, store alinhada, labels de sessão na chrome alinhadas ao mesmo usuário efetivo.
- `src/shared/layout/app-header/app-header.tsx` — `navigationUser = ready ? user : null` na filtragem de “Minhas cargas”.
- `tests/unit/shared/config/navigation.test.ts` — filtros por papel, rotas ativas em `/embarcacoes`.
- `docs/audits/admin-chrome-hydration-store-fix.md` — este documento.

## Como a sidebar ficou estável

- Enquanto `authReady === false`, `navigationUser` é forçado a `null`, reproduzindo a mesma regra de filtro do visitante usada no SSR.
- Após o efeito em `useAuthSession` marcar `ready === true`, a lista passa a refletir o papel real (`shipper` / `carrier` / `admin`), **só depois** da hidratação do primeiro frame estável.

## Como os snapshots de notificações ficaram estáveis

- `getServerSnapshot`: continua retornando `EMPTY_NOTIFICATIONS_SNAPSHOT` (referência única).
- `getSnapshot` com `!authReady`: mesmo array vazio congelado.
- `getSnapshot` com `authReady`: `readNotifications(navigationUser?.id)` usa cache por chave; sem mudança de dados, mesma referência.

## Testes criados ou ajustados

- `tests/unit/shared/config/navigation.test.ts` — `filterMainNavigationForUser` (visitante, shipper, carrier, admin), `resolveActiveNavigationHref` para `/embarcacoes`.
- `tests/unit/features/notifications.client.test.ts` — sem alteração funcional neste ciclo (mantém cobertura de snapshot estável existente).

## Comandos executados

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm test`
- `npm run build`

## Resultados (execução local)

- `npm run typecheck` — passou.
- `npm run lint` — passou.
- `npm run check:i18n` — passou (`1279` chaves alinhadas em pt-BR, en-US, es).
- `npm test` — passou (`38` arquivos, `231` testes).
- `npm run build` — passou (Next.js 16.2.4 / Turbopack).

## Pendências

- Smoke manual: abrir `/pt-BR/dashboard` (ou rota autenticada) e confirmar ausência de aviso de hidratação no console.
- Se no futuro a sessão for injetada no servidor (cookies → props), alinhar o “usuário efetivo” da sidebar ao mesmo contrato (`null` até haver dado de servidor estável).
