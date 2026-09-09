# Operation Zero Redemoinho — governança arquitetural

**Objetivo:** fechar o cadeado arquitetural do HydriRivers antes das próximas implementações de fluxo. O projeto **não** pode criar 3, 4 ou 5 padrões paralelos de UI, tokens, componentes, mocks, i18n, labs, scripts ou docs.

**Escopo desta política:** agentes, regras Cursor, docs de agentes e workflows. Código de produção segue estas regras na implementação; violações bloqueiam 🟢 no Captain closeout.

**Referências:** `AGENTS.md`, `docs/agents/AGENTS-TASK-ROUTER.md`, `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`, `.cursor/rules/hydri-zero-redemoinho.mdc`, `docs/adr/0034-operation-zero-redemoinho-governance.md`.

---

## 1. Zero Redemoinho Architecture Gate (obrigatório antes de implementar)

Antes de criar arquivo, componente, token, mock, rota de lab, script ou doc:

1. **Buscar padrão existente** — componente, token, mock, doc, fluxo ou helper equivalente no escopo correto (`feature`, `shared`, `docs/agents`, `docs/adr`).
2. **Se existir → reutilizar** — estender o padrão canônico; não duplicar localmente.
3. **Se não existir → criar padrão documentado** — registrar decisão em doc/ADR quando aplicável; nomear tokens e arquivos no padrão oficial.
4. **Proibido:** duplicata local sem justificativa explícita no router/proof.
5. **Proibido:** *temporary permanent code* — código descartável que permanece no tree após validação/PR.

Registrar resultado em **Pattern reuse audit** no `HYDRI_IMPLEMENTATION_PROOF`.

---

## 2. Tokens obrigatórios (`--hy-*`)

| Regra | Detalhe |
|-------|---------|
| Valores visuais reutilizáveis | Não podem ficar soltos (hex, px, ms, blur, opacity) quando representam padrão de componente |
| Escopo | Cores, espaçamentos, blur, radius, shadow, duração, easing, z-index, sizes, opacidades |
| Prefixo novo | **`--hy-*`** obrigatório |
| Formato componente | **`--hy-<component>-<property>`** (ex.: `--hy-icon-button-press-scale`) |
| Legado tocado | Migrar para `--hy-*` quando seguro; senão documentar follow-up no proof |
| Paleta global | `--hx-*` permanece para tema global — distinto de tokens de componente |

Ver `docs/theme.md` e `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md` → **Design tokens**.

---

## 3. Magic numbers proibidos

- Magic numbers **não** podem ficar espalhados em TS/TSX/Sass quando são recorrentes ou semânticos.
- Valores recorrentes → constantes nomeadas ou tokens CSS.
- Exceções pequenas e locais → nome ou comentário claro no código.
- **Nomear obrigatoriamente:** durações, delays, thresholds, offsets, z-index, breakpoints, heights, spacing recorrentes.

Classificação router: `magic-number-hygiene` quando o task cria/toca literais numéricos em código ou estilo.

---

## 4. Strings hardcoded proibidas

- Strings de UI → **next-intl** / `docs/i18n.md`.
- Novas chaves → **pt-BR**, **en-US**, **es** (ou `es-ES` conforme projeto).
- Rodar **`npm run check:i18n`** antes de 🟢.
- **Proibido hardcode:** placeholders, labels, `aria-label`, empty states, errors, CTAs, sheet titles.
- **Exceção:** `data-testid` e atributos técnicos de teste.

Classificação router: `i18n` (ou `hardcoded-string-hygiene` quando só auditoria de copy).

---

## 5. Kebab-case obrigatório

- Todo arquivo/pasta **novo** → **kebab-case** (`icon-button.tsx`, `use-bottom-nav-indicator.ts`).
- Arquivo/pasta **tocado** fora do padrão → migrar quando seguro; atualizar imports, barrels, testes, docs.
- **Exports React** podem permanecer PascalCase (`export function IconButton`).
- **Proibido:** novos arquivos PascalCase como `IconButton.tsx`.
- **Proibido:** mass rename sem aprovação explícita.

Classificação router: `naming-hygiene`.

---

## 6. Sass / CSS Modules

- Estilos novos de componente → **`.module.sass`** (preferido).
- Ao tocar **`.module.scss`** de componente → avaliar migração para `.module.sass` quando seguro.
- **Não** usar `globals.scss` para UI de feature/componente.
- **Não** usar `!important`.
- **Não** criar CSS global para resolver problema local.

---

## 7. Component architecture

- Componentes visuais → **burros/semânticos** (markup, ARIA, classes, `data-*`).
- Lógica de press, timers, measurements, resize, derived state, keyboard → **hooks/helpers** no mesmo escopo.
- **Não** usar `querySelector` quando refs resolvem.
- **Não** usar `document.documentElement` para CSS vars locais de componente.
- Preservar **React 19** e **Next.js 16 App Router** — evitar misuse estilo SPA.
- **Mobile e desktop** são experiências separadas; mudança em um não pode quebrar o outro.

Ver `.cursor/rules/hydri-ui-architecture.mdc`.

---

## 8. Feature ownership

- Componentes de feature → dentro de `src/features/<domain>/`.
- `src/shared/` → **somente** itens com prova de reutilização entre domínios.
- **Proibido:** mover feature para shared sem prova; shared dependendo de regra específica de uma feature.
- Features possuem mocks, services, hooks, domain, models, tests e styles **próprios**.

Ver `docs/feature-scope-audit.md`, `docs/ARCHITECTURE.md`.

Classificação router: `feature-boundary`.

---

## 9. Mocks e domínio

- Mocks refletem **personas** e **regras de negócio** (`docs/business-rules.md`).
- Preservar **mock-mode auth**; phone number como identificador único em dev.
- Roles: embarcador, transportador/operador, operador portuário, admin, etc.
- Fluxos novos devem explicar **valor para a persona** (não só UI técnica).

Classificação router: `mock-mode`, `cargo-domain`, `auth` conforme escopo.

---

## 10. Next.js 16 / React 19

- Preservar **App Router** e rotas `/[locale]`.
- **Não** render nondeterminístico: sem `Date.now()` / `Math.random()` em render.
- Server/client boundaries corretas.
- Ao tocar cache, server action, route handler, metadata ou layout → ler docs internas do domínio.
- **Não** inventar proxy/middleware só para testar UI sem autorização de produto.

---

## 11. Core Web Vitals e custo cognitivo

- UI mobile: densidade, hierarquia, tamanho de toque (≥44px), scroll, safe-area, foco visual.
- **Não** adicionar animação que atrapalhe a tarefa principal.
- Motion: perceptível, curto, consistente; respeitar **`prefers-reduced-motion`**.

Ver `docs/mobile-guidelines.md`, `docs/agents/AGENTS-UI-MOBILE-STANDARDS.md`.

---

## 12. UI Visual Lab

- Lab é **temporário por padrão**.
- Lab **permanente** só com autorização explícita do usuário.
- **Não** criar teste de lab por padrão — só se usuário pedir, fluxo completo, integração ou alto risco.
- Lab validado → **remover antes de PR**, salvo autorização para manter.
- **Glass/transparency:** fundo branco **não** valida transparência — exige fundo colorido/rolável.

Ver `docs/agents/AGENTS-WORKFLOW.md` → **UI Visual Lab**.

Classificação router: `ui-lab`, `temporary-lab`, `visual-regression`.

---

## 13. Transparent / glass auto-detection

**Auto-classificar `glass-ui`** quando o task toca sinais de transparência/vidro:

`backdrop-filter`, `rgba` com alpha, `transparent`, `blur`, `glow`, `rim`, `surface`, `glass`, `frosted`, `bubble`, `conic-gradient`, `radial-gradient`, `--hy-*-glass-*`, `--hy-*-surface`, `--hy-*-rim`, `--hy-*-glow`.

**Exigência:** validação com fundo **colorido e rolável** e elementos passando atrás do controle. Sem isso → status máximo **🟡** no closeout.

---

## 14. Documentation hygiene

- Docs, workflows, agents, README, ADRs, scripts e rules **não** podem citar arquivos/remover rotas mortas.
- Remover componente/rota/script → atualizar docs relacionadas no mesmo PR/rodada quando possível.
- Decisão técnica nova → criar/atualizar **ADR** em `docs/adr/` quando aplicável.

### Imagens aprovadas de fluxo (`Hydri Persona Flow Diagram`)

- Imagens aprovadas de fluxo (persona ou técnico) ficam em **`docs/product/flows/`** com `.md` irmão no mesmo diretório.
- São **documentação de produto/design** — não lab, não `output/`, não screenshot descartável.
- Agentes devem **consultar** docs e imagens antes de alterar rota, fluxo ou componentes representados (ver `docs/agents/AGENTS-TASK-ROUTER.md` → **Product flow documentation gate**).
- Não substituem i18n, testes ou mocks — orientam intenção, hierarquia, estados e valor.
- Alteração de comportamento representado na imagem → atualizar `.md` e avaliar nova PNG aprovada.

Padrão visual: `docs/design/hydri-persona-flow-diagram.md` → **Imagens aprovadas como fonte documental**.

Classificação router: `doc-hygiene`.

---

## 15. Implementation Proof — campos Zero Redemoinho

Toda tarefa de **implementação** deve preencher os campos em `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md` → **Operation Zero Redemoinho proof fields**.

---

## 16. Captain closeout — 🟢 proibido quando

| Condição | Closeout |
|----------|----------|
| Token novo fora de `--hy-*` | 🔴 |
| String UI hardcoded nova | 🔴 |
| Arquivo/pasta novo fora de kebab-case | 🔴 |
| Componente com lógica indevida no corpo | 🔴 |
| Lab/teste de lab sem autorização/justificativa | 🟡 mínimo; 🔴 se versionado em CI |
| Código morto ou lab temporário no tree | 🔴 |
| Docs/scripts apontando para arquivo removido | 🔴 |
| Invasão de fronteira feature/shared | 🔴 |
| Fluxo de negócio sem valor para persona | 🟡 mínimo |
| Tarefa altera `/minhas-cargas` ou fluxo representado sem consultar docs/imagens aprovados | 🔴 |
| Comportamento da imagem aprovada muda sem atualizar documentação | 🟡 mínimo; 🔴 se regressão visível |
| Imagem aprovada salva em `output/`, `lab/` ou `public/` sem autorização | 🔴 |
| Imagem aprovada tratada como screenshot descartável | 🔴 |
| `lint` / `typecheck` / `check:i18n` não rodados quando aplicável | 🔴 |

---

## Validação baseline (implementação)

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

Docs-only que alteram comportamento de agentes: rodar baseline quando tooling aplicável; registrar no proof.
