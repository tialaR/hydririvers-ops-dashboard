# HydroRivers — Page 62 · Experience State Machine v1.0

**Data:** 2026-09-24  
**Persona:** embarcadora autenticada  
**Objetivo:** transformar D01–D13 em fluxo executável, sem tratar frames repetidos como telas independentes.

## 1. Estados de experiência

| Estado | Figma | Shell | Trabalho principal |
| --- | --- | --- | --- |
| discovery | D01–D03 | Discovery | detectar, selecionar e localizar a carga |
| cockpit | D04–D05 | Contextual Workspace | entender condição, telemetria e sequência |
| documentsRisk | D06–D07 | Contextual Workspace | investigar evidência, divergência e impacto |
| negotiation | D08–D09 | Contextual Workspace | comparar proposta e coordenar contraparte |
| review | D10 | Focus | revisar consequência antes da confirmação |
| feedback | D11 | Focus | confirmar efeito da ação |
| correction | D12 | Focus | corrigir/revalidar/reencaminhar |
| monitoring | D13 | Contextual Workspace | acompanhar resultado e próxima decisão |

## 2. Eventos

### CARGO_SELECTED
Origem: discovery  
Destino: discovery  
Efeito: muda selectedCargoId, mapa, métricas e contextos.

### HYDRO_CONSTRAINT_RAISED
Origem: qualquer estado operacional  
Destino: discovery ou cockpit  
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
Origem: feedback/monitoring  
Destino: correction  
Efeito: gera correctionCase com evidence compare.

### CORRECTION_SUBMITTED
Origem: correction  
Destino: monitoring  
Efeito: novo evento operacional e estado waitingValidation.

### FOLLOW_UP_REQUIRED
Origem: feedback/monitoring  
Destino: monitoring  
Efeito: mantém atenção até uma condição de saída.

## 3. Guards

- decisão comercial não pode avançar sem proposta selecionada;
- confirmação não pode avançar sem consequência visível;
- correção não pode avançar sem evidência que explique a divergência;
- monitoramento não pode esconder pendência aberta;
- dado hidrográfico stale/offline não pode ser apresentado como live;
- surcharge de seca não pode ser tratada como cobrança automática;
- resolução futura não pode ser tratada como vigente.

## 4. Fluxo feliz

discovery → cockpit → documentsRisk → negotiation → review → feedback → monitoring

## 5. Fluxo com correção

discovery → cockpit → documentsRisk → correction → monitoring

ou

negotiation → review → feedback → correction → monitoring

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

- shell não muda por capricho: Discovery / Contextual / Focus seguem o trabalho;
- o componente não decide regra de negócio;
- Storybook recebe snapshots determinísticos;
- ações usam callbacks/payloads tipados;
- adapters futuros transformam API → snapshot do domínio;
- estado visual nunca é inferido de cor.
