Você está no projeto HydriRivers-Dashboard.

Objetivo:
Conectar os novos mocks/domínio hidroviário à lista mobile de cargas, sem quebrar filtros, busca, animação, empty state ou layout.

Atenção sobre rotas:
O projeto usa rotas com locale no App Router. A tela de cargas é `src/app/[locale]/cargas` e as rotas de validação são:
- `/[locale]/cargas`
- `/pt-BR/cargas`
- `/en-US/cargas`
- `/es/cargas`

Não tratar `/cargas` sem locale como rota principal.

Escopo:
- Lista de cargas em operations-board.
- Cards de carga.
- Tipos/adapters necessários para unir carga atual + CargoWaterwayTracking.
- i18n se novos labels aparecerem.

Antes de editar, audite:

grep -RInE "operations-board|filteredCargo|cargoCard|statusFilter|advancedFilters|CargoWaterwayTracking|waterway" src/features src/shared

Não mexer:
- mapa imersivo ainda
- bottom sheet de filtros
- bottom nav
- rotas
- mocks de usuário
- autenticação
- layout desktop, exceto se o card for compartilhado

Regras:
1. Preservar filtros atuais.
2. Preservar busca.
3. Preservar animação da lista.
4. Preservar gap compacto entre cards.
5. Não poluir o card.
6. Não criar status divergentes.
7. Não usar Math.random(), Date.now() ou keys instáveis.
8. Não hardcodar strings novas sem i18n.
9. Respeitar o padrão de rotas com `[locale]`.
10. Se houver links/hrefs novos, preservar locale atual.

Implementação:
- Criar adapter/helper se necessário para enriquecer cada cargo com waterway tracking.
- A lista deve continuar usando cargo.id como key.
- O card pode exibir de forma compacta:
  - corredor
  - risco principal
  - ETA
  - sinal ou progresso
  - documento/prioridade quando aplicável

Não transformar o card em painel gigante.
A leitura mobile precisa continuar rápida.

Empty state:
- Se filtros zerarem a lista, manter empty state humanizado com ação de limpar filtros.
- Se não houver dados sem filtros, mensagem neutra.

Filtros:
- Se novos campos forem adicionados aos filtros, fazer de forma mínima.
- Não quebrar os filtros atuais.
- Não reintroduzir selects/dropdowns no sheet mobile.

Validação visual:
- `/[locale]/cargas`
- `/pt-BR/cargas`
- `/en-US/cargas`
- `/es/cargas`

Checklist:
1. Lista renderiza exemplos variados.
2. Há pelo menos 2 cargas por status real.
3. Cards mostram contexto hidroviário sem poluir.
4. Busca funciona.
5. Filtros funcionam.
6. Empty state funciona.
7. Animação da lista continua perceptível.
8. Gap entre cards continua compacto.
9. Desktop não regressa.
10. Rotas continuam usando `[locale]`.

Comandos:

npm run lint
npm run typecheck
npm run check:i18n
npm run build
npm test
npm run test:mock-mode

Ao finalizar, responder:
1. Arquivos alterados.
2. Como a lista consome o domínio hidroviário.
3. Quais dados aparecem no card.
4. Como filtros/busca foram preservados.
5. Como as rotas com `[locale]` foram preservadas.
6. Resultado dos comandos.
