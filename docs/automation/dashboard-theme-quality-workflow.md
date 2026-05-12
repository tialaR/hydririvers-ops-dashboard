# Workflow de qualidade — tema do Dashboard e sidebar

## Objetivo

Garantir que o tema dark/light e os controles da sidebar mantenham consistência visual, acessibilidade e coerência com a linguagem operacional do Dashboard.

## Checklist

- [ ] O toggle de tema permanece funcional.
- [ ] O footer da sidebar não cria wrappers visuais redundantes.
- [ ] O controle de tema fica alinhado com idioma e logout.
- [ ] `aria-label` continua claro para leitores de tela.
- [ ] O foco visível continua evidente.
- [ ] A variante compacta da sidebar não quebra o layout recolhido.
- [ ] O dark/light continua legível em Dashboard, Cargas e Minhas cargas.
- [ ] O uso de tokens continua consistente.
- [ ] Não há cores mágicas novas fora da paleta existente.
- [ ] A validação visual foi feita em desktop e mobile.

## Quality gates

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm test`
- `npm run build`

## Observações

- Qualquer novo wrapper no footer da sidebar deve ser justificado por acessibilidade ou necessidade real de layout.
- Mudanças no toggle de tema devem ser acompanhadas de teste unitário ou e2e cobrindo a persistência do estado.
