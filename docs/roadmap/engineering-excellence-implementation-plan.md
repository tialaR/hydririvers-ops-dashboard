# Plano de implementação: excelência técnica e automação

## Fase 1 — Estabilização

**Objetivo:** reduzir risco operacional antes de ampliar automação ou arquitetura.

### Dependências

- diagnóstico do `next build`;
- revisão final de docs que ainda citam middleware/proxy como fato;
- confirmação de cobertura mínima de testes nas áreas críticas.

### Entregas

- destravar build;
- alinhar documentação ao estado real;
- travar contratos de shell/hidratação.

### Validação

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm test`
- `npm run build`

## Fase 2 — Disciplina de engenharia

**Objetivo:** tornar o fluxo de trabalho previsível para o time e para revisores.

### Entregas

- documentar conventional commits e branches;
- avaliar commitlint e validação de título de PR;
- consolidar checklist de PR e onboarding.

### Riscos

- introduzir ferramenta só por estética;
- aumentar atrito sem ganho real.

### Validação

- checagem de docs;
- workflow de PR consistente;
- revisão humana do primeiro ciclo.

## Fase 3 — Observabilidade responsável

**Objetivo:** sair da documentação e avançar para medição útil.

### Entregas

- decidir escopo de telemetria;
- medir Web Vitals e comportamento de rotas-chave;
- documentar consentimento/privacidade;
- definir o que não será rastreado.

### Dependências

- decisão de produto;
- eventual secret/config de analytics;
- estratégia de privacidade.

### Validação

- relatório local ou em PR;
- evidência de impacto em LCP/CLS/INP quando houver tooling.

## Fase 4 — Performance e bundle controlados

**Objetivo:** reduzir peso das áreas mais caras sem overengineering.

### Entregas

- analisar componentes pesados;
- avaliar lazy loading/dynamic import onde fizer sentido;
- calibrar imagens, overlays e mapa;
- criar budget simples quando houver base para isso.

### Validação

- Lighthouse / bundle analysis apenas quando houver ferramenta estável;
- auditoria visual em mobile e desktop.

## Fase 5 — Mock Mode / QA Assistant

**Objetivo:** manter o Mock Mode útil como ferramenta de QA e onboarding.

### Entregas

- preservar catálogo de cenários;
- manter datasets determinísticos;
- associar cenários a testes e rotas reais;
- documentar como aplicar/resetar cenários.

### Dependências

- coerência entre features e mocks;
- disciplina para não virar “segundo produto”.

### Validação

- tests de catálogo;
- tests de persistência/determinismo;
- QA manual guiada por cenário.

## Fase 6 — Evolução da arquitetura

**Objetivo:** refinar sem reescrever.

### Entregas

- mover mais lógica para services/schemas quando houver retorno claro;
- manter shared pequeno;
- ampliar Server Actions apenas onde simplificarem muito;
- homogeneizar RHF apenas nos formulários críticos.

### Regras

- sem reescrever o projeto;
- sem criar abstração prematura;
- sem instalar tooling novo sem motivo concreto.

## Critérios de aceite por fase

| Fase | Critério |
| --- | --- |
| 1 | build estabilizado ou causa raiz documentada com plano de correção |
| 2 | onboarding e PRs consistentes |
| 3 | telemetria/observabilidade com escopo aprovado |
| 4 | indicadores de performance e bundles sob controle |
| 5 | Mock Mode útil para QA real |
| 6 | arquitetura mais simples, sem perda de responsabilidade por feature |

## Ordem recomendada

1. estabilização;
2. disciplina de engenharia;
3. observabilidade;
4. performance;
5. QA Assistant;
6. refinamento arquitetural.

