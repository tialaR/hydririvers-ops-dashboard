# Auditoria — Humanização do Detalhe de Negociação (Estado Atual)

Data: 2026-05-11

## Problema observado

O detalhe de negociação já tem visual sólido, mas tende a ser “ficha técnica”:

- O topo identifica a negociação, mas não explica propósito e valor (“o que eu faço aqui?”).
- Termos aparecem como campos, sem contexto do impacto na decisão.
- Documentos aparecem como chips, mas sem indicar o que está pendente vs validado.
- Histórico existe, mas pouco orientado a decisão (não sugere “próximo passo seguro”).

## Arquivos principais

- Página: `src/app/[locale]/negociacoes/[id]/page.tsx`
- UI: `src/features/negotiations/components/negotiation-detail/*`
- i18n: `messages/*` em `pages.negotiationDetail`

## Riscos

- Usuário leigo não entende rápido o status e o que precisa acontecer agora.
- Pendências documentais podem passar despercebidas.
- A página não guia tomada de decisão comercial (só “mostra dados”).

## Recomendação

- Humanizar o topo com um subtítulo orientado a propósito.
- Adicionar bloco “o que precisa acontecer agora”.
- Melhorar termos com hints curtos.
- Classificar visualmente documentos (pendente/validado/atenção).
- Ajustar histórico para parecer linha do tempo da negociação.

