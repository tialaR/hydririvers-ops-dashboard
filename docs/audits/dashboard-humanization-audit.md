# Auditoria: Humanizacao do Dashboard

Data: 2026-05-11  
Branch: `feat/mock-mode-qa-assistant`

## Problemas anteriores

- Introducao do Dashboard com copy fria/tecnica (pouca orientacao para usuario leigo).
- Card redundante "atalho operacional" duplicando CTA ja existente em outro bloco.
- Metric cards e blocos com titulos pouco explicativos para nao-operacionais.

## Mudancas aplicadas (nesta rodada)

- Copy do cabecalho do Dashboard foi humanizada (orientada a valor e entendimento rapido).
- Card redundante no topo foi removido (menos ruido e repeticao).
- Card guia (hero do overview) foi mantido como ponte entre entendimento e acao.
- Metric cards ganharam microcopy mais clara (o que significa / por que importa).

## Ganhos de UX esperados

- Usuario entende mais rapido "para que serve esta tela".
- Menos repeticao de CTA, mais foco no que importa.
- Numeros deixam de parecer soltos e passam a ter significado pratico.

## Pendencias (se houver)

- Validar com QA/usuarios se o tom esta "humano sem marketing".
- Se necessario, evoluir hints/labels por role (shipper vs carrier) sem duplicar tela.

