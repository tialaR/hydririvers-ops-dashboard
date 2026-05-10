# Auditoria de excelência técnica: Next.js, React, arquitetura e automação

## 1. Resumo executivo

**Veredito geral:** parcialmente pronto, com risco técnico moderado e alguns pontos que ainda precisam estabilizar antes de uma evolução mais agressiva.

O HydroRivers já demonstra uma base forte de front-end moderno: Next.js App Router com `next-intl`, React 19, TypeScript estrito, feature-first architecture, mocks consistentes, documentação extensa, i18n em três idiomas, design system utilitário, QA Assistant e workflows de qualidade. Isso posiciona bem o projeto como portfólio técnico.

Os principais limites hoje não são de “falta de tecnologia”, mas de disciplina de fronteira e de operações: `build` ainda travando no ambiente, ausência de `proxy.ts`/`middleware.ts` real no código atual, ausência de `commitlint`/`husky`, observabilidade real ainda só documentada e automações de performance ainda proposicionais.

## 2. Stack real encontrada

| Dependência / ferramenta | Versão real | Estado |
| --- | --- | --- |
| `next` | `16.2.4` | Implementado |
| `react` | `19.0.0` | Implementado |
| `react-dom` | `19.0.0` | Implementado |
| `typescript` | `^5.7.2` | Implementado |
| `eslint` | `^9.17.0` | Implementado |
| Runner de testes | `vitest@^4.1.5` | Implementado |
| E2E | `@playwright/test@^1.59.1` | Implementado em base mínima |
| Validação | `zod@^4.4.3` | Implementado |
| Formulários | sem RHF como dependência | Parcial |
| i18n | `next-intl@^4.3.0` | Implementado |
| Analytics | `@vercel/analytics@^1.5.0` | Implementado |

Scripts relevantes:
- `dev`, `build`, `start`, `lint`, `typecheck`, `verify`, `verify:ci`, `audit:quality`, `audit:docs`, `check:i18n`, `check:i18n:hardcoded`, `audit:i18n`, `audit:i18n:rendered`, `check:onboarding`, `test`, `test:unit`, `test:integration`, `test:e2e`, `test:mock-mode`.

## 3. App Router e convenções Next.js

| Item | Estado | Evidência | Risco / recomendação |
| --- | --- | --- | --- |
| Estrutura `src/app` | Adequada | `src/app/[locale]`, `src/app/api`, `loading.tsx`, `not-found.tsx` | Boa base App Router |
| Layouts por segmento | Adequado | `src/app/[locale]/layout.tsx` | Mantém shell e providers no lugar certo |
| Root layout `src/app/layout.tsx` | Ausente no tree atual | `rg --files src/app` não listou arquivo raiz | Particularidade estrutural: o shell visível está no segmento `[locale]`. Vale revisar documentação para não criar expectativa errada |
| Segmento `[locale]` | Adequado | `core/i18n/routing.ts`, `next-intl/plugin` | Estratégia coerente |
| Server vs Client Components | Parcial | layout server; muitos componentes de shell e features com `use client` | Há bastante superfície client-side, mas é justificável por interatividade/overlays |
| `metadata` | Adequado | `generateMetadata` no locale layout | Bom uso |
| `loading.tsx` / `not-found.tsx` | Adequado | `src/app/[locale]/cargas/loading.tsx`, `not-found.tsx` | Cobertura básica existente |
| Route handlers | Adequado | `src/app/api/*/route.ts` | API mockada e coerente |
| Server Actions | Parcial | existe `publish-cargo-action.ts` | Boa direção; ainda não é padrão em todo formulário |
| `proxy.ts` / `middleware.ts` | Ausente no código atual | não encontrei arquivo na raiz | Docs ainda citam middleware/proxy como conceito legado/proposto; isso precisa ser alinhado para não confundir onboarding |
| Hydration mismatch | Risco mitigado, mas existente historicamente | `AdminChrome`, `ThemeProvider`, `LocaleSwitcher` usam `useSyncExternalStore` e eventos | Precisa de vigilância contínua em SSR/cliente |
| Browser APIs no render | Risco controlado | vários componentes usam `window/document/localStorage` com guards/client effects | Em geral correto, mas ainda sensível em shell/global components |
| `Date.now` / `Math.random` em render | Risco pontual | há usos em mocks/toasts/serviços legados | Não é predominante, mas exige disciplina |

## 4. React 19 e qualidade de componentes

| Item | Estado | Evidência | Leitura técnica |
| --- | --- | --- | --- |
| Componentes puros | Parcial | features são majoritariamente puras; shell global é mais complexo | Bom, mas há componentes “orquestradores” grandes |
| Hooks corretos | Adequado | `useAuthSession`, `useLockBodyScroll`, `useSyncExternalStore` | Uso consciente |
| Dependências de effects | Parcial | existem muitos effects em shell/overlays | Alguns são necessários; vale revisar dependências instáveis quando mexer |
| Estado derivado | Adequado | muita lógica é calculada a partir de props/dados | Boa direção |
| `useMemo` / `useCallback` | Adequado, sem exagero | usados onde há custo real | Não há culto ao memo |
| `useSyncExternalStore` | Adequado com ressalvas | notificações, auth, theme, locale UI | Importante manter snapshots estáveis |
| Providers | Adequado | `ThemeProvider`, `NextIntlClientProvider`, `ToastProvider` | Cadeia clara |
| `maximum update depth` | Historicamente presente | corrigido em `AdminChrome`/notifications/auth hooks, mas é uma área sensível | Monitorar regressões |
| Concurrent Rendering | Parcial | shell usa várias subscriptions/event listeners | Não há violação óbvia, mas a área é sensível |
| Inputs controlados | Parcial | auth/forms mesclam local state e schemas | Alguns fluxos ainda não usam RHF de forma homogênea |

## 5. Core Web Vitals e performance

| Item | Estado | Evidência | Recomendações |
| --- | --- | --- | --- |
| LCP | Parcial | hero/dashboard/boards grandes | manter imagens/fontes otimizadas |
| CLS | Adequado/parcial | tokens e layout shell ajudam; shell/overlays exigem cuidado | evitar reflows em popovers/bottom sheets |
| INP | Parcial | muitos overlays e handlers client-side | manter interações simples e evitar trabalho pesado no click |
| Font loading | Adequado | `Geist` com `display: 'swap'` | bom |
| Images | Adequado/parcial | `next/image` usado em shell/feature | revisar dimensões e prioridades das imagens hero |
| Lazy loading | Parcial | overlays/boards grandes existem | bons candidatos a dividir carregamento |
| Dynamic imports | Ausente/limitado | não há estratégia explícita | oportunidade para mapa/boards maiores se necessário |
| Bundle analyzer | Ausente | não encontrei script/ferramenta | recomendado como fase futura, não como falso positivo |
| Orçamento de perf | Ausente | não há guardrail real | documentado, mas não operacional |
| Workflow perf | Proposto/documentado | `docs/automation/performance-core-web-vitals-workflow.md` | bom roadmap, ainda não automatizado |

## 6. Arquitetura por responsabilidade de negócio

| Área | Estado atual | Problema | Recomendação | Prioridade |
| --- | --- | --- | --- | --- |
| `app` | Boa composição | shell muito concentrado no layout locale | manter server layout enxuto | Alta |
| `features` | Forte | algumas features ainda têm componentes grandes | dividir por subcapabilities | Média |
| `shared` | Boa, com risco de crescer demais | `shared` reúne UI, layout, routing, server, qa | manter disciplina de fronteira | Alta |
| `mock-mode` | Forte para QA | precisa continuar estável sem vazar para produção | manter como assistente QA, não como enfeite | Alta |
| `notifications` | Boa | depende de cache/eventos locais | manter contrato determinístico | Alta |
| `routing` | Boa | docs ainda falam em proxy/middleware | alinhar documentação com o estado real | Média |

## 7. SOLID, DRY, KISS, SRP e clean code

### Achados

- Forte reutilização de helpers, routing, types e mocks.
- Vários componentes cumprem SRP razoavelmente.
- Há duplicações menores em shell/global components por causa de desktop/mobile e overlays.
- Existem algumas abstrações de suporte com nomes bons e escopo claro.

### Riscos

- Shell global (`AdminChrome`, `AppHeader`, `LocaleSwitcher`, `ThemeToggle`) pode crescer demais.
- Alguns helpers de mock e auth ainda misturam persistência, normalização e evento.
- Alguns arquivos grandes indicam concentração de responsabilidades, especialmente em boards.

### Recomendação

- continuar refinando por feature e por subfeature;
- evitar “helpers genéricos” sem necessidade;
- preferir pequenos helpers locais antes de abstração global prematura.

## 8. Design system, primitives e camada HTML

| Item | Estado | Evidência | Recomendação |
| --- | --- | --- | --- |
| Primitives claras | Parcial/boa | `Button`, `Badge`, `BottomSheet`, `Card`, `Breadcrumb`, `HydroIcon`, `ThemeToggle`, `LocaleSwitcher` | manter e ampliar só quando houver repetição real |
| API de primitives | Boa | props pequenas e previsíveis | continuar simples |
| Acessibilidade | Boa | labels, aria, focus, dialogs, menus | manter como baseline |
| Tokens | Boa | `docs/design-system/tokens.md`, `z-index.ts` | centralizar mais apenas se surgir repetição real |
| Dark/light | Boa | `ThemeProvider` + tokens + docs | consistente com a identidade do produto |
| HTML layer | Boa/parcial | bastante composição com primitives | sem necessidade de megabiblioteca interna |

## 9. CSS Modules e estilos

| Item | Estado | Achados |
| --- | --- | --- |
| CSS Modules | Adequado | uso consistente por componente/feature |
| Escopo | Bom | styles próximos do componente |
| Estilos globais | Controlados | `src/app/globals.scss` concentra base |
| Tokens/tema | Bom | CSS vars + `data-theme` |
| Responsividade | Boa/parcial | mobile-first real, mas ainda precisa QA visual em overlays/mapa |
| Safe area / z-index | Bom | existe escala documentada |
| Duplicação visual | Baixa/moderada | shell/admin/overlays ainda replicam padrões |

## 10. Services, hooks e providers

| Item | Estado | Evidência | Risco |
| --- | --- | --- | --- |
| Services por feature | Bom | `auth.client`, `marketplace.service`, `notifications.client`, etc. | bom para trocar mock por API real |
| Hooks | Bom | `useAuthSession`, `useLockBodyScroll`, hooks de domínio | keep small |
| Providers | Bom | `ThemeProvider`, `NextIntlClientProvider`, `ToastProvider` | ordem faz sentido |
| SSR safety | Parcial | browser APIs sempre guardadas em client effects | manter disciplina |
| Persistência mock | Boa | `.mock-data` + localStorage + cookies | precisa seguir deterministicidade |
| Troca futura por API real | Boa | contratos e services já existem | preparado, mas não finalizado |

## 11. Mocks, persistência e Mock Mode QA Assistant

**Classificação:** `QA Assistant inicial` → já é útil para QA, mas ainda depende de manutenção para continuar consistente.

### Achados

- há catálogo de cenários;
- há dataset mockado por domínio;
- há persistência por usuário quando necessário;
- há docs próprios e suíte de testes focada;
- não parece um “enfeite visual”.

### Riscos

- crescer sem governança e virar segundo sistema de UI;
- gerar dados em render ou quebrar hydration;
- divergência entre mock e fluxo real.

### Recomendação

- manter determinismo por usuário/cenário;
- documentar claramente o que é mock e o que é comportamento real;
- usar ADR quando o Mock Mode influenciar fluxo/arquitetura.

## 12. i18n e linguagem humanizada

| Item | Estado | Evidência | Recomendação |
| --- | --- | --- | --- |
| Idiomas | Adequado | `pt-BR`, `en-US`, `es` | consistente |
| Chaves | Adequado | `check:i18n` passa | bom |
| Hardcoded visível | Reduzido | auditorias recentes documentam migrações | continuar caçando strings técnicas |
| Linguagem humanizada | Boa | docs/features/ADRs e UI seguem tom operacional | manter para público leigo |
| Mock content | Boa | `translateMock` e docs de linguagem | bom padrão |

## 13. Testes

| Tipo | Estado | Evidência |
| --- | --- | --- |
| Unitários | Bom | Vitest em helpers, mocks, scenarios, notifications |
| Integração | Bom | routes auth/cargas/mock-mode/negotiations |
| E2E | Parcial | Playwright existe no package, mas a automação completa não está claramente institucionalizada |
| Hooks/services | Bom | várias coberturas unitárias |
| UI/primitives | Parcial | cobertura cresce, mas ainda há áreas que pedem QA manual |
| i18n | Bom | script dedicado |
| Acessibilidade | Parcial | principalmente documentada + alguma cobertura pontual |

## 14. Server Components e Server Actions

| Item | Estado | Leitura |
| --- | --- | --- |
| Server Components | Adequado | layout/rotas por padrão server |
| Client Components | Necessários | shell, overlays, auth, tema, locale, forms |
| Server Actions | Parcial | existe ação de publicação de carga, mas não é padrão em toda escrita |
| Onde faria sentido ampliar | Formulários críticos e mutations simples | com cautela |
| Risco de ir longe demais | Alto | não vale migrar tudo sem necessidade |

## 15. Proxy, telemetry e analytics

| Item | Estado | Evidência | Observação |
| --- | --- | --- | --- |
| Proxy/middleware real | Ausente no código atual | não há `proxy.ts`/`middleware.ts` | documentação ainda cita o conceito; precisa alinhamento |
| Telemetria do Next | Parcial | `@vercel/analytics` no layout | cobertura mínima |
| GA4 | Ausente | não encontrei implementação real | apenas proposta/documentação |
| Web Vitals | Ausente | sem workflow automatizado real | documentado como futuro |
| Logging client-side | Parcial | dev scenario/use-case logger | útil para QA/dev, não telemetria de produto |
| Privacidade/consentimento | Parcial | documentação existente | sem sistema de consentimento real |

## 16. ADRs

### Estado

- Pasta `docs/adr` existe e está bem indexada.
- Há template e ADRs com numeração.
- As decisões principais do produto e da arquitetura já estão documentadas.

### Lacunas

- algumas docs ainda usam linguagem “middleware”/“proxy” como conceito histórico;
- há ADRs que são mais roadmap/proposta do que decisão plenamente implementada;
- seria útil revisar periodicamente se os ADRs continuam refletindo o código.

## 17. Workflows, CI/CD e automações

| Item | Estado | Evidência | Risco |
| --- | --- | --- | --- |
| CI | Bom | `.github/workflows/ci.yml` roda docs, lint, typecheck, i18n, test, build | depende do build estável |
| PR quality | Bom | `.github/workflows/pr-quality.yml` | consistente |
| Docs audit | Bom | scripts e workflow | bom para onboarding |
| Perf workflow | Documentado | docs/automation/performance-core-web-vitals-workflow.md | ainda não operacional |
| Observability workflow | Documentado | docs/automation/observability-workflow.md | ainda sem integração real |
| IA responsável | Documentado | docs/automation/ai-assisted-development-workflow.md | bom para portfólio |

## 18. Conventional commits, branches e commitlint

**Achado principal:** não encontrei `commitlint`, `husky`, `lint-staged` nem política de branch/commit automatizada no código do repositório.

**Recomendação incremental:** documentar a convenção no README/ONBOARDING primeiro, depois avaliar `commitlint` + PR title check em workflow separado.

## 19. README, docs e onboarding

### Estado

- há documentação rica em `docs/`;
- há onboarding;
- há arquitetura, features, automação, ADRs e audits;
- a documentação é um ponto forte real do projeto.

### O que falta

- consolidar algumas páginas antigas de roadmap para evitar conflito entre “implementado”, “proposto” e “histórico”;
- garantir que docs de middleware/proxy reflitam o estado atual do código;
- manter o índice de docs curto o suficiente para onboarding rápido.

## 20. Tabela priorizada de ações

| Prioridade | Área | Problema | Impacto | Esforço | Risco | Recomendação | Arquivos/pastas afetados | Precisa ADR? | Precisa teste? | Bloqueia release? | Quick win? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Build | `next build` ainda trava neste ambiente | Alto | Médio | Médio | destravar build e isolar causa | `package.json`, `src/app`, config | Não | Sim | Sim | Não |
| 2 | Proxy/Middleware | ausência de arquivo real vs docs que ainda citam middleware | Médio | Baixo | Baixo | alinhar docs ao estado real | `docs/*`, routing | Sim | Sim | Não | Sim |
| 3 | Auth/session | shell sensível a hidratação e sessão | Alto | Médio | Médio | manter snapshot estável e SSR/cliente idênticos | `auth`, `admin-chrome` | Não | Sim | Sim | Não |
| 4 | Observability | GA4/Web Vitals ainda não operacionais | Médio | Médio | Baixo | manter como proposta documentada | `docs/automation`, observability | Sim | Não | Não | Sim |
| 5 | Commit discipline | sem commitlint/husky | Médio | Baixo | Baixo | documentar padrão e depois automatizar | root docs/workflows | Opcional | Sim | Não | Sim |
| 6 | Forms | RHF não homogêneo | Médio | Médio | Baixo | migrar formulários críticos só quando houver ganho real | `features/auth`, `cargo-market` | Não | Sim | Não | Médio |
| 7 | Performance | sem workflow de Lighthouse/bundle analyzer real | Médio | Médio | Baixo | adicionar tooling só com decisão explícita | `docs/automation` | Sim | Não | Não | Sim |
| 8 | Mock Mode | deve continuar QA Assistant, não segundo app | Médio | Médio | Médio | manter catálogo e determinismo | `shared/ui/mock-mode`, tests | Sim | Sim | Não | Não |

## 21. Roadmap recomendado

### Imediato

- destravar/entender o `build`;
- alinhar documentação “proxy/middleware” com o estado real;
- manter estabilidade de SSR/hidratação no shell.

### Curto prazo

- padronizar convenção de commits/branches no onboarding;
- fechar cobertura de testes para áreas sensíveis de shell/mock-mode;
- reduzir duplicação de lógica em shell global.

### Médio prazo

- automatizar performance com ferramenta real quando houver decisão explícita;
- ampliar observabilidade com produto/privacidade em mente;
- homogenezar RHF apenas onde há benefício claro.

### Longo prazo

- integrar backend real sem quebrar contratos de domínio;
- evoluir telemetria/analytics com consentimento;
- consolidar E2E como guardrail de release.

## 22. Go / no-go

**Go, com ressalvas.** O projeto está em bom patamar para portfólio e evolução incremental, mas eu não trataria como “estável o suficiente para expansão agressiva” enquanto o `build` continuar com esse comportamento recorrente e enquanto alguns documentos ainda falarem em middleware/proxy como se existisse no código atual.
