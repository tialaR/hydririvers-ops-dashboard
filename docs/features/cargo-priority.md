# Feature: Cargo Priority

## Objetivo
Exibir alertas operacionais da carga com clareza, priorizando risco, janela logística, sinal de rastreio, documentos críticos e próximas ações.

## O que mostra
- score operacional;
- nível de prioridade;
- cards-resumo com risco, janela, sinal e documentos;
- lista de prioridades acionáveis;
- checklist de próximas ações;
- impacto se nada for feito;
- estado vazio quando a carga ainda não tiver alertas.

## Origem dos dados
- Os dados vêm do domínio de carga e podem ser derivados do status atual da operação;
- quando existir, a carga pode receber um objeto `priority` estruturado do mock ou serviço;
- quando não existir dado explícito, a UI usa fallback calculado por `getCargoPriority(cargo)`.

## Estados de prioridade
- `monitoring`: operação sob acompanhamento;
- `medium`: exige atenção, mas ainda está sob controle;
- `high`: requer ação mais próxima.

## Severidades e status
- severidade: `low`, `medium`, `high`;
- status de ação: `monitoring`, `inReview`, `pending`, `stable`;
- status de checklist: `done`, `inProgress`, `pending`.

## Desktop e mobile
- no desktop, a área ocupa a tab de detalhe com cards compactos e hierarquia clara;
- no mobile, os mesmos blocos continuam empilhados e legíveis, sem scroll interno desnecessário.

## Relação com outras tabs
- Jornada mostra a evolução da operação;
- Documentos detalha os itens obrigatórios;
- Custos mostra o impacto financeiro;
- Prioridade aponta o que precisa de atenção primeiro e ajuda a decidir a próxima ação.

## Evolução para API real
- o contrato já pode ser substituído por serviço assíncrono sem mudar a interface;
- a camada de UI depende de tipos e helpers, não de mock direto.
