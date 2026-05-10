# Auditoria de correção de UI: card, filtros e notificações

## Problemas identificados

- o card de previsão de atracação juntava data, horário e local em um bloco que podia sobrepor conteúdo em telas menores;
- o painel de filtros estava visualmente pesado, com título grande demais, pouco respiro e botão de limpar com força visual excessiva;
- o badge de notificações dependia de um seed fixo e não representava melhor o estado por usuário;
- a ação de marcar todas como lidas existia, mas precisava estar amarrada a uma lista inicial estável por usuário e com feedback real no badge.

## Componentes alterados

- `src/features/dashboard/components/operations-board/operations-board.tsx`;
- `src/app/globals.scss`;
- `src/features/notifications/services/notifications.client.ts`;
- `tests/unit/features/notifications.client.test.ts`.

## Solução aplicada no card de previsão

- a previsão de atracação passou a separar data e horário em blocos distintos;
- o layout agora permite quebra vertical sem esconder conteúdo;
- o horário virou um chip discreto, com hierarquia visual mais clara;
- o card lateral e o rail card usam o mesmo parsing de timestamp para evitar inconsistência.

## Solução aplicada no painel de filtros

- o título principal ficou menor e mais leve;
- o header ganhou mais respiro entre label, título e contador;
- o contador e os selects mantêm legibilidade sem parecer uma tela “pesada”;
- o botão de limpar filtros foi reduzido para um estilo mais sutil e responsivo;
- no mobile, o botão ocupa largura total quando isso melhora a usabilidade.

## Solução aplicada em notificações

- a lista inicial agora é gerada de forma determinística por usuário;
- cada usuário recebe um seed estável com IDs, ordem e timestamps consistentes;
- a leitura e persistência continuam por usuário via `localStorage`;
- a ação “Marcar todas como lidas” atualiza a lista, o estado persistido e o badge.

## Regra do badge

- o badge mostra a contagem real de notificações com `read: false`;
- se todas estiverem lidas, o badge some;
- o valor não é mais fixo nem desconectado da lista atual.

## Regra de geração fake por usuário

- a lista inicial usa um seed derivado do `userId`;
- o seed define ordem e metadados sem usar `Math.random` no render;
- a mesma pessoa sempre recebe a mesma lista inicial;
- usuários diferentes podem receber listas iniciais diferentes.

## Regra de marcar todas como lidas

- a ação atualiza todos os itens para `read: true`;
- o badge reage imediatamente;
- a persistência por usuário é mantida em `localStorage`;
- a ação fica desabilitada quando não há pendências.

## Arquivos alterados

- `src/features/dashboard/components/operations-board/operations-board.tsx`
- `src/app/globals.scss`
- `src/features/notifications/services/notifications.client.ts`
- `tests/unit/features/notifications.client.test.ts`

## Comandos executados

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

## Resultados

- `typecheck`: passou.
- `lint`: passou.
- `test`: passou, com `34` arquivos e `215` testes.
- `build`: travou em `Creating an optimized production build ...`; o processo `node /Users/tialarocha/Desktop/hydrorivers-dashboard-v27-sidebar-controls/node_modules/.bin/next build` ficou com PID `72586` e foi encerrado manualmente.

## Pendências

- validar o layout no navegador real para confirmar o comportamento visual do card de atracação e do painel de filtros;
- confirmar que o build continua saudável no ambiente local;
- se desejado, adicionar testes visuais futuros para o painel de filtros e o card de atracação.
