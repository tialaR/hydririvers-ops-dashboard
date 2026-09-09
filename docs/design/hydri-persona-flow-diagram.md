# Hydri Persona Flow Diagram

| Metadado | Valor |
|----------|-------|
| **Nome do padrão** | `Hydri Persona Flow Diagram` |
| **Status** | Aprovado — padrão visual de documentação de produto |
| **Escopo** | Diagramas de jornada por persona para decisão de produto, alinhamento e implementação |
| **Idioma padrão** | pt-BR |
| **Modo visual** | Light mode, editorial, limpo |

---

## 1. Nome do padrão

**Hydri Persona Flow Diagram** — formato visual único para documentar jornadas de produto por persona, com arte final versionada em `docs/product/flows/` e especificação neste documento.

---

## 2. Objetivo do padrão

Estabelecer um formato visual único para documentar **como uma persona percorre o produto** — da entrada na rota até detalhes e ações — de forma clara o suficiente para:

- alinhar produto, design e engenharia;
- priorizar implementação sem depender de lab ou código;
- registrar decisões aprovadas com arte final versionada no repositório.

O diagrama é **documento de produto**, não substituto de protótipo de alta fidelidade nem de especificação técnica de API.

---

## 3. Quando usar

Use `Hydri Persona Flow Diagram` quando:

- uma rota ou área do produto tem jornada multi-etapa por persona (embarcador, transportador, operador portuário, admin);
- o time precisa de **uma imagem aprovada** como referência de fluxo antes ou durante a implementação;
- há branches de detalhe (mapa, timeline, documentos, alertas, ações) que precisam ficar visíveis fora do código;
- a decisão envolve stakeholders que não leem Mermaid, JSON ou código.

---

## 4. Quando não usar

Não use este padrão quando:

- o entregável é **wireframe de tela** ou **mock de UI** pixel-perfect — use Figma ou referência de componente;
- o objetivo é **arquitetura de sistema**, sequência de API ou modelo de dados — use ADR, diagrama técnico ou Mermaid em doc técnico;
- o fluxo é temporário de exploração em lab (`hy-ui-lab`, `dev-v2`, `tmp-*`) — labs não são fonte de verdade de persona;
- a representação humana não é necessária e o diagrama seria apenas um mapa de estados sem jornada — prefira diagrama técnico adequado;
- o pedido explícito é **gráfico visual aprovado** — **não** substitua a imagem final por Mermaid renderizado como arte.

---

## 5. Estrutura visual obrigatória

Todo `Hydri Persona Flow Diagram` aprovado deve seguir esta composição:

| Zona | Posição | Conteúdo |
|------|---------|----------|
| **Marca / contexto** | Topo direito | Logo Hydri e/ou contexto hidroviário (rio, embarcação, operação) |
| **Título** | Topo | Nome da rota ou área + subtítulo do fluxo (ex.: `MINHAS CARGAS — FLUXO DO EMBARCADOR`) |
| **Persona** | Esquerda | Retrato circular + rótulo da persona principal |
| **Fluxo principal** | Horizontal (esquerda → direita) | Etapas numeradas com ícone, cor semântica e rótulo curto |
| **Setas** | Entre etapas | Direção clara do caminho feliz |
| **Branches inferiores** | Abaixo da etapa de detalhe ou ação | Subtelas, seções ou ações derivadas do passo principal |
| **Ações finais** | Branch mais profunda quando aplicável | CTAs operacionais (ex.: acompanhar, negociar, atualizar status) |

**Regras visuais:**

- diagramas claros em **light mode** com fundo claro e contraste legível;
- **persona principal à esquerda**;
- **fluxo principal horizontal** (esquerda → direita);
- **detalhes e ações em branches inferiores**;
- **marca Hydri ou contexto hidroviário no topo direito**;
- ícones simples e consistentes por etapa;
- cores semânticas por tipo de passo (entrada, resumo, busca, seleção, detalhe, ação);
- **textos em pt-BR por padrão**, curtos, sem jargão de implementação;
- visual limpo, editorial e próprio para decisão de produto — espaço respirável, sem poluição de UI de app;
- **nomes de arquivo em kebab-case**.

---

## 6. Regra de representação: pessoas negras sempre

Quando o diagrama incluir representação humana (retrato, avatar, silhueta identificável como pessoa):

- a persona principal deve ser representada como **pessoa negra**;
- **pessoas negras sempre** quando houver representação humana — vale para embarcador, transportador, operador e demais personas humanas no mesmo padrão;
- ícones abstratos sem figura humana não entram nesta regra;
- avatares genéricos “neutros” ou clipart que não representam diversidade **não** substituem esta regra quando há figura humana.

Esta regra é parte do padrão de marca e inclusão visual do Hydri em documentação de produto.

---

## 7. Convenção de nomes

### Padrão

- Nome formal: **`Hydri Persona Flow Diagram`**
- Slug de arquivo: **kebab-case** em pt-BR sem acentos no path
- Formato: `{rota-ou-area}-fluxo-{persona}.png` e `.md` irmão na mesma pasta

### Exemplos

| Fluxo | PNG | Markdown |
|-------|-----|----------|
| Minhas Cargas — Embarcador | `minhas-cargas-fluxo-embarcador.png` | `minhas-cargas-fluxo-embarcador.md` |
| Cargas — visitante (futuro) | `cargas-fluxo-visitante.png` | `cargas-fluxo-visitante.md` |
| Negociações — transportador (futuro) | `negociacoes-fluxo-transportador.png` | `negociacoes-fluxo-transportador.md` |

### Metadados no `.md` irmão

Cada fluxo aprovado deve declarar: rota, persona, objetivo, valor, placeholder ou referência relativa à imagem (`./{arquivo}.png`), componentes e mocks envolvidos (quando conhecidos).

---

## 8. Onde salvar imagens futuras

| Tipo | Caminho | Observação |
|------|---------|------------|
| **Fluxos aprovados de persona** | `docs/product/flows/` | Fonte de verdade versionada no repo |
| **Referências legadas ou rascunhos** | `docs/product/references/` | Não substituem fluxo aprovado em `flows/` |
| **Evidência temporária de QA** | `output/` | Não versionar como fluxo aprovado |
| **Labs e rounds de UI** | `docs/design/mobile-cargo-*`, `hy-ui-lab` | Arte temporária ou de componente — não persona flow |

**Regras de arquivo:**

- kebab-case no nome do arquivo;
- PNG (ou SVG vetorial quando o time padronizar) sem compressão agressiva;
- não alterar resolução da imagem aprovada sem nova rodada de aprovação;
- a imagem aprovada fora do repo deve ser copiada para o path final na rodada de versionamento — **não recriar** a arte.

O `.md` irmão pode existir **antes** da imagem: use placeholder textual até a PNG ser anexada ao repositório.

---

## 9. Relação com Whimsical / Figma / Miro

| Ferramenta | Papel |
|------------|--------|
| **Whimsical / Miro** | Exploração rápida, workshops, rascunho colaborativo |
| **Figma** | UI de alta fidelidade, componentes, tokens, telas |
| **Hydri Persona Flow Diagram (repo)** | **Arte aprovada** e versionada da jornada por persona |

**Fluxo recomendado:**

1. Rascunhar em Whimsical, Miro ou Figma se necessário.
2. Consolidar visual final alinhado a este padrão (light mode, persona à esquerda, fluxo horizontal, branches inferiores).
3. Exportar PNG e salvar em `docs/product/flows/` com `.md` irmão.
4. Referenciar o path do repo em ADRs, PRs e docs de produto — não depender só do link externo da ferramenta.

Links externos podem complementar; o repositório é a fonte de verdade do que está **aprovado**.

---

## 10. Mermaid como apoio técnico — não entrega visual final

**Regra:** Mermaid pode ser apoio técnico, mas **não é entrega visual final** quando o pedido for gráfico visual aprovado.

| Permitido | Proibido |
|-----------|----------|
| Diagrama auxiliar no `.md` irmão para busca, diff textual ou automação | Substituir PNG aprovada por Mermaid renderizado como arte de produto |
| Rascunho interno antes da consolidação visual | Declarar fluxo “aprovado” só com Mermaid quando stakeholders pediram diagrama visual |
| Apoio a engenharia em docs técnicos separados | Copiar Mermaid para lab ou UI Visual Lab como substituto do padrão |

Quando o entregável for **Hydri Persona Flow Diagram**, a imagem em `docs/product/flows/` é a referência visual canônica após versionamento.

---

## 11. Imagens aprovadas como fonte documental

Imagens aprovadas de fluxo (persona ou técnico) são **fonte documental consultável** por agentes e Cursor antes de alterar rota, fluxo ou componentes relacionados.

| Regra | Detalhe |
|-------|---------|
| **Onde salvar** | `docs/product/flows/` — kebab-case no nome do arquivo |
| **Markdown irmão** | Cada PNG aprovada deve ter `.md` no mesmo diretório com rota, persona, objetivo, mocks e componentes |
| **Natureza** | Documentação de produto/design — **não** lab temporário, screenshot descartável ou arte de runtime |
| **Consulta obrigatória** | Agentes devem ler o `.md` e referenciar a imagem quando a tarefa tocar o fluxo representado (ver `docs/agents/AGENTS-TASK-ROUTER.md` → **Product flow documentation gate**) |
| **Complemento, não substituto** | Não substituem i18n, testes ou mocks — orientam intenção, hierarquia, estados e valor de produto |
| **Atualização** | Se uma tarefa alterar o fluxo representado na imagem, atualizar o `.md` e avaliar se a PNG precisa ser atualizada em nova rodada de aprovação |

### Variantes do mesmo fluxo

| Sufixo no arquivo | Conteúdo |
|-------------------|----------|
| `-fluxo-{persona}.png` | Jornada da persona — etapas, valor, branches de produto |
| `-fluxo-tecnico-{persona}.png` | Fluxo técnico — auth/policy, loading, serviço, mocks, estados, componentes, erros |

Ambas as variantes podem coexistir para a mesma rota; ambas são fonte aprovada.

### Inventário atual (Minhas Cargas — Embarcador)

| Documento | Imagem | Tipo |
|-----------|--------|------|
| [`minhas-cargas-fluxo-embarcador.md`](../product/flows/minhas-cargas-fluxo-embarcador.md) | [`minhas-cargas-fluxo-embarcador.png`](../product/flows/minhas-cargas-fluxo-embarcador.png) | Jornada persona |
| [`minhas-cargas-fluxo-tecnico-embarcador.md`](../product/flows/minhas-cargas-fluxo-tecnico-embarcador.md) | [`minhas-cargas-fluxo-tecnico-embarcador.png`](../product/flows/minhas-cargas-fluxo-tecnico-embarcador.png) | Fluxo técnico |

---

## 12. Imagem de fluxo é documento de produto

**Regra:** imagem de fluxo é **documento de produto**, não lab nem arte temporária.

| É | Não é |
|---|--------|
| Decisão de produto versionada | Código de produção |
| Referência para implementação e QA | Lab temporário (`hy-ui-lab`, `dev-v2`) |
| Arte final quando explicitamente aprovada | Screenshot descartável fora de `docs/product/flows/` |
| Entrada para alinhamento de persona e valor | Substituição de testes automatizados ou i18n |

**Proibido:**

- tratar PNG de fluxo como asset de runtime do app (sem copiar para `public/` para UI);
- gerar nova imagem “parecida” quando já existe aprovação — copiar a arte aprovada;
- deixar fluxo aprovado apenas em chat, Figma privado ou pasta `output/`.

---

## Exemplos de uso

### Fluxos documentados — Minhas Cargas (Embarcador)

| Tipo | Documento | Imagem |
|------|-----------|--------|
| Jornada persona | [`minhas-cargas-fluxo-embarcador.md`](../product/flows/minhas-cargas-fluxo-embarcador.md) | [`minhas-cargas-fluxo-embarcador.png`](../product/flows/minhas-cargas-fluxo-embarcador.png) |
| Fluxo técnico | [`minhas-cargas-fluxo-tecnico-embarcador.md`](../product/flows/minhas-cargas-fluxo-tecnico-embarcador.md) | [`minhas-cargas-fluxo-tecnico-embarcador.png`](../product/flows/minhas-cargas-fluxo-tecnico-embarcador.png) |

- **Persona:** Embarcador / dono da carga
- **Rota:** `/[locale]/minhas-cargas`

> Para novos fluxos, o `.md` irmão pode existir antes da imagem: use placeholder textual até a PNG ser anexada.

### Como citar em PR ou decisão de produto

```md
Fluxo aprovado: Hydri Persona Flow Diagram — Minhas Cargas (Embarcador).
Ver docs/product/flows/minhas-cargas-fluxo-embarcador.md e imagem em ./minhas-cargas-fluxo-embarcador.png.
```

---

## Documentos relacionados

- [`docs/product/flows/minhas-cargas-fluxo-embarcador.md`](../product/flows/minhas-cargas-fluxo-embarcador.md) — jornada persona
- [`docs/product/flows/minhas-cargas-fluxo-tecnico-embarcador.md`](../product/flows/minhas-cargas-fluxo-tecnico-embarcador.md) — fluxo técnico
- [`docs/product/dashboard-cargas-minhas-cargas-decision.md`](../product/dashboard-cargas-minhas-cargas-decision.md) — fronteiras entre rotas
- [`docs/product/mobile-shipper-use-cases.md`](../product/mobile-shipper-use-cases.md) — casos de uso to-be do embarcador
- [`docs/business-rules.md`](../business-rules.md) — regras de visibilidade e mocks por rota
- [`docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`](../agents/AGENTS-UI-MOBILE-STANDARDS.md) — referência ao padrão em contexto mobile
