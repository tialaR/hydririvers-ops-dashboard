# HydroRivers — Page 62 · Experience State Machine v1.1

**Data:** 2026-10-01  
**Persona:** embarcadora autenticada  
**Objetivo:** transformar D01–D13 em fluxo executável sem tratar frames repetidos como telas independentes. D13 permanece como referência de estado pós-ação, mas não é destino de navegação: seu conteúdo volta ao Cockpit.

## 1. Estados de experiência

| Estado | Figma | Shell | Trabalho principal |
| --- | --- | --- | --- |
| discovery | D01–D03 | Discovery | detectar, selecionar e localizar a carga |
| cockpit | D04–D05 + D13 pós-ação | Contextual Workspace | entender condição, telemetria, sequência e acompanhar resultado após uma ação |
| documentsRisk | D06–D07 | Contextual Workspace | investigar evidência, divergência e impacto |
| negotiation | D08–D09 | Contextual Workspace | comparar proposta e coordenar contraparte |
| review | D10 | Focus | revisar consequência antes da confirmação |
| feedback | D11 | Focus | confirmar efeito da ação |
| correction | D12 | Focus | corrigir/revalidar/reencaminhar |

## 2. Eventos

### CARGO_SELECTED
Origem: discovery  
Destino: cockpit  
Efeito: seleciona a carga e abre o contexto operacional.

### HYDRO_CONSTRAINT_RAISED
Origem: estado operacional  
Destino: cockpit ou contexto atual de investigação  
Efeito: atualiza risco, ETA delta, trecho afetado e ação recomendada.

### DOCUMENT_DIVERGENCE_FOUND
Origem: cockpit/documentsRisk  
Destino: documentsRisk  
Efeito: cria ocorrência vinculada ao documento e evidencia antes/depois.

### PROPOSAL_SELECTED
Origem: negotiation  
Destino: review  
Guard: proposta válida e contexto operacional disponível.

### REVIEW_CONFIRMED
Origem: review  
Destino: feedback  
Efeito: persiste decisão e produz evento auditável.

### REVIEW_CANCELLED
Origem: review  
Destino: negotiation  
Efeito: nenhuma mutação comercial.

### DOCUMENT_REJECTED
Origem: feedback  
Destino: correction  
Efeito: gera correctionCase com evidence compare.

### CORRECTION_SUBMITTED
Origem: correction  
Destino: cockpit  
Efeito: retorna à mesma carga com estado pós-ação, evidência atualizada e monitoramento incorporado.

### FOLLOW_UP_REQUIRED / FOLLOW_UP_OPENED
Origem: feedback/cockpit  
Destino: cockpit  
Efeito: mantém o acompanhamento no workspace operacional, sem abrir uma tela paralela.

## 3. Guards

- decisão comercial não pode avançar sem proposta selecionada;
- confirmação não pode avançar sem consequência visível;
- correção não pode avançar sem evidência que explique a divergência;
- estado pós-ação do Cockpit não pode esconder pendência aberta;
- dado hidrográfico stale/offline não pode ser apresentado como live;
- surcharge de seca não pode ser tratado como cobrança automática;
- resolução futura não pode ser tratada como vigente.

## 4. Fluxo feliz

discovery → cockpit → documentsRisk → negotiation → review → feedback → cockpit (pós-ação)

## 5. Fluxo com correção

discovery → cockpit → documentsRisk → correction → cockpit (pós-ação)

ou

negotiation → review → feedback → correction → cockpit (pós-ação)

## 6. Regra de persistência

Cada transição mutável deve gerar:
- eventId;
- cargoId;
- actor;
- occurredAt;
- recordedAt;
- evidenceIds quando houver;
- before/after quando houver;
- nextRecommendedExperience.

## 7. Regras de UI

- D13 não aparece como tab, rota ou tela autônoma;
- o Cockpit muda de estado após a ação e materializa resultado, pendência, próximo marco, telemetria e contexto hidroviário;
- shell não muda por capricho: Discovery / Contextual / Focus seguem o trabalho;
- o componente não decide regra de negócio;
- Storybook recebe snapshots determinísticos;
- ações usam callbacks/payloads tipados;
- adapters futuros transformam API → snapshot do domínio;
- estado visual nunca é inferido de cor.
