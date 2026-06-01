# HydriRivers — Business Flow Blueprint

| Metadado | Valor |
|----------|-------|
| **Status** | **Atual** — documento de produto (somente leitura do repo em 2026-06-01) |
| **Escopo** | Produto, fluxos, mocks, rotas, dev-v2 e evolução para produção |
| **Fontes auditadas** | `src/app/[locale]`, mocks em `src/features/**`, `MobileCargoListLabV2`, DS oficial, `docs/product/roles-and-permissions.md` |
| **Não substitui** | Código, testes, ADRs individuais — em divergência, o código vence até este doc ser atualizado |

---

## Índice

1. [Produto e propósito](#1-produto-e-propósito)
2. [Usuários e papéis](#2-usuários-e-papéis)
3. [Foco do MVP atual](#3-foco-do-mvp-atual)
4. [Rotas atuais](#4-rotas-atuais)
5. [Fluxo mobile principal (dev-v2)](#5-fluxo-mobile-principal-dev-v2)
6. [Fluxos de ação e dados mockados](#6-fluxos-de-ação-e-dados-mockados)
7. [Regras de dados e mocks](#7-regras-de-dados-e-mocks)
8. [Mensagens e microcopy](#8-mensagens-e-microcopy)
9. [Design System e experiência](#9-design-system-e-experiência)
10. [Telas futuras e evolução](#10-telas-futuras-e-evolução)
11. [Regressão e rollback](#11-regressão-e-rollback)
12. [Próximos PRs recomendados](#12-próximos-prs-recomendados)

**Legenda de status usada no documento**

| Tag | Significado |
|-----|-------------|
| **Atual** | Comportamento ou rota existente no repositório hoje |
| **Parcial** | Existe, mas incompleto, desktop-first ou sem paridade mobile |
| **Laboratório** | Rota/código de validação visual ou UX, fora do shell de produção |
| **Legado** | Mantido por compatibilidade; revisar antes de expandir |
| **Proposto** | Decisão de produto alinhada ao repo, ainda não entregue |
| **Futuro** | Roadmap; não assumir implementação |
| **Risco** | Ponto que pode causar regressão se misturado em um PR |
| **Decisão** | Regra explícita para o time |

---

## 1. Produto e propósito

### O que é

**HydriRivers Ops Dashboard** é uma aplicação web responsiva (Next.js App Router, React 19, i18n `pt-BR` / `en-US` / `es`) para **operação logística hidroviária** no Brasil. Funciona hoje em modo **mock-first**: dados fictícios determinísticos alimentam listas, detalhes, negociações e autenticação simulada, com persistência opcional em `.mock-data/*.json` (dev-only, gitignored).

### Para que serve

Oferecer um **cockpit operacional** onde embarcadores, transportadores, governo e admin enxergam o mesmo ecossistema com **ênfases diferentes**:

- vitrine e gestão de **cargas**;
- **embarcações** e compatibilidade operacional;
- **negociações** e contratação;
- **rastreio/jornada** e eventos;
- **documentos** e prontidão regulatória;
- **custos** e composição financeira;
- **mapa/hidrovias/corredores** para decisão espacial;
- **impacto** e visão institucional.

Referência de produto no DS: [`docs/design/hydririvers-design-system.md`](../design/hydririvers-design-system.md#2-produto-e-propósito).

### Qual problema resolve

Logística hidroviária combina **janelas de maré**, **terminais dispersos**, **corredores longos**, **conectividade irregular** e **muitos atores**. Planilhas e mensagens fragmentadas não sustentam:

| Necessidade | Por que importa |
|-------------|-----------------|
| **Lista + filtros** | Priorizar o que embarca/aguarda atracação hoje |
| **Detalhe** | Origem, destino, ETA, status e próximo passo em um lugar |
| **Mapa** | Rota fluvial, corredor e risco operacional (calado, restrição) |
| **Jornada** | Eventos (saída, parada, atracação) com confiança de ETA |
| **Documentos** | NF-e, romaneio, laudos — bloqueio de publicação/contratação |
| **Custos** | Preço alvo, propostas, pagamentos — decisão de contratar |

### Por que lista, filtros, detalhe, mapa, jornada, documentos e custos juntos

**Decisão:** o valor mínimo para o embarcador mobile não é “ver um card bonito”, é **decidir e agir** (publicar, completar documentos, aceitar proposta, acompanhar atraso). Cada camada responde a uma pergunta:

1. **Lista** — “O que está em movimento ou precisa da minha atenção?”
2. **Filtros** — “O que cabe na minha rota, embarcação e janela?”
3. **Detalhe** — “Esta carga é a certa? Qual o próximo passo?”
4. **Mapa** — “Onde está e qual corredor?”
5. **Jornada** — “O que já aconteceu e o que falta?”
6. **Documentos** — “Posso embarcar/contratar legalmente?”
7. **Custos** — “Fecha economicamente?”

---

## 2. Usuários e papéis

Papéis modelados em código (`UserRole`): `shipper`, `carrier`, `admin`. Governo/impacto existem como **rotas e capabilities**, não como `role` separado no tipo de usuário.

Fonte: `src/features/auth/domain/access-control.ts`, `docs/product/roles-and-permissions.md`.

### 2.1 Embarcador (`shipper`)

| Dimensão | Conteúdo |
|----------|----------|
| **Objetivo principal** | Publicar e acompanhar **minhas cargas**, documentos, propostas e rastreio |
| **Ver primeiro** | Minhas cargas com pendência documental ou sem proposta; depois marketplace se buscar transporte |
| **Dados que importam** | Status, janela, origem/destino, prontidão documental, propostas, ETA, custo alvo |
| **Pode fazer** | Criar carga (`create-cargo`), ver marketplace, minhas cargas, negociações relacionadas, rastreio, impacto, perfil |
| **Não deve fazer** | Gerir frota alheia; acessar admin/mock-mode; ver cargas privadas de outro `shipperId` |
| **Rotas principais** | `/minhas-cargas`, `/cargas/nova`, `/cargas/[id]`, `/negociacoes`, `/rastreio`, `/perfil` |
| **Ênfase visual** | Status de documentação, CTA “completar/publicar”, badges de cotação — **Proposto** no dev-v2 (hoje cards genéricos) |

### 2.2 Transportador / operador (`carrier`)

| Dimensão | Conteúdo |
|----------|----------|
| **Objetivo principal** | Encontrar oportunidades, operar cargas atribuídas, gerir embarcações |
| **Ver primeiro** | Marketplace filtrado por corredor/capacidade; cargas atribuídas em operação |
| **Dados que importam** | Tipo de carga, peso/calado, embarcação compatível, janela, proposta, posição/rastreio |
| **Pode fazer** | Marketplace, minhas cargas (atribuídas), negociações, rastreio, **embarcações**, impacto |
| **Não deve fazer** | Criar carga por regra padrão (`create-cargo` só shipper/admin); admin |
| **Rotas principais** | `/cargas`, `/embarcacoes`, `/minhas-cargas`, `/negociacoes`, `/rastreio` |
| **Ênfase visual** | Disponibilidade de frota, compatibilidade — **Parcial** na rota `/embarcacoes` |

### 2.3 Governo / institucional

| Dimensão | Conteúdo |
|----------|----------|
| **Objetivo principal** | Visão agregada de corredores, impacto e indicadores — sem PII indevida |
| **Ver primeiro** | Impacto e governo (agregados) |
| **Dados que importam** | Corredores, métricas socioambientais, volume agregado — **não** dados privados por usuário |
| **Pode fazer** | Rotas `/governo`, `/impacto` quando capability `view-government` / `view-impact` |
| **Não deve fazer** | Acessar `/minhas-cargas` de terceiros; mock-mode |
| **Rotas** | `/governo`, `/impacto`, `/impacto/[id]` |
| **Status** | **Parcial / Futuro** — capability só em `admin` hoje; páginas existem |
| **Ênfase visual** | Painéis analíticos, mapas de corredor — operacionais, não “dashboard genérico” |

### 2.4 Admin (`admin`)

| Dimensão | Conteúdo |
|----------|----------|
| **Objetivo principal** | QA, personas, cenários mock, ampla visibilidade |
| **Ver primeiro** | `/admin` + Mock Mode / QA Assistant |
| **Dados que importam** | Cenário ativo, usuário simulado, reset determinístico |
| **Pode fazer** | Todas as capabilities incluindo `use-mock-mode`, `view-government`, `create-cargo` |
| **Não deve fazer** | Tratar mock como produção; commitar `.mock-data` com PII |
| **Rotas** | `/admin`, todas as demais conforme navegação filtrada |
| **Ênfase visual** | Controles de cenário, badges de ambiente — **Atual** em `MockMode` / `MockQaHub` |

### 2.5 Perfil individual

| Dimensão | Conteúdo |
|----------|----------|
| **Objetivo principal** | Identidade, empresa, cidade, preferências de sessão |
| **Ver primeiro** | `/perfil` após login |
| **Rotas** | `/perfil`, `/logout` |
| **Status** | **Atual** (mock) |

### Matriz rápida: marketplace vs minhas cargas

| Conceito | Rota | Regra |
|----------|------|-------|
| Marketplace público | `/cargas` | Lista compartilhada; detalhe público `/cargas/[id]` |
| Minhas cargas (privado) | `/minhas-cargas` | Filtrada por `shipperId` ou `assignedCarrierId` |
| Alias legado | `/cargas/minhas-cargas` | **Legado** — redireciona/reexporta padrão antigo |

**Decisão:** nunca vazar cargo privado entre usuários em `/minhas-cargas/[id]` (`canUserViewPrivateCargo`).

---

## 3. Foco do MVP atual

### Definição

| Item | Escolha |
|------|---------|
| **Persona primária** | Embarcador (`shipper`) |
| **Superfície** | **Mobile-first** |
| **Fluxo núcleo** | Lista de Cargas → Filtros → Detalhe da Carga |
| **Entradas seguintes (não bloqueantes do núcleo)** | Jornada, Documentos, Custos, Mapa dedicado |
| **Laboratório visual** | `/[locale]/dev-v2` (`MobileCargoListLabV2`) |
| **Laboratório integrado a mocks** | `/[locale]/dev/mobile-cargo-list-lab` (env-gated) |

### Por que esse foco entrega valor primeiro

1. **Embarcador** é quem cria demanda — sem lista/filtro/detalhe confiáveis, o marketplace não converte.
2. **Mobile-first** reflete uso em terminal/porto (ADR-0002 mobile-first).
3. **Filtros por terminal/corredor/tipo** reduzem ruído em hidrovias com poucas opções viáveis.
4. **Detalhe em sheet** valida hierarquia (status → rota → ETA → ações) antes de investir em mapa full-screen.
5. **dev-v2** isola visual/UX do shell desktop (`OperationsBoard` em `/cargas`) — **Risco** se misturar os dois no mesmo PR.

### O que fica explicitamente fora do MVP imediato

- Negociação completa end-to-end (**Parcial** em `/negociacoes`)
- Mapa Hydroway produção em todos os dispositivos (**Parcial** — spike em `/dev/hydroway-map-spike`, rota real `/cargas/[id]/mapa`)
- Persistência real/API (**Futuro**)

---

## 4. Rotas atuais

Todas as rotas de produto vivem sob `src/app/[locale]/`. Locales: `pt-BR`, `en-US`, `es`. Prefixo real: `/{locale}/...`.

Helpers: `src/shared/routing/app-routes.ts` (`intlAppPaths`).

### 4.1 Rotas de produto `(product-shell)`

Usam `LocaleShell` (header, sidebar desktop, bottom nav mobile, AdminChrome quando aplicável). **Atual.**

| Rota (após locale) | Página / componente principal | Classificação | Notas |
|--------------------|------------------------------|---------------|-------|
| `/` | `HydroHero`, `ValuePillars` | **Parcial** | Landing/marketing; não é o cockpit |
| `/login` | Auth | **Atual** | OTP simulado; shell público sem chrome logado |
| `/cadastro` | Register | **Atual** | OTP antes de criar conta |
| `/logout` | Logout | **Atual** | |
| `/dashboard` | Dashboard operacional | **Parcial** | Cockpit desktop; ver `docs/product/dashboard-operational-cockpit.md` |
| `/cargas` | `OperationsBoard` + `getPublicCargos()` | **Parcial** | Marketplace **desktop-oriented**; não é dev-v2 |
| `/cargas/[id]` | `CargoDetailLoader` | **Parcial** | Abas via `?view=jornada\|documentos\|custos\|prioridade` |
| `/cargas/[id]/mapa` | Mapa imersivo carga | **Parcial** | Mobile imersivo; ver `isCargoHydrowayMapPathname` |
| `/cargas/nova` | Nova carga | **Parcial** | Requer auth + `create-cargo` |
| `/cargas/minhas-cargas` | Alias | **Legado** | Preferir `/minhas-cargas` |
| `/cargas/minhas-cargas/[id]` | Alias detalhe | **Legado** | |
| `/minhas-cargas` | Lista privada por usuário | **Atual** | Mock-first por `shipperId` / carrier |
| `/minhas-cargas/[id]` | Detalhe privado + ownership | **Atual** | |
| `/negociacoes` | Lista negociações | **Parcial** | |
| `/negociacoes/[id]` | Detalhe | **Parcial** | |
| `/embarcacoes` | Frota/marketplace embarcações | **Parcial** | Carrier + admin |
| `/embarcacoes/[id]` | Detalhe embarcação | **Parcial** | |
| `/rastreio` | Tracking | **Parcial** | Eventos em `marketplace.mock` |
| `/perfil` | Perfil | **Atual** | |
| `/admin` | Admin + Mock Mode | **Atual** | QA |
| `/governo` | Governo | **Parcial / Futuro** | Capability restrita |
| `/impacto` | Impacto | **Parcial** | |
| `/impacto/[id]` | Detalhe impacto | **Parcial** | |
| `/dev-onboarding` | Onboarding dev | **Laboratório** | Dentro do product-shell |

### 4.2 Rotas de laboratório (fora do product-shell)

| Rota | Layout | Classificação | Notas |
|------|--------|---------------|-------|
| `/dev/mobile-cargo-list-lab` | `dev/layout` | **Laboratório** | `MobileCargoListLab` + `cargoListService`; **404** se env desabilitado |
| `/dev/hydroway-map-spike` | `dev/layout` | **Laboratório** | Spike mapa + GeoJSON mock |
| `/dev-v2` | Sem `dev/layout`; sem AdminChrome | **Laboratório** | `MobileCargoListLabV2` — dados **inline** no componente |
| `/dev-v2/mobile-cargo-list-lab` | Idem | **Laboratório** | Mesmo componente que `/dev-v2` (rota duplicada para testes) |

**Decisão:** `dev-v2` permanece laboratório até paridade validada com mocks definitivos e i18n; só então migração controlada para `/cargas` mobile.

### 4.3 APIs mock (referência de fluxo)

| Endpoint | Uso |
|----------|-----|
| `/api/auth/login`, `register`, `logout`, `me`, `profile` | Sessão mock |
| `/api/auth/qa-direct-login` | QA |
| `/api/cargas` | Lista/API cargas |
| `/api/negociacoes` | Negociações |
| `/api/embarcacoes` | Embarcações |
| `/api/rastreio` | Tracking |
| `/api/mock-mode`, `/api/mock-mode/login-as` | Cenários e persona |

### 4.4 Rotas mencionadas pelo DS mas não como segmento dedicado

| Rota esperada (DS) | No repo |
|--------------------|---------|
| `dev-v2` | **Atual** — ver acima |
| Dashboard como “home logado” | **Proposto** — hoje `/` é marketing; dashboard em `/dashboard` |

---

## 5. Fluxo mobile principal (dev-v2)

Componente: `src/features/cargo/components/mobile-list-lab-v2/mobile-cargo-list-lab-v2.tsx`  
Rotas: `/[locale]/dev-v2`, `/[locale]/dev-v2/mobile-cargo-list-lab`  
Estado: **Laboratório** — UI rica; dados **não** sincronizam com `.mock-data` nem `publicCargosMock`.

### 5.1 Arquitetura da tela

```
┌─────────────────────────────────────┐
│ Header: título + contador + filtros │
│         + toggle dark/light         │
├─────────────────────────────────────┤
│ SearchField + botão filtros         │
├─────────────────────────────────────┤
│ Lista de CargoCards (scroll)        │
├─────────────────────────────────────┤
│ BottomNav (oculta se sheet aberto)  │
└─────────────────────────────────────┘
        │                    │
        ▼                    ▼
  BottomSheet            BottomSheet
  "Filtros"              Detalhe carga
```

### 5.2 Tela: Lista de Cargas

#### O que mostra (**Atual**)

- Título **“Cargas”** e subtítulo `{filtradas} de {total} cargas` (4 cargas fixas em `CARGOES`).
- Campo **“Buscar cargas...”**.
- Lista de **cards** com animação por índice (`--card-index`).

#### Dados de cada card (**Atual**)

| Elemento | Campo / origem | Destaque visual |
|----------|----------------|-----------------|
| Ícone tipo | `cargoType` (Projeto → ícone contêiner) | Secundário |
| ID | `cargo.id` (ex. `CRG-7845`) | Alto — identificador operacional |
| Status | `statusLabel` + `data-status` | **Máximo** — badge semântico |
| Título | `cargo.title` | Alto |
| Rota | `origin` → `destination` (pontos + ícone barco) | Alto |
| ETA | `cargo.eta` no rodapé | Médio-alto |
| CTA textual | “Ver detalhes” ou “Acompanhar” | Médio |

Subtítulo (`subtitle`), volume, vessel existem no modelo mas **não** aparecem no card dev-v2 — **Proposto** exibir volume/tipo no card para embarcador.

#### Clique no card (**Atual**)

- Abre `BottomSheet` modo `cargo` com `selectedCargo`.
- `sheetMode = 'cargo'`; bottom nav **some** enquanto sheet aberto.

#### Clique em filtro (**Atual**)

- Header (ícone com badge de contagem) ou quadrado ao lado da busca → `sheetMode = 'filters'`.
- Badge = número de grupos ativos (status, tipos, origem, destino, embarcação, cutoff, capacidade, busca ≥2 chars).

#### Clique em busca (**Atual**)

- Filtragem client-side em tempo real.
- Query com **menos de 2 caracteres** não restringe lista (só conta como filtro ativo se ≥2).

#### Bottom nav (**Atual** — **não navega**)

| Item | `data-active` | Comportamento |
|------|---------------|---------------|
| Visão | false | Botão sem `onClick` de rota — **Futuro** |
| Dashboard | false | Idem |
| **Cargas** | true | Estado visual apenas |
| Embarcações | false | Idem |
| Perfil | false | Idem |

**Proposto:** ligar itens a `intlAppPaths` quando migrar para product-shell.

#### Estados esperados

| Estado | dev-v2 hoje | Lab `/dev/mobile-cargo-list-lab` | Produção `/cargas` |
|--------|-------------|----------------------------------|---------------------|
| **Loading** | **Não implementado** | SSR view model | Suspense/`loading.tsx` em cargas |
| **Vazio (sem cargas)** | Impossível (sempre 4 seeds) | `emptyTitle` i18n | Depende do board |
| **Vazio filtrado** | Lista vazia **sem mensagem** — **Risco UX** | `emptyFilteredTitle` | Chips + empty |
| **Erro** | **Não implementado** | Depende do service | **Futuro** boundary |
| **Lista filtrada** | **Atual** | **Atual** | Parcial |
| **Card selecionado** | Sheet detalhe | Action sheet / navegação | Detalhe página |
| **Sem resultados busca** | Igual vazio filtrado | Mensagem dedicada | i18n `emptyTitle` |

### 5.3 Tela: Filtros (BottomSheet)

#### Abertura / fechamento (**Atual**)

| Ação | Efeito |
|------|--------|
| Abrir | `setSheetMode('filters')` |
| Fechar (X, overlay, drag down) | `closeSheet()` → `sheetMode = null` |
| Snap | `collapsed` 40dvh, `expanded` 98dvh; drag habilitado |

Componente compartilhado: `src/shared/components/bottom-sheet/BottomSheet.tsx`.

#### “Limpar filtros” (**Atual**)

1. Reseta: busca, status, tipo carga, origem, destino, embarcação, cutoff, capacidade → `'todos'` / `''`.
2. Fecha o sheet (`clearFiltersAndClose`).
3. **Não altera** arquivo mock — só estado React.

#### “Ver cargas” (**Atual**)

- Fecha o sheet; **mantém** filtros selecionados.
- Lista já estava filtrando em tempo real (não espera este botão para aplicar).

#### Grupos de filtros (**Atual**)

Opções importadas de `cargo-filter-options.mock.ts`. Lógica de match em `mobile-cargo-list-lab-v2.tsx`.

| Grupo | Opções (mock) | Como o chip altera estado | Efeito na lista |
|-------|---------------|---------------------------|-----------------|
| **Status** | Todos, Spot, Em trânsito, Atracada, Concluída, Atrasada | `setStatus(value)` | `matchesStatusFilter` — mapeia `cotacao`+`agendado` para spot, etc. |
| **Origem** | Todos + 4 terminais/portos | `setOrigin` | Match em `cargo.originTerminal === value` |
| **Destino** | Todos + 3 destinos | `setDestination` | Match em `cargo.destinationTerminal` |
| **Tipo de carga** | Granel, líquido, geral, contêiner | `setCargoType` | `CARGO_TYPE_MATCHES` em `cargo.cargoType` |
| **Tipo de embarcação** | Empurrador, barcaça, comboio, balsas… | `setVesselType` | Substring em `cargo.vessel` |
| **Disponibilidade / Data de corte** | Hoje, 2-4 dias, 5+ dias, noturna, atracação crítica | `setCutoff` | Heurística em `eta` + `delivery` |
| **Capacidade / Peso bruto** | Faixas em toneladas, canal raso, alto volume | `setCapacity` | Parse de `cargo.volume` (ex. `18 t`) |

**Nota:** grupos `port`, `ip4`, `waterway`, `corridor` existem no **tipo** do mock de opções, mas **não** têm UI no dev-v2 — **Futuro**.

#### Interação chip (**Atual**)

- Bubble Press: `data-pressing` por 160ms em pointer down/up.
- `aria-pressed` em origem/destino.

### 5.4 Tela: Detalhe da Carga (BottomSheet)

#### Abertura (**Atual**)

- Tap no card ou Enter/Espaço no card (acessível).
- Título do sheet = `cargo.title`.
- Snap único `expanded` ~90dvh.

#### Blocos (**Atual**)

| Bloco | Conteúdo | Navegação |
|-------|----------|-----------|
| ID + status | `cargo.id`, `StatusBadge` | — |
| Título | `cargo.title` | — |
| Rota | Origem/destino + terminais | — |
| Stats | ETA, entrega prevista (`delivery`) | — |
| Ações | Visão geral, Jornada, Documentos, Custos | Botões **sem** `onClick` de rota — **Futuro** |
| Mais | “Ações da carga •••” | **Futuro** |

#### O que cada seção deveria abrir (**Proposto** / estado prod)

| Seção | Destino alvo em produção | dev-v2 |
|-------|-------------------------|--------|
| Visão geral | `/cargas/[id]` ou sheet overview | **Futuro** |
| Jornada | `/cargas/[id]?view=jornada` ou `/rastreio` | **Futuro** |
| Documentos | `?view=documentos` | **Futuro** |
| Custos | `?view=custos` | **Futuro** |

#### Destaque para embarcador (**Proposto**)

1. Status + próximo passo operacional (`operationalNextStep` existe em `userCargosMock`, não no lab v2).
2. Prontidão documental (%).
3. Propostas pendentes.
4. ETA com confiança.

### 5.5 Comparativo: dev-v2 vs lab integrado vs produção

| Aspecto | dev-v2 | `/dev/mobile-cargo-list-lab` | `/cargas` |
|---------|--------|------------------------------|-----------|
| Dados | Inline `CARGOES[4]` | `cargoListService` → repository | `getPublicCargos()` + board |
| Filtros mock | `cargo-filter-options.mock` | Service + i18n | Board/filtros desktop |
| i18n | Hardcoded PT | **Atual** namespaces | **Atual** |
| Empty states | Não | **Atual** | Parcial |
| Theme toggle | **Atual** | **Atual** | Shell global |

---

## 6. Fluxos de ação e dados mockados

Legenda colunas: **Mock alterado** = persiste em `.mock-data` ou seed TS; **N/A** = só estado UI.

### 6.1 dev-v2 (`MobileCargoListLabV2`)

| Ação do usuário | Componente | Comportamento esperado | Dado lido | Mock alterado | Feedback visual | Rota/sheet |
|-----------------|------------|------------------------|-----------|---------------|-----------------|------------|
| Abrir página | `MobileCargoListLabV2` | Renderiza 4 cargas | `CARGOES` inline | N/A | Lista | `/dev-v2` |
| Buscar (≥2 chars) | `searchField` | Filtra por id, título, origem, destino, vessel, tipo | Estado `query` | N/A | Contador header | — |
| Abrir filtros | `headerButton` / `filterSquare` | Sheet filtros | — | N/A | Badge contagem | Sheet `filters` |
| Selecionar chip | `FilterChipButton` | Atualiza filtro; lista refiltra | `cargo-filter-options.mock` labels | N/A | `data-active`, Bubble Press | Sheet aberto |
| Limpar filtros | `FilterSheetActions` | Reset + fecha sheet | — | N/A | Press primary/secondary | Fecha |
| Ver cargas | `FilterSheetActions` | Fecha sheet mantendo filtros | — | N/A | Press | Fecha |
| Clicar card | `CargoCard` | Abre detalhe | Item `Cargo` | N/A | Sheet 90dvh | Sheet `cargo` |
| Abrir jornada/doc/custos | `CargoSheet` buttons | **Nenhum** hoje | — | N/A | Botão estático | **Futuro** |
| Toggle tema | `headerButton` | `data-theme` dark/light | — | N/A | Ícone sol/lua | — |
| Bottom nav | `BottomNav` | **Nenhum** | — | N/A | Active em Cargas | — |

### 6.2 Produção / lab integrado (referência)

| Ação | Componente | Comportamento | Dado lido | Mock alterado |
|------|------------|---------------|-----------|---------------|
| Listar marketplace | `OperationsBoard` / `MobileCargoListLab` | SSR/CSR lista pública | `marketplace.mock` / `publicCargos` via services | Leitura `.mock-data/cargoes.json` se existir |
| Abrir detalhe público | `CargoDetailLoader` | Página com abas | `getCargoById` | N/A leitura |
| Minhas cargas | página minhas cargas | Filtra por user id/role | `userCargos.mock` + mock-db | Escrita em fluxos de edição (**Parcial**) |
| Login + OTP | `auth-form` | Valida OTP simulado | `auth.mock`, challenges | `users.json` no cadastro |
| Mock Mode login-as | `MockQaHub` | Troca persona | `mock-qa-personas` | Cenário + sessão |
| Nova carga | formulário nova carga | Cria/atualiza mock | cargo service | **Parcial** write mock |
| Negociação | páginas negociações | Lista/detalhe | `negotiations` seed | **Parcial** |

### 6.3 Ações não presentes no dev-v2 (**Futuro**)

| Ação | Status |
|------|--------|
| Criar nova carga | `/cargas/nova` — fora do lab |
| Editar / cancelar carga | APIs/services — não no v2 |
| Aceitar / propor transporte | `/negociacoes` — **Parcial** |

---

## 7. Regras de dados e mocks

### 7.1 Mapa de fontes

| Domínio | Fonte primária (seed TS) | Consumido por | Persistência local |
|---------|--------------------------|---------------|-------------------|
| **Lista pública marketplace** | `marketplace.mock.ts` → `cargoes` | `/cargas`, APIs, `mock-db` | `.mock-data/cargoes.json` |
| **Lista pública alternativa** | `publicCargos.mock.ts` | `getPublicCargos`, repositórios | Merge no read |
| **Minhas cargas** | `myCargos.mock.ts` | `/minhas-cargas`, `cargo.service` | Por usuário lógico |
| **Opções de filtro** | `cargo-filter-options.mock.ts` | dev-v2, lab mobile, testes | Não mutável |
| **Usuários** | `auth.mock.ts` → `defaultUsers` | Auth, sessão, QA | `.mock-data/users.json` |
| **Negociações** | `marketplace.mock.ts` → `negotiations` | `/negociacoes` | `.mock-data/negotiations.json` |
| **Embarcações** | `marketplace.mock.ts` → `vessels` | `/embarcacoes` | `.mock-data/vessels.json` |
| **Tracking** | `marketplace.mock.ts` → `trackingEvents` | `/rastreio` | `.mock-data/trackingEvents.json` |
| **Mapa / corredores** | `hydroway-operational-layers.mock.ts`, GeoJSON em `waterway-map/data/*.mock.geojson` | Spike, mapa carga | Somente leitura |
| **dev-v2 lista** | Array `CARGOES` no TSX | dev-v2 apenas | **N/A** — **Risco** de divergência |

### 7.2 Identificação de usuário

| Campo | Uso |
|-------|-----|
| `user.id` | Chave primária (`u-shipper-1`, `u-carrier-1`, …) |
| `user.role` | `shipper` \| `carrier` \| `admin` |
| `shipperId` / `ownerId` em cargo | Ownership embarcador |
| `assignedCarrierId` / carrier ids | **Futuro** campo explícito — hoje validação via helpers em `cargo.service` |

Sessão: cookie `hydrorivers_session` (rotas privadas em `middlewarePrivateIntlPaths`).

### 7.3 Telefone e OTP (**Atual** simulado)

1. Login/cadastro exigem telefone E.164 fictício (`+5591...`).
2. OTP gerado em `mock-otp-challenges` — código exibido em dev quando `HYDRORIVERS_EXPOSE_OTP_CODE` permitir.
3. Validação antes de concluir sessão/registro.
4. Mensagens: namespace `auth` em `messages/*.json`.

**Decisão:** nunca tratar OTP mock como segurança real em produção.

### 7.4 Role → experiência

| Role | Navegação | Dados |
|------|-----------|-------|
| `shipper` | Sem embarcações no nav; com criar carga | Minhas cargas por `shipperId` |
| `carrier` | Com embarcações; sem criar carga (padrão) | Minhas cargas atribuídas |
| `admin` | Tudo + admin + governo | Amplia cenários QA |

Implementação: `filterMainNavigationForUser`, `canSeeNavigationItem`, `roleCapabilities`.

### 7.5 Status da carga → visual e ações

**Marketplace (domínio `Cargo.status`):** `open`, `bidding`, `contracting`, `reserved`, `boarded`, `delivered` — badges via i18n `common.cargoStatus.*`.

**dev-v2 (visual local):** `transito`, `agendado`, `cotacao`, `atencao` — mapeamento **não** 1:1 com domínio — **Risco** na migração.

| Status dev-v2 | Badge | Ação sugerida no card |
|---------------|-------|------------------------|
| `transito` | Em trânsito | “Acompanhar” |
| `agendado` | Agendado | “Ver detalhes” |
| `cotacao` | Em cotação | “Acompanhar” |
| `atencao` | (label custom) | “Acompanhar” |

---

## 8. Mensagens e microcopy

Tom: **profissional, humano, direto**, vocabulário de operação logística (terminal, janela, atracação, corredor), sem jargão de software.

### 8.1 Já existentes no repo (reutilizar na migração)

| Contexto | Chave / origem | Texto (pt-BR) |
|----------|----------------|---------------|
| Lista vazia (lab) | `pages.mobileCargoListLab.emptyTitle` | Nenhuma carga disponível |
| Lista vazia lab desc | `...emptyDescription` | Quando novas operações entrarem… |
| Filtro sem resultado (lab) | `...emptyFilteredTitle` | Nenhum resultado |
| Filtro sem resultado desc | `...emptyFilteredDescription` | Ajuste a busca ou os filtros… |
| Busca geral | `common.emptyTitle` | Nenhuma carga encontrada |
| Busca geral desc | `common.emptyDescription` | Remova alguns filtros… |
| Minhas cargas vazias | `pages.myCargoes.emptyTitle` | Você ainda não tem cargas vinculadas… |
| OTP inválido | `auth.otpInvalid` | Código OTP não válido… |
| OTP expirado | `auth.otpExpired` | Este código expirou… |

### 8.2 Propostas para dev-v2 / gaps (**Proposto**)

Usar em i18n quando conectar dev-v2 ao product-shell:

| Contexto | Mensagem sugerida (pt-BR) |
|----------|---------------------------|
| Lista filtrada vazia (dev-v2 gap) | **Nenhuma carga neste recorte.** Ajuste os filtros ou limpe para ver todas as operações. |
| Erro ao carregar | **Não foi possível carregar as cargas.** Verifique sua conexão e tente de novo. |
| Carga criada | **Carga registrada.** Complete os documentos para publicar no marketplace. |
| Carga atualizada | **Alterações salvas.** |
| Carga removida/cancelada | **Carga cancelada.** Ela não aparecerá mais na sua lista ativa. |
| Filtros limpos | **Filtros redefinidos.** |
| Documento indisponível | **Documento ainda não disponível** para esta etapa da operação. |
| Jornada sem eventos | **Nenhum evento registrado ainda.** O rastreio aparecerá após o embarque. |
| Login lead | (existente) Telefone + OTP simulado |
| Permissões insuficientes | **Você não tem permissão** para esta ação. Troque de perfil ou fale com o administrador. |

### 8.3 dev-v2 hardcoded hoje (**Atual** — migrar para i18n)

Exemplos no componente: “Cargas”, “Buscar cargas...”, “Limpar filtros”, “Ver cargas”, “Acompanhar”, títulos de seção de filtros.

**Decisão:** ao sair do laboratório, **zero** string de produto hardcoded em TSX.

---

## 9. Design System e experiência

**Source of truth:** [`docs/design/hydririvers-design-system.md`](../design/hydririvers-design-system.md)  
**Quick reference:** [`docs/design/hydririvers-design-system-quick-reference.md`](../design/hydririvers-design-system-quick-reference.md)

### 9.1 Princípios obrigatórios

| Princípio | Aplicação |
|-----------|-----------|
| Dark premium + Light fiel | `data-theme="dark\|light"` no root da experiência |
| Glass/blur controlado | Sheets `variant="strong"`; sem neon |
| **Bubble Press** | Chips, botões de filtro, ações do sheet (140–160ms) |
| Mobile-first | Bottom nav + sheets; desktop = cockpit 3 colunas **Futuro** |
| Sass Modules | `*.module.scss` por feature; **não** `globals.scss` para UI de feature |
| Sem deps novas de UI | **Decisão** de projeto |

### 9.2 Aparência por superfície (dev-v2 alinhado ao DS)

| Superfície | DS | dev-v2 |
|------------|-----|--------|
| **CargoCard** | Hierarquia status > rota > ETA | **Atual** — tokens via SCSS module |
| **Chips** | `Chip` + Bubble Press | **Atual** — `FilterChipButton` |
| **IconButton** | Filtro, tema | **Atual** — `headerButton` |
| **BottomNav** | Mobile-only, item ativo com bubble | **Atual** — Cargas ativo |
| **BottomSheet** | Snap, drag, overlay | **Atual** — componente shared |
| **SearchField** | Ícone + campo 16px radius | **Atual** |
| **StatusBadge** | Tons por status | **Atual** — `data-status` |
| **Mapa** | `MapContainer` fake premium | **Futuro** no v2 — ver `/cargas/[id]/mapa` |
| **Painéis analíticos** | Só com propósito operacional | Governo/impacto/dashboard — não decorativos |

### 9.3 Fluxo oficial do DS (§8)

1. Lista de Cargas → 2. Filtros (sheet) → 3. Detalhe (sheet mobile / painel desktop)

dev-v2 implementa 1–3 em laboratório; produção mobile ainda split entre lab antigo e board desktop.

---

## 10. Telas futuras e evolução

Prioridade: **P0** bloqueia MVP embarcador mobile · **P1** alto valor · **P2** expansão · **P3** institucional.

| Tela / fluxo | Objetivo | Papel | Dados necessários | Ações principais | Dependências mock/API | Prioridade |
|--------------|----------|-------|-------------------|------------------|----------------------|------------|
| **Jornada / tracking** | Timeline operacional | Shipper, carrier | `trackingEvents`, checkpoints Hydroway | Ver eventos, ETA | `marketplace.mock`, `cargo-waterway-tracking.mock` | **P1** |
| **Documentos** | Prontidão legal | Shipper | `requiredDocuments`, `documentReadiness` | Anexar, validar | `userCargos.mock`, cargo domain | **P1** |
| **Custos** | Decisão econômica | Shipper, carrier | `targetPrice`, negociação | Ver proposta, aceitar | `negotiations` | **P1** |
| **Mapa da carga** | Contexto espacial | Todos | GeoJSON corredores, rota | Abrir mapa imersivo | `waterway-map/data`, operational layers | **P1** |
| **Nova carga** | Criar demanda | Shipper | Form + validação Zod | Publicar rascunho | `cargo.service`, write mock | **P0** pós-lista |
| **Minhas cargas** | Espelho privado | Shipper, carrier | `userCargos.mock` | Editar, publicar | Ownership rules | **P0** integrado |
| **Negociações** | Contratação | Shipper, carrier | `negotiations` | Propor, aceitar | API `/api/negociacoes` | **P2** |
| **Embarcações** | Frota | Carrier | `vessels` | Filtrar, detalhe | `marketplace.mock` | **P2** |
| **Governo** | Visão institucional | Admin/gov | Agregados, sem PII | Explorar corredores | Impact + gov mocks | **P3** |
| **Impacto** | Socioambiental | Shipper+, gov | `impact.mock` | Ver indicadores | Feature impact | **P3** |
| **Admin** | QA | Admin | Cenários | Reset, login-as | mock-mode | **P2** (já existe) |

---

## 11. Regressão e rollback

### 11.1 Regras obrigatórias (**Decisão**)

| Regra | Detalhe |
|-------|---------|
| Branch/checkpoint | Toda rodada visual grande: branch dedicada + commit/checkpoint antes de começar |
| Evidência | Screenshots antes/depois (375px e 390px para mobile) |
| Validações mínimas | `npm run lint`, `npm run typecheck`, `npm run check:i18n`, `npm run build` |
| Testes extras | Quando mexer em lógica, mocks, filtros, permissões ou fluxos críticos: `npm test`, `npm run test:unit`, `npm run test:mock-mode` conforme `AGENTS.md` |
| PRs focados | **Não** misturar docs amplas + visual + mock + comportamento sem necessidade |
| dev-v2 | Permanece **Laboratório** até fluxo validado e conectado aos mocks definitivos |
| Desktop vs mobile | **Não** mesmo PR para experiências separadas (`docs/workflows/codex-visual-iteration.md`) |

### 11.2 Rollback

1. Reverter commit da rodada visual.
2. Confirmar `git diff` sem alteração em `globals.scss`, `next-env.d.ts` acidental.
3. Reexecutar validações da seção 11.1.
4. Se mocks locais corrompidos: `scripts/reset-mock-data.mjs` (**Atual**).

### 11.3 Riscos conhecidos

| Risco | Mitigação |
|-------|-----------|
| dev-v2 diverge de `marketplace.mock` | PR dedicado “conectar filtros aos mocks definitivos” |
| Status dev-v2 ≠ domínio | Tabela de mapeamento + testes de filtro |
| Bottom nav morta confunde QA | Documentar como **Futuro** ou desabilitar visualmente |
| Lista vazia sem copy no v2 | Adicionar empty state antes de migração |

---

## 12. Próximos PRs recomendados

Sequência **pequena e revisável** (cada item = PR focado):

| PR | Título sugerido | Escopo | Objetivo |
|----|-----------------|--------|----------|
| **PR 1** | test: destravar cobertura mobile cargo / bottom-sheet | Apenas `tests/unit/**`, `vitest.config` se necessário | CI verde no trabalho atual |
| **PR 2** | docs: Business Flow Blueprint | **Somente** `docs/product/hydririvers-business-flow-blueprint.md` | Este documento — fonte de verdade de produto |
| **PR 3** | feat(dev-v2): alinhar visual ao HydriRivers DS oficial | `mobile-cargo-list-lab-v2` SCSS/TSX, tokens | Paridade DS sem mudar rotas prod |
| **PR 4** | feat(cargo): conectar dev-v2/lab aos mocks definitivos | `cargo-filter-options`, `cargoListService`, remover `CARGOES` inline | Uma lista, uma verdade |
| **PR 5** | feat(cargo): detalhe orientado a negócio (embarcador) | Sheet/página: `operationalNextStep`, documentos % | Valor embarcador |
| **PR 6** | feat(tracking): jornada MVP | `?view=jornada`, timeline mock | Fechar pergunta “onde está?” |
| **PR 7** | feat(cargo): documentos + custos MVP | Abas documentos/custos | Fechar publicação/contratação |
| **PR 8** | feat(cargo): migração controlada dev-v2 → `/cargas` mobile | Feature flag, shell mobile, i18n | Saída do laboratório |

**Decisão:** não executar PR 8 antes de PR 4 e empty/loading states.

---

## Apêndice A — Inventário de arquivos auditados

| Área | Caminhos |
|------|----------|
| Rotas app | `src/app/[locale]/**/page.tsx` |
| dev-v2 | `src/app/[locale]/dev-v2/**`, `mobile-cargo-list-lab-v2.tsx` |
| dev lab | `src/app/[locale]/dev/**` |
| Mocks cargo | `cargo-filter-options.mock.ts`, `publicCargos.mock.ts`, `myCargos.mock.ts` |
| Mocks core | `marketplace.mock.ts`, `auth.mock.ts`, `mock-db.ts` |
| Mapa | `features/waterway-map/**`, `waterway-tracking/data/*` |
| Auth/RBAC | `access-control.ts`, `navigation.ts`, `app-routes.ts` |
| DS | `docs/design/hydririvers-design-system*.md` |

---

## Apêndice B — Personas mock (referência rápida)

| id | role | Uso típico |
|----|------|------------|
| `u-shipper-1` | shipper | Cooperativa Açaí — minhas cargas |
| `u-shipper-2` | shipper | Segundo embarcador |
| `u-carrier-1` | carrier | Navega Norte — frota/oportunidades |
| `u-carrier-2` | carrier | Segundo transportador |
| `u-carrier-3` | carrier | Não aprovado — teste de bloqueio |
| `u-admin-1` | admin | QA e mock-mode |

---

*Documento gerado por auditoria de repositório. Atualizar quando PRs de migração alterarem rotas, mocks ou dev-v2.*
