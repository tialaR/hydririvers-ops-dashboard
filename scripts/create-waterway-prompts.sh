#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
PROMPTS_DIR="$ROOT_DIR/docs/codex-prompts"
AUDIT_SCRIPT="$ROOT_DIR/scripts/audit-waterway-flow.sh"

mkdir -p "$PROMPTS_DIR"
mkdir -p "$ROOT_DIR/scripts"

cat > "$PROMPTS_DIR/01-connect-waterway-domain-to-cargo-list.md" <<'EOF'
Você está no projeto HydriRivers-Dashboard.

Objetivo:
Conectar os novos mocks/domínio hidroviário à lista mobile de cargas, sem quebrar filtros, busca, animação, 
empty state ou layout.

Escopo:
- Lista de cargas em operations-board.
- Cards de carga.
- Tipos/adapters necessários para unir carga atual + CargoWaterwayTracking.
- i18n se novos labels aparecerem.

Antes de editar, audite:

grep -RInE 
"operations-board|filteredCargo|cargoCard|statusFilter|advancedFilters|CargoWaterwayTracking|waterway" 
src/features src/shared

Não mexer:
- mapa imersivo ainda
- bottom sheet de filtros
- bottom nav
- rotas
- mocks de usuário
- autenticação
- layout desktop, exceto se o card for compartilhado

Regras:
1. Preservar filtros reservar busca.
3. Preservar animação da lista.
4. Preservar gap compacto entre cards.
5. Não poluir o card.
6. Não criar status divergentes.
7. Não usar Math.random(), Date.now() ou keys instáveis.
8. Não hardcodar strings novas sem i18n.

Implementação:
- Criar adapter/helper se necessário para enriquecer cada cargo com waterway tracking.
- A lisntinuar usando cargo.id como key.
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
- Não quebrltros atuais.
- Não reintroduzir selects/dropdowns no sheet mobile.

Validação visual:
- /pt-BR/cargas
- /en-US/cargas
- /es/cargas

Checklist:
1. Lista renderiza exemplos variados.
2. Há pelo menos 2 cargas por status real.
3. Cards mostram contexto hidroviário sem poluir.
4. Busca funciona.
5. Filtros funcionam.
6. Empty state funciona.
7. Animação da lista continua percept. Gap entre cards continua compacto.
9. Desktop não regressa.

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
5. Resultado dos comandos.
EOF

cat > "$PROMPTS_DIR/02-connect-selected-cargo-to-immersive-.md" <<'EOF'
Você está no projeto HydriRivers-Dashboard.

Objetivo:
Conectar a carga selecionada na lista ao mapa imersivo, usando o domínio hidroviário criado.

Escopo:
- operations-board
- componente do mapa imersivo
- action sheet/detalhe da carga, se já existir
- adapters entre cargo e tracking
- i18n se necessário

Antes dar, audite:

grep -RInE "immersive|map|selectedCargo|selected|cargo-action-sheet|Visão 
geral|Jornada|Documentos|Custos|Prioridade|CargoWaterwayTracking|waterway" src

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
5. Não quebrar seleção atual  Não quebrar action sheet existente.
7. Não poluir a UI.

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
s desejadas:
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
- /pt-BR/cargas
- /en-US/cargas
- /es/cargas

Comandos:

npm run lint
npm run typecheck
npm run check:i18n
npm run build
npm test
npm run test:mock-mode

Ao finalizar, responder:
1. Arquivos alterados.
2. Como a carga selecionada chega ao mahidroviários aparecem no mapa.
4. Como as camadas foram conectadas.
5. Resultado dos comandos.
EOF

cat > "$PROMPTS_DIR/03-final-waterway-audit-before-pr.md" <<'EOF'
Você está no projeto HydriRivers-Dashboard.

Objetivo:
Auditar a entrega completa de domínio hidroviário + lista de cargas + mapa imersivo antes de PR.

Não implemente feature nova.
Apenas corrija problemas pequenos encontrados na auditoria.

Auditar:
- tipos
- mocks
- lista de cargas
- filtros
- busca
- empty state
- mapa imersivo
- action sheet
- i18n
- acessibilidade
- responsividade
- animações
- testes

Rode buscas:

grep -RInE "Math.random|Date.now|getRandom|TODO|FIXME|hardcoded|waterway|CargoWaterwayTracking|HydroRoute" src

Checklist:
1. Não há Math.random/Date.now em render.
2. Não há dados reais.
3. Há pelo menos 2 etatus/cenário real.
4. Lista mostra as cargas corretamente.
5. Filtros continuam funcionando.
6. Busca continua funcionando.
7. Empty state funciona.
8. Selecionar carga altera mapa.
9. Mapa exibe corredor, origem, destino, embarcação, progresso, ETA, risco e documentos.
10. Camadas não piscam.
11. i18n alinhado nos três idiomas.
12. Mobile não regressiu.
13. Desktop não regressiu.

Comandos obrigatórios:

npm run lint
npm run typecheck
npm run check:i18n
npm run build
npm test
npm run test:mock-mode

Se houver falha, corrigir apenas dentro do escopo.
Não atoração grande.

Ao finalizar, responder:
1. Problemas encontrados.
2. Problemas corrigidos.
3. Confirmação dos 2 exemplos por status.
4. Resultado dos comandos.
5. Sugestão de título de PR.
6. Sugestão de descrição de PR.
EOF

cat > "$PROMPTS_DIR/README.md" <<'EOF'
# Prompts — HydriRivers waterway + immersive map

Ordem recomendada:

1. `01-connect-waterway-domain-to-cargo-list.md`
2. `02-connect-selected-cargo-to-immersive-map.md`
3. `03-final-waterway-audit-before-pr.md`

Uso sugerido:

```bash
cat docs/codex-prompts/01-connect-waterway-domain-to-cargo-list.md
cat docs/codex-prompts/02-connect-selected-cargo-to-immersive-map.md
cat docs/codex-prompts/03-final-waterway-audit-before-pr.md
