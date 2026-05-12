# 0028 — Impacto com storytelling baseado em evidências

Status: **Aceito**  
Data: **2026-05-11**

## Contexto

O produto precisa comunicar valor econômico, ambiental e institucional. A página Impacto é sensível: claims fortes sem fonte geram risco de credibilidade e podem soar como greenwashing.

## Problema

- Percentuais e métricas apareciam sem fonte específica.
- Não havia distinção explícita entre dado do produto, estimativa demonstrativa e evidência pública.
- Contexto institucional (BR do Mar, hidrovias) podia parecer promessa ou parceria.

## Decisão

Humanizar Impacto com **transparência**:

- Cards com categoria (econômico/ambiental/operacional/institucional) e “confiança” (fonte pública / demo / estimativa / policy / hipótese).
- Estrutura estática de evidências públicas (sem fetch em runtime).
- Detalhe de impacto com seções:
  - significado
  - valor
  - evidências públicas
  - limites
  - o que observar na operação

## Alternativas consideradas

1. Manter Impacto como galeria de cards aspiracionais.
2. Remover números e contexto institucional por completo.
3. Criar relatório técnico pesado.
4. Storytelling baseado em evidências + limites (decisão escolhida).

## Consequências positivas

- Aumenta confiança e reduz risco de claims não verificáveis.
- Ajuda usuários leigos a entender o “por que importa”.
- Mantém alinhamento visual sem transformar Impacto em “marketing”.

## Trade-offs

- Evidência pública contextualiza, mas não garante resultados específicos.
- Percentuais só podem voltar quando houver fonte/metodologia explícita.

## Critérios de revisão futura

- Se o produto passar a calcular estimativas reais por rota/carga, documentar metodologia e fontes.
- Se houver necessidade de mais fontes, adicionar via modelo estático e auditar copy.

