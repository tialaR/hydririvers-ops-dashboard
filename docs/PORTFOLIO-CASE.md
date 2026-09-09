# HydroRivers — case técnico de portfólio

## Resumo

HydroRivers é uma experiência frontend para coordenação de cargas em corredores hidroviários brasileiros. O recorte demonstrável acompanha uma **Embarcadora** da entrada no produto à leitura e ação sobre uma operação: lista, filtros, detalhe, rota, ETA, mapa, timeline, documentos, riscos, negociação e feedback.

O produto é deliberadamente **mock-first**. Usuários, cargas e mudanças de estado são fictícios e determinísticos. O objetivo deste ciclo é provar capacidade de produto e engenharia frontend sem apresentar banco, autenticação ou integrações externas como se estivessem concluídos.

## Problema de produto

Uma pessoa responsável por embarques precisa responder rapidamente:

- quais cargas estão em trânsito ou exigem atenção;
- onde a operação está e qual é sua previsão;
- quais riscos e pendências documentais afetam o fluxo;
- qual ação pode ser tomada agora;
- se a ação realmente mudou o estado da operação.

A interface reúne essas respostas em uma jornada contínua, responsiva e localizada, reduzindo a dependência de telas desconectadas e interpretação técnica de dados brutos.

## Jornada comprovada

| Etapa | Evidência no produto |
|---|---|
| Primeiro acesso | `/` localiza para `pt-BR` e oferece entrada direta na demonstração. |
| Sessão | Endpoint mock com allowlist cria cookie; rota privada sem sessão redireciona ao login. |
| Visão operacional | “Minhas Cargas” apresenta resumo, indicadores, risco e atualização. |
| Investigação | Busca, filtros e detalhe conectam a lista aos sinais da carga. |
| Contexto | Rota/ETA, mapa, timeline, documentos, riscos e negociação estão navegáveis. |
| Ação e feedback | Resolver uma pendência exige confirmação e atualiza o estado exibido. |

## Arquitetura defendível

- **App Router** compõe páginas e Route Handlers, mantendo Server Components como padrão.
- **Feature folders** concentram domínio, aplicação e apresentação por capacidade.
- **Design System** possui owners semânticos; adapters do produto mantêm layout e materiais sem recriar contratos básicos.
- **Mock server-side** preserva contratos substituíveis e permite mutações reais dentro da demonstração.
- **i18n** cobre `pt-BR`, `en-US` e `es`, com paridade automatizada.
- **Sessão mock** usa cookie e guardas; entrada direta só aceita usuários seed allowlisted e depende de flag em production build.

## Estratégia de qualidade

| Gate | Responsabilidade |
|---|---|
| CI | onboarding, docs, lint, TypeScript, i18n, testes, mock mode e build Next.js. |
| PR Quality | verificação agregada em todo pull request. |
| Visual Quality | browser real, quatro viewports, Light/Dark, três idiomas, jornada crítica, screenshots e pixel-diff estável. |
| Storybook | contratos, estados e acessibilidade dos componentes e padrões operacionais. |

O pixel-diff é reservado a superfícies determinísticas. O mapa é dinâmico e, portanto, permanece coberto por navegação, assertions de integridade e screenshot de evidência — não por comparação pixel a pixel frágil.

## Decisões e trade-offs

**Por que mock mode?** Para tornar o fluxo clonável e verificável sem credenciais externas, custo de infraestrutura ou dependência de serviços instáveis. O trade-off é explícito: não prova segurança ou persistência de produção.

**Por que uma persona?** Profundidade demonstrável tem mais valor que várias personas incompletas. O ciclo atual fecha a Embarcadora; as demais superfícies existentes não são apresentadas como jornadas equivalentes.

**Por que owners semânticos + adapters?** Acessibilidade e comportamento básico permanecem consistentes, enquanto materiais, densidade e composição continuam adequados ao contexto operacional.

**Por que baseline seletivo?** Um gate visual útil precisa detectar regressão real. Conteúdo dinâmico, especialmente tiles de mapa, não deve gerar ruído que normalize falhas.

## Limites honestos

Não implementados neste ciclo: banco real, Supabase, autenticação real, integrações logísticas, posição/ETA em tempo real, documentos jurídicos, deploy público final e hardening enterprise. Esses itens pertencem a ciclos posteriores e não são necessários para avaliar a experiência frontend demonstrável.

## Resultado

O HydroRivers demonstra trabalho de frontend orientado a produto: uma jornada operacional coerente, estados que mudam, responsividade, temas, internacionalização, acessibilidade essencial, Design System, Storybook e gates reproduzíveis. A defesa técnica não depende de explicar o que “deveria funcionar”; o fluxo e suas evidências estão executáveis no repositório.
