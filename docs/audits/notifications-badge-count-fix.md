# Auditoria — badge de notificações e contagem de não lidas

**Data:** 2026-05-10  
**Escopo:** `src/features/notifications/services/notifications.client.ts`, `src/shared/layout/admin-chrome/admin-chrome.tsx`, `src/shared/ui/mock-mode/mock-qa-scenarios.ts`, mensagens e testes de notificação.

## Problema observado

- O sino de notificações e o texto do popover podiam ficar desalinhados quando a UI era comparada com a lista mockada.
- A intenção do produto é contar **não lidas**, não o total bruto da lista.

## Fonte de verdade escolhida

- `notifications` vindas de `readNotifications(userId)`.
- `unreadCount` derivado exclusivamente de `notifications.filter((notification) => !notification.read).length`.

## Regra do badge

- O badge mostra exatamente `unreadCount`.
- Se `unreadCount === 0`, o badge desaparece.
- O badge não usa contador hardcoded nem fonte paralela.

## Regra do texto do popover

- O texto de resumo usa o mesmo `unreadCount` do badge.
- `markAllRead` só aparece quando `unreadCount > 0`.
- Quando não há não lidas, a UI mostra mensagem humanizada de estado zerado.

## Regra de "Marcar todas como lidas"

- A ação atualiza a mesma lista que alimenta badge e popover.
- O estado é persistido por usuário/persona.
- Reset de cenário restaura a contagem inicial esperada.

## Comportamento com zero

- Badge oculto.
- Botão de marcar todas oculto.
- Texto resumido indica ausência de notificações não lidas.

## Arquivos alterados

- `src/features/notifications/services/notifications.client.ts`
- `src/shared/layout/admin-chrome/admin-chrome.tsx`
- `src/shared/ui/mock-mode/mock-qa-scenarios.ts`
- `messages/pt-BR.json`
- `messages/en-US.json`
- `messages/es.json`
- `tests/unit/features/notifications.client.test.ts`
- `tests/unit/shared/ui/mock-qa-scenarios.test.ts`

## Testes criados ou ajustados

- Validação de contagem estável por usuário.
- Validação de zero unread após marcar tudo como lido.
- Validação de snapshot estável do servidor.
- Validação do catálogo de cenários com 0/1/4/5 não lidas.

## Pendências

- Validação visual no navegador do popover em desktop e mobile para confirmar o alinhamento final do badge com a lista.
