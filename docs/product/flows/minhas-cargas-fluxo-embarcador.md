# Minhas Cargas — Fluxo do Embarcador

| Metadado | Valor |
|----------|-------|
| **Padrão visual** | [Hydri Persona Flow Diagram](../../design/hydri-persona-flow-diagram.md) |
| **Status** | Fluxo aprovado em produto — documentação e imagem versionadas |
| **Persona** | Embarcador / dono da carga (`shipper`) |
| **Rota** | `/[locale]/minhas-cargas` |
| **Imagem** | [`./minhas-cargas-fluxo-embarcador.png`](./minhas-cargas-fluxo-embarcador.png) |

---

## 1. Rota

`/[locale]/minhas-cargas`

Detalhe privado: `/[locale]/minhas-cargas/[id]`

Requer sessão autenticada. Admin é redirecionado para área administrativa. Visitante é redirecionado para login com retorno à rota.

---

## 2. Persona

**Embarcador / dono da carga** — usuário que publica, acompanha e opera suas cargas na área privada. No diagrama aprovado, representado à esquerda como pessoa negra, conforme regra do padrão `Hydri Persona Flow Diagram`.

Transportador (`carrier`) também acessa `/minhas-cargas` com copy e carteira adaptadas; este fluxo documenta o caminho **primário do embarcador**.

---

## 3. Objetivo da rota

Responder: **“Quais cargas pertencem a mim e como continuo a operação?”**

A rota é a **área operacional privada** do embarcador — não marketplace, não cockpit agregado do dashboard. O usuário entra para ver resumo da carteira, localizar uma carga, abrir detalhe e agir (acompanhar, negociar, atualizar status, documentos, alertas).

---

## 4. Valor gerado

| Para o embarcador | Para o produto |
|-------------------|----------------|
| Visão consolidada das próprias cargas sem ruído do marketplace público | Separação clara entre vitrine (`/cargas`) e carteira privada |
| Resumo operacional antes da lista (ativas, pendências, propostas) | Reduz confusão entre dados públicos e `owner` |
| Caminho direto para detalhe com mapa, timeline, documentos e ações | Base para priorizar gaps de implementação com arte aprovada |
| CTAs operacionais no detalhe (acompanhar, negociar, status) | Alinha engenharia ao fluxo de decisão já validado em produto |

---

## 5. Fluxo aprovado em texto

### Fluxo principal (horizontal)

| # | Etapa | Intenção |
|---|-------|----------|
| 1 | **Entrar em Minhas Cargas** | Acesso à área privada via navegação autenticada |
| 2 | **Ver resumo operacional** | KPIs/resumo da carteira antes ou junto da lista |
| 3 | **Buscar / filtrar** | Encontrar carga específica na carteira |
| 4 | **Selecionar carga** | Escolher item na lista |
| 5 | **Abrir detalhe da carga** | Visão completa da carga selecionada |

### Branches inferiores (a partir do detalhe)

| Seção | Propósito |
|-------|-----------|
| **Ver mapa** | Posição e contexto geográfico da operação |
| **Ver timeline** | Jornada e marcos da carga |
| **Ver documentos** | Readiness e pendências documentais |
| **Ver riscos / alertas** | Exposição de riscos e alertas operacionais |
| **Executar ações** | CTAs operacionais do detalhe (ver seção 6) |

---

## 6. Ações

Ações operacionais previstas no fluxo aprovado, a partir do detalhe da carga:

| Ação | Propósito |
|------|-----------|
| **Acompanhar** | Seguir evolução da operação (status, marcos, próximo passo) |
| **Negociar** | Entrar ou retomar negociação vinculada à carga |
| **Atualizar status** | Registrar ou corrigir status operacional conforme permissões do embarcador |

---

## 7. Imagem do fluxo aprovado

Arte visual aprovada versionada no repositório:

![MINHAS CARGAS — FLUXO DO EMBARCADOR](./minhas-cargas-fluxo-embarcador.png)

| Campo | Valor |
|-------|-------|
| **Referência relativa** | `./minhas-cargas-fluxo-embarcador.png` |
| **Caminho no repositório** | `docs/product/flows/minhas-cargas-fluxo-embarcador.png` |
| **Padrão** | [Hydri Persona Flow Diagram](../../design/hydri-persona-flow-diagram.md) |

Não recriar a arte — alterações visuais exigem nova rodada de aprovação de produto.

---

## 8. Componentes envolvidos

Implementação atual (referência para fechar gaps com o fluxo aprovado):

| Camada | Componente / módulo | Papel no fluxo |
|--------|---------------------|----------------|
| Página | `src/app/[locale]/(product-shell)/minhas-cargas/page.tsx` | Entrada, auth gate, fetch de carteira |
| Página | `src/app/[locale]/(product-shell)/minhas-cargas/[id]/page.tsx` | Detalhe privado com ownership |
| Loading | `src/app/[locale]/(product-shell)/minhas-cargas/loading.tsx` | Skeleton da lista |
| Lista | `MyCargoesList` (`my-cargoes-list.tsx`) | Resumo operacional, grid, empty state, banner pós-criação |
| Skeleton | `my-cargoes-list-skeleton` | Loading da lista |
| Card | `CargoCard` (`variant="myCargos"`) | Seleção de carga na lista |
| Detalhe | `CargoDetailLoader` | Detalhe com seções (mapa, timeline, docs, ações conforme implementação) |
| Shell | `PageShell`, `Breadcrumb` | Estrutura e navegação |
| Serviço | `getMyCargoesForUser`, `getMyCargoByIdForUser` | Dados da carteira privada |
| Domínio | `cargo-visibility-policy.ts` | Tier `owner` para acesso |

---

## 9. Mocks envolvidos

| Mock / fonte | Caminho | Uso |
|--------------|---------|-----|
| Carteira privada (owned) | `src/features/cargo/mocks/owned-cargos.mock.ts` | Massa por `shipperId` / `ownerId` / carrier vinculado |
| Serviço | `src/features/cargo/services/cargo.service.ts` | `getMyCargoesForUser()` agrega mocks owned por persona |
| Legado / fallback | `src/features/my-cargos/mocks/myCargos.mock.ts` | Referência histórica; convergir com `owned-cargos` |
| Visibilidade | `src/features/cargo/domain/cargo-visibility-policy.ts` | Gate `owner` — não expor carteira em `/cargas` |

Regra de negócio: ver [`docs/business-rules.md`](../../business-rules.md) — seção *Cargas por navegação* e *Regras de visibilidade*.

---

## 10. Diferença para `/cargas`

| Aspecto | `/[locale]/cargas` | `/[locale]/minhas-cargas` |
|---------|-------------------|---------------------------|
| **Pergunta** | Quais cargas estão disponíveis no marketplace? | Quais cargas são minhas? |
| **Público** | Visitante e autenticado (vitrine) | Usuário logado (carteira privada) |
| **Dados** | `getPublicCargos()` / `publicCargosMock` | `getMyCargoesForUser()` / `owned-cargos.mock` |
| **Visibilidade** | Tier `public` | Tier `owner` (ownership obrigatório) |
| **Detalhe** | `/cargas/[id]` — oferta pública, dados sensíveis limitados | `/minhas-cargas/[id]` — operação completa do dono |
| **Ações** | Buscar oferta, abrir, negociar entrada | Acompanhar, documentos, timeline, status, negociação vinculada |
| **O que evitar** | Listar carteira privada como se fosse marketplace | Misturar cargas públicas na lista principal |

Decisão de produto: [`docs/product/dashboard-cargas-minhas-cargas-decision.md`](../dashboard-cargas-minhas-cargas-decision.md).

---

## 11. Próximos passos

Priorizar fechamento de gap entre **fluxo aprovado** e **estado atual do repo**:

1. **Buscar / filtrar na lista privada** — o diagrama inclui etapa 3; validar se filtros de `MyCargoesList` cobrem busca, status e pendências como no fluxo.
2. **Resumo operacional** — alinhar cards do resumo (`summarizeCargoes`) com métricas do diagrama (ativas, propostas, pendências, em trânsito).
3. **Detalhe — branches** — garantir presença e hierarquia de Mapa, Timeline, Documentos, Riscos/alertas e bloco de Ações no detalhe privado.
4. **Ações do detalhe** — implementar ou destacar **Acompanhar**, **Negociar** e **Atualizar status** conforme permissões do embarcador (`access-control`).
5. **Mocks por persona** — massa rica para `u-shipper-*` em `owned-cargos.mock` para QA do fluxo completo sem empty state falso.
6. **Mobile** — validar jornada em três larguras após mudanças de UI; rota de preview: `/pt-BR/minhas-cargas`.

Critérios de aceite ampliados: [`docs/product/mobile-shipper-use-cases.md`](../mobile-shipper-use-cases.md).

---

## Fluxo técnico complementar

A jornada de produto acima é complementada pelo **fluxo técnico aprovado** (auth, loading, serviço, mocks, estados, erros):

- **Documento:** [`minhas-cargas-fluxo-tecnico-embarcador.md`](./minhas-cargas-fluxo-tecnico-embarcador.md)
- **Imagem:** [`./minhas-cargas-fluxo-tecnico-embarcador.png`](./minhas-cargas-fluxo-tecnico-embarcador.png)

| Imagem | Papel |
|--------|-------|
| `minhas-cargas-fluxo-embarcador.png` | Jornada da persona |
| `minhas-cargas-fluxo-tecnico-embarcador.png` | Fluxo técnico / estados / mocks / policy |

Ambas são fonte documental aprovada para tarefas futuras em `/minhas-cargas`.

---

## Documentos relacionados

- [Minhas Cargas — Fluxo Técnico do Embarcador](./minhas-cargas-fluxo-tecnico-embarcador.md)
- [Hydri Persona Flow Diagram](../../design/hydri-persona-flow-diagram.md)
- [Decisão Dashboard / Cargas / Minhas cargas](../dashboard-cargas-minhas-cargas-decision.md)
- [Casos de uso mobile embarcador](../mobile-shipper-use-cases.md)
- [Regras de negócio](../../business-rules.md)
