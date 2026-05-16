Você está no projeto HydriRivers-Dashboard.

Objetivo:
Conectar a carga selecionada na lista ao mapa imersivo, usando o domínio hidroviário criado.

Atenção sobre rotas:
O projeto usa rotas com locale no App Router. A tela de cargas é `src/app/[locale]/cargas` e as rotas de validação são:
- `/[locale]/cargas`
- `/pt-BR/cargas`
- `/en-US/cargas`
- `/es/cargas`

Não criar navegação para `/cargas` sem locale.
Se algum link/href for alterado, ele deve preservar o locale atual.

Escopo:
- operations-board
- componente do mapa imersivo
- action sheet/detalhe da carga, se já existir
- adapters entre cargo e tracking
- i18n se necessário

Antes de editar, audite:

grep -RInE "immersive|map|selectedCargo|selected|cargo-action-sheet|Visão geral|Jornada|Documentos|Custos|Prioridade|CargoWaterwayTracking|waterway" src

Não mexer:
- filtros
- bottom nav
- autenticação
- rotas
- mocks de usuário
- fluxo de nova carga
- desktop fora do necessário

Regras:
1. Selecionar uma carga deve alterar o contexto do mapa.
2. O mapa deve receber dados da carga selecionada.
3. Não usar dados aleatórios.
4. Não usar Math.random() ou Date.now().
5. Não quebrar seleção atual de carga.
6. Não quebrar action sheet existente.
7. Não poluir a UI.
8. Não criar rota sem `[locale]`.
9. Se abrir mapa por rota ou href, preservar locale.

O mapa imersivo deve refletir:
- corredor
- trecho navegável
- origem
- destino
- embarcação
- progresso
- ETA
- sinal
- risco principal
- documentos
- custos/impacto quando disponível

Se o mapa ainda for majoritariamente visual/mock:
- conectar pelo menos textos, badges, percentuais e estados visuais.
- A carga selecionada precisa parecer diferente conforme o cenário.

Camadas desejadas:
- Visão geral: rota, origem, embarcação, destino, progresso.
- Hidrovia: corredor, rios principais, trecho navegável.
- Operação: ETA, sinal, status, telemetria mockada.
- Risco: seca, calado, dragagem, restrição, gargalo.
- Documentos: pendências, liberação, compliance.
- Custos/impacto: custo estimado, economia, CO₂ evitado.

Validação:
- Selecionar cargas de status/cenários diferentes.
- Confirmar que mapa muda em cada seleção.
- Confirmar que action sheet mostra dados coerentes.
- Confirmar que não há flicker.

Rotas:
- `/[locale]/cargas`
- `/pt-BR/cargas`
- `/en-US/cargas`
- `/es/cargas`

Comandos:

npm run lint
npm run typecheck
npm run check:i18n
npm run build
npm test
npm run test:mock-mode

Ao finalizar, responder:
1. Arquivos alterados.
2. Como a carga selecionada chega ao mapa.
3. Quais campos hidroviários aparecem no mapa.
4. Como as camadas foram conectadas.
5. Como as rotas com `[locale]` foram preservadas.
6. Resultado dos comandos.
