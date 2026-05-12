# 0027 — Detalhe de negociação como guia de decisão

Status: **Aceito**  
Data: **2026-05-11**

## Contexto

Após humanizar a lista de Negociações, o detalhe ainda precisava guiar a tomada de decisão: usuários leigos enxergavam termos, documentos e histórico como “campos” sem entender impacto e próximo passo seguro.

## Problema

- Topo pouco orientado a propósito.
- Termos e documentos sem contexto do que é pendente/validado.
- Histórico curto e pouco acionável.
- Falta um bloco explícito de “o que precisa acontecer agora”.

## Decisão

Evoluir o detalhe de negociação para um **guia de decisão comercial**:

- Topo com copy orientada a propósito.
- Bloco “O que precisa acontecer agora” próximo do início.
- Valor com label/hint (evita “número solto”).
- Termos com hints curtos para usuários leigos.
- Documentos com estados visuais (pendente/validado/atenção) por regra determinística.
- Histórico como “linha do tempo” (linguagem clara).

## Alternativas consideradas

1. Manter detalhe como ficha técnica.
2. Transformar detalhe em tabela comercial.
3. Fundir detalhe de negociação com detalhe de carga.
4. Humanizar detalhe como guia de decisão (decisão escolhida).

## Consequências positivas

- Usuário entende rapidamente status, valor e próximo passo.
- Pendências documentais ficam explícitas.
- Consistência com DS de Cargas sem virar “card de carga”.

## Trade-offs

- Parsing de status de documento é heurístico (por texto) enquanto não há modelo de dados com status estruturado.
- Ações reais não foram inventadas; o guia orienta por texto até existirem CTAs reais.

## Critérios de revisão futura

- Quando documentos tiverem status estruturado no mock/service, remover heurística textual.
- Quando ações por perfil existirem (shipper/carrier), adicionar CTAs reais com permissões.

