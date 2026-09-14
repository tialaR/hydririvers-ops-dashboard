# HYDRORIVERS — Contract Minhas Cargas Diamond v1.3

Status: **ACTIVE / GOVERNING**

Escopo deste adendo determinístico: **Page 61 / node `219:254` / 1440×1024 / dark / shipper**

Fonte congelada: `figma-freeze/page-61/m01-desktop-foundation-parity-review.png`

SHA-256 da fonte: `066177797caac3f5349f6a2d9c3f154c82e7bd4e315413dc669e50b09d772066`

## Regra de ownership

Para `219:254`, a hierarquia abaixo governa a composição. Nenhum executor deve inferir uma hierarquia alternativa, promover proximidade visual ou deslocar responsabilidades entre owners sem atualizar este contrato e o freeze. Dados de apresentação exclusivos do frame devem permanecer na fixture visual `page-61-219-254.visual-fixture.ts`; domínio e jornada reais continuam sendo os owners dos fatos operacionais.

Estados de owner: `PRESERVAR`, `REFATORAR`, `SUBSTITUIR`, `AUSENTE`.

## Mapping Figma → runtime owners

| Figma region/layer | Responsabilidade visual determinística | Owner runtime atual | Estado | Divergência estrutural observada | Ação necessária |
|---|---|---|---|---|---|
| Shell / sidebar esquerda | Coluna fixa de 272 px; marca; ação primária; grupos Operações/Análise; carteira privada; identidade no rodapé | `OwnedCargoDesktopFoundation` → `aside.sidebar`, `brand`, `primary`, `nav`, `wallet`, `user`; estilos em `owned-cargo-desktop-foundation.module.sass` | `PRESERVAR` | Hierarquia, largura e ancoragem correspondem ao frame congelado; não é owner do desvio restante | Não alterar nesta recuperação; aceitar mudanças apenas se novo freeze provar alteração |
| Master / lista | Região fixa entre sidebar e detail; título, contagem/atenção, tabs de status, busca, alerta e lista rolável | `OwnedCargoDesktopFoundation` → `section.master`, `masterTitle`, `filters`, `search`, `masterAlert`, `list` | `PRESERVAR` | Divisão master/detail e ordem dos controles já estão alinhadas; lista apenas hospeda o card | Preservar container e comportamento de busca/filtro/seleção; mudar somente o filho Shipment Card |
| Shipment Card | Card vertical: linha `#código + status`; linha de rota com bandeira/origem → eixo/embarcação → destino/bandeira; divisor pontilhado; rodapé `Carga + ETA`; estado selecionado na borda esquerda | Markup inline do `visible.map(...)` dentro de `OwnedCargoDesktopFoundation`; classes `card`, `cardTop`, `route`, `fixtureCardFacts` | `SUBSTITUIR` | Um loop de tela acumula conteúdo, estado e composição; não existe owner visual isolado capaz de garantir a árvore canônica do card; flags CSS e âncora textual não equivalem às camadas do frame | Extrair `OwnedCargoShipmentCard` com slots fixos `identity/status`, `route/origin`, `route/transit-axis`, `route/destination`, `cargo-summary`, `eta`; manter seleção/filtro no pai e receber somente props derivadas/fixture |
| Mapa / controles | Região cartográfica superior do detail; base escura, corredor/rota, marcadores, labels, sinal vivo, risco e controles verticais | `ShipperOperationMap` + `owned-cargo-operation-map.module.sass`; overlays `mapLabel`, `eta`, `signal`, `mapControls` pertencem a `OwnedCargoDesktopFoundation` | `PRESERVAR` | Owner cartográfico e overlays são identificáveis e não pertencem ao blocker isolado desta auditoria | Preservar MapLibre/fallback, rota e overlays; nenhuma mudança na próxima implementação desta correção |
| Detail header / tabs | Barra imediatamente abaixo do mapa; cinco destinos no Figma: Overview, Rota, Carga, Documentos, Atividade; indicador ativo em Overview | `OwnedCargoDesktopFoundation` → `div.tabs` | `REFATORAR` | Runtime possui quatro destinos e semântica divergente (`Jornada`, `Documentos`, `Custos`); a árvore não representa as cinco regiões do contrato | Criar configuração local explícita dos cinco tabs canônicos, ligando apenas rotas reais existentes; estado indisponível deve ser explícito, nunca link inventado |
| Cargo details | Cabeçalho do cargo selecionado; status/progresso/ETA; transportador + ação; seção `Detalhes da carga` com quatro colunas: carga, peso total, embarcação, status | `OwnedCargoDesktopFoundation` → `title`, `fixtureCarrier`, `grid`; fixture `page61219254SelectedVisualFacts` | `SUBSTITUIR` | Cabeçalho não possui faixa canônica status/progresso/ETA; transportador e detalhes foram modelados como blocos genéricos de três colunas; falta a quarta coluna canônica | Extrair `OwnedCargoDetailSummary` com regiões fixas `identity`, `operation-state`, `carrier-actions`, `cargo-facts[4]`; consumir `OwnedCargo` e fixture visual sem criar fatos de produção |
| Operational strip / metrics | Faixa única contornada com três métricas: Sinal, Rio e Próximo marco; separadores verticais; valores e metadados subordinados | `OwnedCargoDesktopFoundation` → `facts` | `REFATORAR` | Conteúdo está presente, mas o posicionamento depende de margens compensatórias e do fluxo dos blocos divergentes anteriores | Manter dados e semântica; mover para dentro do owner do painel inferior e fazer o grid seguir diretamente `cargo-details`, sem offsets compensatórios |
| Attention / action panel | Painel inferior âmbar em largura total: eyebrow, mensagem principal, explicação, chips/contexto e CTA à direita | `OwnedCargoDesktopFoundation` → `alert` | `SUBSTITUIR` | Runtime usa uma linha icon/texto/link; faltam hierarquia interna, chips e região de ação conforme o frame; margem artificial tenta posicioná-lo | Criar `OwnedCargoAttentionPanel` com regiões fixas `eyebrow`, `message`, `supporting-copy`, `context-chips`, `primary-action`; exibir apenas fatos possuídos pelo domínio ou pela fixture visual identificada |

## Árvore composicional obrigatória

```text
OwnedCargoDesktopFoundation
├── sidebar                                      [PRESERVAR]
├── header                                       [PRESERVAR]
├── master                                       [PRESERVAR]
│   ├── master-controls                          [PRESERVAR]
│   └── shipment-list
│       └── OwnedCargoShipmentCard[]              [SUBSTITUIR]
└── detail
    ├── operational-map                          [PRESERVAR]
    │   ├── ShipperOperationMap
    │   └── map-overlays-and-controls
    ├── OwnedCargoDetailTabs                     [REFATORAR]
    └── OwnedCargoDetailSummary                  [SUBSTITUIR]
        ├── identity-and-operation-state
        ├── carrier-and-actions
        ├── cargo-details-four-column-grid
        ├── operational-strip                    [REFATORAR]
        └── OwnedCargoAttentionPanel             [SUBSTITUIR]
```

## Owners ausentes

Não há região visual totalmente ausente no nível macro. Estão ausentes como **owners independentes e determinísticos**:

1. `OwnedCargoShipmentCard`;
2. `OwnedCargoDetailTabs`;
3. `OwnedCargoDetailSummary`;
4. `OwnedCargoAttentionPanel`.

`AUSENTE` aqui não autoriza inventar domínio: autoriza somente criar fronteiras visuais com props derivadas dos owners de dados existentes.

## Menor change set autorizado para a próxima implementação

1. `src/features/cargo/owned/screens/owned-cargo-desktop-foundation.tsx` — reduzir ao compositor e conectar os novos owners visuais.
2. `src/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass` — manter shell/master/map e substituir somente regras dos blocos classificados `SUBSTITUIR`/`REFATORAR`.
3. `src/features/cargo/owned/components/owned-cargo-shipment-card.tsx` — novo owner visual do card.
4. `src/features/cargo/owned/components/owned-cargo-detail-tabs.tsx` — novo owner dos tabs canônicos.
5. `src/features/cargo/owned/components/owned-cargo-detail-summary.tsx` — novo owner das regiões inferiores.
6. `src/features/cargo/owned/components/owned-cargo-attention-panel.tsx` — novo owner do painel de atenção/ação.

A fixture `src/features/cargo/owned/fixtures/page-61-219-254.visual-fixture.ts` deve ser preservada, salvo se um campo já observável no freeze precisar ser exposto como dado estritamente visual. Nenhum arquivo de domínio, mapa, shell global, i18n ou rota integra o change set mínimo.

## Ordem mecânica de implementação

1. Extrair `OwnedCargoShipmentCard` sem alterar seleção, busca ou filtros.
2. Extrair `OwnedCargoDetailTabs` com as cinco regiões canônicas e apenas destinos reais.
3. Extrair `OwnedCargoDetailSummary` e montar cabeçalho operacional, transportador/ações e grid de quatro colunas.
4. Incorporar a faixa de métricas diretamente ao fluxo do summary, removendo offsets compensatórios.
5. Extrair `OwnedCargoAttentionPanel` e conectá-lo aos fatos já possuídos.
6. Remover do compositor somente markup/CSS tornado obsoleto pelos novos owners.
7. Só então executar a cadeia SHARKLOCK visual e funcional; não ajustar shell, master ou mapa para compensar divergência dos novos owners.

## Gate estrutural específico de `219:254`

A implementação não pode entrar em visual diff enquanto qualquer condição abaixo for falsa:

- cada linha da tabela possui exatamente um owner runtime;
- `Shipment Card`, `Cargo details` e `Attention / action panel` não permanecem como markup inline no compositor;
- o detail possui cinco regiões de tabs canônicas, sem rota inventada;
- o grid de detalhes possui quatro células na ordem do Figma;
- a faixa operacional é irmã direta do grid de detalhes, sem margem de posicionamento compensatória;
- o painel de atenção possui as cinco sub-regiões declaradas;
- mapa, shell, domínio e jornada não foram usados como compensação visual.

Se qualquer condição falhar: `FAIL — STRUCTURAL CONTRACT`, antes de captura ou caça-pixel.
