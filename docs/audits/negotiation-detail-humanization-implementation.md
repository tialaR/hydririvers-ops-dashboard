# Detalhe de negociação — guia de decisão comercial

## Problema observado

- O detalhe concentrava informação correta (valor, termos, documentos, histórico), mas o fluxo mental ainda parecia “ficha técnica”: pouca hierarquia entre **o que fazer agora** e o restante.
- Subtítulo da página misturava embarcação ao final da frase; documentos e histórico precisavam de rótulos de impacto e status mais explícitos para leigos.
- Em mobile, faltava reserva inferior explícita para a bottom navigation e proteção de overflow no breadcrumb.

## Como a página virou guia de decisão

1. **Bloco “O que precisa acontecer agora”** passou a aparecer **antes** do card principal na coluna esquerda, com texto orientado a ação, estágio em linguagem natural e o **próximo passo real** vindo do mock (sem botão falso).
2. **Card principal** consolida estágio + significado, título da carga, rota e embarcação com rótulos, **valor negociado** com explicação curta, próximo passo em destaque e **link real** para a ficha da carga no marketplace quando `cargoId` existe.
3. **Topo (`PageShell`)** usa `descriptionWithVessel` (`{vessel} · …`) ou `descriptionPlain` quando não há nome de embarcação.
4. **Acesso negado** usa o namespace `pages.negotiationDetail` com `accessDeniedTitle`, `accessDeniedDescription` e corpo `accessDeniedBody`, alinhado à mensagem pedida pelo produto.

## Termos, documentos e histórico

- **Termos**: descrição da seção explica o *porquê* de cada bloco; hints de partes, pagamento, seguro e próximo passo foram alinhados às microcopies pedidas (impacto operacional).
- **Documentos**: lista em cartões com **status** (Pendente / Validado / Atenção / Em conferência) e **impacto** curto; cores dourado para pendência/atenção e ciano/verde para validado; classificação ampliada em `getNegotiationDocumentStatus` (ex.: “emissão”, “pendiente”, “revisión”).
- **Histórico**: títulos já eram amigáveis; mantida a linha do tempo com `data-testid="negotiation-timeline"` para testes e leitura clara.

## Design system

- Mesma base de `Card` com gradiente sutil, bordas `hx-line-soft`, acentos **âmbar** para comercial/atenção e **ciano** para ação e documentos validados.
- `PageShell` + hierarquia eyebrow → título → descrição alinhada ao restante do app logado.

## Testes executados

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm test`
- `npm run build`

## Pendências

- Resposta HTTP 404 para negociação inexistente continua via `notFound()`; chaves `notFoundTitle` / `notFoundDescription` estão nos JSON para evolução futura (ex. `not-found.tsx` segmentado).
- `tests/unit/features/negotiations/negotiation-board-render.test.tsx` permanece em `.tsx` e **fora** do padrão `include` atual do Vitest (`*.test.ts` apenas); ao ampliar o include, usar `vi.hoisted` nos mocks.
