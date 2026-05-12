# Dashboard: Arquitetura da Informacao

Data: 2026-05-11

## Principio

O Dashboard deve ser uma pagina de **leitura rapida e decisao**, nao uma pagina de detalhe.

Regra pratica:

- se o usuario precisa "investigar", a informacao deve morar em `Cargas`, `Minhas Cargas` ou no detalhe/timeline.
- se o usuario precisa "entender a situacao em 15 segundos", deve estar no Dashboard.

## Hierarquia recomendada

1. **Introducao guiada**
   - explica para que serve a tela e sugere proximos passos.
2. **Metricas principais**
   - numeros com rotulo humano e hint de significado.
3. **Blocos de decisao**
   - "o que precisa de atencao"
   - "onde esta mais movimentado"
   - "atividade recente"

## O que fica no Dashboard (sim)

- contexto do dia (snapshot)
- contadores de status (em andamento, pendente, etc.)
- listas curtas de itens relevantes (atencao/atividade)
- links/CTAs para aprofundar (marketplace / minhas cargas)

## O que nao deve ficar no Dashboard (nao)

- tabelas grandes com densidade de detalhe (mover para listagens)
- formularios longos
- detalhe completo de carga/documentos
- rastreio detalhado (fica em Rastreio ou detalhe)

## Criterios de manutencao

- cada bloco deve dizer "por que importa"
- evitar repeticao de CTA (um bloco guia e suficiente)
- linguagem humana, sem termos tecnicos desnecessarios

