# Minhas Cargas — Fluxo Técnico do Embarcador

| Metadado | Valor |
|----------|-------|
| **Tipo** | Hydri Persona Flow Diagram — fluxo técnico |
| **Padrão visual** | [Hydri Persona Flow Diagram](../../design/hydri-persona-flow-diagram.md) |
| **Status** | Fluxo técnico aprovado — documentação e imagem versionadas |
| **Persona** | Embarcador / dono da carga |
| **Rota** | `/[locale]/minhas-cargas` |
| **Imagem** | [`./minhas-cargas-fluxo-tecnico-embarcador.png`](./minhas-cargas-fluxo-tecnico-embarcador.png) |

---

## Objetivo

Documentar o caminho técnico da rota privada operacional do embarcador:

**entrada → auth/policy → loading → mock service → lista → detalhe → BottomSheet/ações → erros/empty states → caminho feliz.**

Complementa a jornada de produto em [`minhas-cargas-fluxo-embarcador.md`](./minhas-cargas-fluxo-embarcador.md) com estados, serviços, mocks, políticas e componentes envolvidos.

---

## Imagem do fluxo técnico aprovado

![Minhas Cargas — Fluxo Técnico do Embarcador](./minhas-cargas-fluxo-tecnico-embarcador.png)

| Campo | Valor |
|-------|-------|
| **Referência relativa** | `./minhas-cargas-fluxo-tecnico-embarcador.png` |
| **Caminho no repositório** | `docs/product/flows/minhas-cargas-fluxo-tecnico-embarcador.png` |

Não recriar a arte — alterações visuais exigem nova rodada de aprovação de produto.

### Diferença entre imagem de persona e imagem técnica

| Arquivo | Papel |
|---------|-------|
| [`minhas-cargas-fluxo-embarcador.png`](./minhas-cargas-fluxo-embarcador.png) | Jornada da persona — etapas, valor e branches de produto |
| [`minhas-cargas-fluxo-tecnico-embarcador.png`](./minhas-cargas-fluxo-tecnico-embarcador.png) | Fluxo técnico — estados, mocks, policy, serviços e componentes |

Ambas são **fonte documental aprovada** para futuras tarefas que toquem `/minhas-cargas` ou componentes relacionados.

---

## Blocos documentados

### 1. Persona e entrada

- **Persona:** Embarcador / dono da carga.
- **Entrada:** rota `/[locale]/minhas-cargas`.
- **Objetivo:** monitorar a carteira operacional privada.

### 2. Auth e visibilidade

- Gate por sessão mock e tier de visibilidade.
- **Policy:** `public | authenticated | owner | negotiation participant` (`cargo-visibility-policy.ts`).
- Branches de acesso documentados na seção [Branches IF/ELSE](#branches-ifelse).

### 3. Loading e serviço

- **Tela:** `loading.tsx` → `MyCargoesListSkeleton`.
- **Serviço:** `getMyCargoesForUser()`.
- **Mocks/policy:** `owned-cargos.mock.ts`, `cargo-visibility-policy.ts`, usuário mock `u-shipper-1`.
- **Estado:** evita layout shift durante fetch.

### 4. Lista operacional

- **Componentes:** `PageShell`, `Breadcrumb`, `MyCargoesList`, `CargoCard` (variant `myCargos`).
- **Features:** busca e filtros, resumo operacional, status da carga, CTAs contextuais.

### 5. Detalhe da carga

- **Loader:** `CargoDetailLoader`.
- **Rota:** `/[locale]/minhas-cargas/[id]`.
- **Blocos:** mapa, timeline, documentos, riscos/alertas, rastreio.

### 6. BottomSheet e ações

- **Componente:** BottomSheet global.
- **Estados:** `idle` → `loading` → `success` / `error` → `closed`.
- **Ações:** acompanhar, negociar, atualizar status, registrar observação, abrir documentos.

### 7. Erros e empty states

- Mock sem usuário.
- Carga inexistente.
- Erro de serviço.
- Documentos ou timeline vazios.
- Mapa indisponível.
- Transportador tentando acessar área privada do embarcador.

### 8. Cargas x Minhas Cargas

| Aspecto | `/cargas` (público) | `/minhas-cargas` (privado) |
|---------|---------------------|----------------------------|
| **Propósito** | Vitrine — atrair interesse | Carteira operacional do dono |
| **Dados** | Limitados, foco em divulgação | Completos, foco em operação |
| **Execução** | Descoberta e entrada | Acompanhamento, negociação, status |

### 9. Caminho feliz

Ver seção [Caminho feliz](#caminho-feliz) abaixo.

### 10. Valor para o embarcador

- Centraliza visão operacional da carteira.
- Reduz fricção para acompanhar cargas próprias.
- Prepara caminho para negociação e rastreio.
- Benefícios: visão completa, menos fricção, segurança, negociação, rastreio.

---

## Caminho feliz

1. Entrar em `/minhas-cargas`.
2. Verificar auth.
3. Buscar owned cargos (`getMyCargoesForUser()`).
4. Renderizar skeleton (`loading.tsx` / `MyCargoesListSkeleton`).
5. Renderizar lista (`MyCargoesList`).
6. Selecionar carga (`CargoCard` variant `myCargos`).
7. Abrir detalhe (`CargoDetailLoader` em `/minhas-cargas/[id]`).
8. Ver mapa, timeline, documentos e riscos/alertas.
9. Executar ação via BottomSheet global.
10. Feedback de sucesso.

---

## Branches IF/ELSE

| Condição | Resultado |
|----------|-----------|
| **IF** usuário é embarcador dono **THEN** | Acesso completo à carteira e detalhe |
| **ELSE IF** usuário não autenticado **THEN** | Pedir login com retorno à rota |
| **ELSE IF** role incompatível **THEN** | Acesso restrito (ex.: admin redirecionado; transportador com copy adaptada) |
| **ELSE IF** sem cargas **THEN** | Estado vazio na lista |
| **ELSE IF** carga inexistente **THEN** | Erro / not found no detalhe |
| **ELSE** | Renderizar lista operacional |

---

## Mocks envolvidos

| Mock / módulo | Caminho | Uso |
|---------------|---------|-----|
| Carteira owned | `src/features/cargo/mocks/owned-cargos.mock.ts` | Massa por `shipperId` / `ownerId` |
| Vitrine pública (contraste) | `src/features/cargo/mocks/publicCargos.mock.ts` | Referência tier `public` — não misturar na lista privada |
| Shim legado | `src/features/my-cargos/mocks/myCargos.mock.ts` | Reexporta `owned-cargos` quando ainda existir |
| Policy | `src/features/cargo/domain/cargo-visibility-policy.ts` | Tiers `public`, `authenticated`, `owner` |
| Usuário mock | `u-shipper-1` | Persona embarcador para QA do fluxo |
| Serviço | `src/features/cargo/services/cargo.service.ts` | `getMyCargoesForUser()`, `getMyCargoByIdForUser()` |
| Timeline / documentos / riscos / mapa | checkpoints do domínio cargo | Quando existirem no detalhe privado |

---

## Componentes envolvidos

| Camada | Componente / módulo | Papel |
|--------|---------------------|-------|
| Shell | `PageShell`, `Breadcrumb` | Estrutura e navegação |
| Lista | `MyCargoesList` | Resumo, grid, empty state |
| Loading | `MyCargoesListSkeleton` | Skeleton da lista |
| Card | `CargoCard` (variant `myCargos`) | Seleção na lista |
| Detalhe | `CargoDetailLoader` | Mapa, timeline, docs, riscos |
| Ações | BottomSheet global | CTAs operacionais com estados |
| Controles | `Button`, `IconButton` | Ações e ícones |
| Status | Status chips | Estado operacional da carga |
| Detalhe — seções | Timeline, Map, Documents panel, Risk/alert panel | Branches do detalhe |

---

## Documentos relacionados

- [Minhas Cargas — Fluxo do Embarcador (persona)](./minhas-cargas-fluxo-embarcador.md)
- [Hydri Persona Flow Diagram](../../design/hydri-persona-flow-diagram.md)
- [Regras de negócio](../../business-rules.md)
- [Feature scope audit](../../feature-scope-audit.md)
