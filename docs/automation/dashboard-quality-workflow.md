# Workflow de qualidade do Dashboard

## Objetivo

Garantir que o Dashboard continue sendo um cockpit operacional e não volte a parecer uma listagem de cargas.

## Checklist de produto

- O Dashboard responde “como está a operação agora?”.
- O topo explica, em linguagem humana, para que serve a tela e o que ela resume.
- O Dashboard não domina a experiência com uma listagem completa de cargas.
- Ha um unico bloco guia de CTAs (evitar atalhos duplicados para o mesmo destino).
- Ha caminho claro para `Cargas` (publico) e `Minhas cargas` (privado).
- A copy deixa clara a diferença entre as três áreas.

## Checklist de UI

- Sem overflow horizontal.
- Sem texto sobreposto.
- Mobile validado.
- Dark/light validado.
- Estados vazios validados.
- Loading e erro validados quando aplicável.

## Checklist de acessibilidade

- Headings corretos.
- Foco visível.
- Botões e links acessíveis.
- Ícones decorativos tratados corretamente.
- Contraste adequado.

## Checklist de i18n

- `pt-BR`, `en-US` e `es` atualizados.
- `check:i18n` passou.
- Copy humanizada para usuário leigo.

## Checklist de testes

- service testado;
- componentes testados;
- rotas e sidebar testadas;
- separação Dashboard / Cargas testada.

## Checklist de performance

- mapa pesado não bloqueia o Dashboard;
- evitar hidratação excessiva;
- evitar layout shift;
- usar lazy load quando necessário;
- evitar renderizar listas pesadas como conteúdo principal.

## Quality gates

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm test`
- `npm run build`

## Observação

Se o Dashboard precisar crescer, prefira novos blocos operacionais ou novos serviços de resumo, em vez de voltar a reaproveitar a lista principal de `Cargas`.
