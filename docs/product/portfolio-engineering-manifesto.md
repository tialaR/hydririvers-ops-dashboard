# Portfolio Engineering Manifesto do HydroRivers Dashboard

O HydroRivers Dashboard foi pensado para ir além de um dashboard bonito. Ele funciona como uma peça de portfólio técnico e de produto: demonstra como uma interface de front-end pode ser visualmente forte, operacionalmente útil e arquitetonicamente sustentável ao mesmo tempo.

## 1. Visão geral

Este projeto comunica uma maturidade que vai além da camada visual. Ele mostra como uma programadora pode pensar em:

- produto, não só em tela;
- organização de código, não só em componentes;
- experiência mobile real, não só responsividade básica;
- automação responsável, não só scripts soltos;
- documentação viva, não só comentários espalhados;
- evolução futura, sem fingir que tudo já existe.

O objetivo é transmitir a ideia de uma aplicação que foi construída com visão de longo prazo. A interface é importante, mas ela não está sozinha: ela é sustentada por rotas bem separadas, features por domínio, shared UI controlado, i18n consistente, BottomSheets padronizados, testes, ADRs e workflows documentados.

Em outras palavras, o projeto quer comunicar maturidade técnica com clareza de produto. Ele não tenta parecer um protótipo improvisado; tenta parecer uma base sólida que poderia sobreviver ao crescimento da operação.

## 2. Princípios

### Automação responsável

Automação é apoio, não substituto de entendimento. O projeto trata scripts, workflows e auditorias como rede de segurança: eles ajudam a detectar regressões e inconsistências, mas não devem esconder decisões sem validação humana.

### Mobile-first

A experiência é desenhada para funcionar bem em campo, em telas menores e sob restrições reais de interação. BottomSheets, navegação compacta, safe-area, cards legíveis e mapas pensados para mobile fazem parte da base.

### Acessibilidade

Semântica, foco visível, `aria-*`, contraste e navegação por teclado não são extras. Eles fazem parte da experiência mínima esperada para um produto que quer ser sério e confiável.

### Performance

Performance não aparece só como “velocidade”, mas como escolhas de arquitetura: componentes pesados isolados, overlays gerenciados com cuidado, preocupação com CLS, bundle e carregamento progressivo.

### Clean Code, SOLID, DRY, KISS e SRP

O projeto tenta manter funções pequenas, responsabilidades claras e repetição sob controle. A regra é simples: quando a abstração ajuda a manutenção, ela entra; quando vira peso, ela sai.

### Documentação viva

Decisões importantes são registradas em ADRs, e a documentação não serve apenas para encher pasta. Ela orienta onboarding, auditoria e evolução segura.

### IA como copiloto, não piloto automático

IA entra para ajudar a mapear, resumir, auditar e propor. Mas a revisão humana continua obrigatória, especialmente quando há impacto em regras de negócio, UX, acessibilidade e segurança.

### Design system como linguagem comum

O Design System não é decoração. Ele é a gramática visual e funcional que mantém Dashboard, Cargas, Minhas Cargas, Notificações, Mapa e BottomSheets dentro do mesmo idioma.

### Telemetria com privacidade

Qualquer rastreamento futuro precisa ser útil, mínimo e responsável. O projeto não promete métricas de produto que ainda não estejam realmente implementadas.

### CI/CD como rede de segurança

Qualidade não pode depender só de memória humana. Typecheck, lint, i18n, testes e build precisam funcionar como filtros repetíveis, mesmo que o build local ainda seja um ponto de atenção no ambiente atual.

## 3. Como isso aparece no projeto

### Rotas organizadas

O projeto usa Next.js App Router com locale na URL. Isso deixa claro o papel de cada rota e facilita a separação entre landing, dashboard, cargas, minhas cargas, rastreio, negociações, impacto, governo, auth, perfil e páginas auxiliares.

### Features separadas

Cada domínio relevante tem sua própria feature. Isso reduz acoplamento e ajuda a manter regras de negócio próximas de onde elas são usadas.

### Shared UI

Componentes genéricos, layout compartilhado e utilitários comuns ficam em `shared`. A regra é não transformar essa pasta em um depósito sem fronteira.

### Services

Os services carregam a responsabilidade pelos dados e contratos do domínio. A UI consome services, não mocks crus, sempre que faz sentido.

### Hooks

Hooks orquestram estado e comportamento, especialmente quando há interação entre UI, dados e efeitos.

### i18n

As rotas e mensagens trabalham com `pt-BR`, `en` e `es`. A aplicação não depende de texto solto espalhado pela UI para fazer sentido em outro idioma.

### Tema

O tema dark/light é parte da proposta visual e não um detalhe opcional. A aplicação precisa preservar identidade no dark mode e continuar legível no light mode.

### BottomSheets

Os BottomSheets são uma peça central da experiência mobile. Eles ajudam a encaixar notificações, filtros, busca e ações auxiliares sem quebrar a navegação principal.

### QA mobile

A aplicação é pensada para ser validada em breakpoints pequenos, com atenção a overflow, safe-area, menus e overlays.

### Testes

A suíte de testes existe para proteger o que é crítico: rotas, serviços, validações, i18n e fluxos principais.

### Workflows

Scripts e workflows de qualidade ajudam a manter consistência entre desenvolvimento local, auditorias e PRs.

### ADRs

As decisões arquiteturais importantes estão registradas. Isso ajuda a entender o “porquê” por trás do código.

### Onboarding

O onboarding documenta como entrar no projeto, como navegar pela estrutura e como trabalhar sem quebrar o que já existe.

## 4. O que isso comunica

Para recrutadores, stakeholders ou avaliadores, o HydroRivers Dashboard comunica mais do que domínio técnico isolado.

Ele mostra:

- capacidade de pensar produto de ponta a ponta;
- habilidade para estruturar um front-end moderno com fronteiras claras;
- maturidade para tratar acessibilidade, performance e i18n como parte do produto;
- preocupação com manutenção e evolução, não só com entrega rápida;
- visão prática sobre automação responsável e uso de IA;
- conforto para registrar decisões e sustentar o trabalho com documentação;
- cuidado com a experiência real de quem usa, especialmente em mobile.

O resultado é uma narrativa de engenharia: alguém que não apenas codifica telas, mas cria um sistema que pode crescer com responsabilidade.

## 5. Lacunas honestas

O manifesto precisa ser honesto sobre o estado atual do projeto.

Ainda há partes que são mock e não backend real. Algumas áreas dependem de serviços locais, cenários mockados e persistência simulada. Isso é útil para o portfólio e para o estágio atual do produto, mas não deve ser vendido como produção final.

Ainda não existe monitoramento real totalmente operacionalizado. Há documentação e intenção de observabilidade, mas isso não substitui uma configuração completa de analytics, logging e métricas em ambiente real.

Parte da experiência ainda depende de setup externo ou de decisões futuras, como:

- implantação de backend real;
- monitoramento com ferramenta escolhida;
- automações de performance com tooling específico;
- consolidação completa de algumas migrações de formulários e tipos;
- destravamento definitivo do `build` no ambiente local.

Também existem compatibilidades e shims legados que foram preservados de propósito. Isso é uma decisão de segurança, não um sinal de limpeza final concluída.

## 6. Roadmap de evolução

### Curto prazo

- manter a consistência entre docs, ADRs e código;
- fechar as últimas arestas de formulários, i18n e QA mobile;
- continuar reduzindo duplicação sem quebrar compatibilidade;
- estabilizar o build no ambiente local.

### Médio prazo

- consolidar workflows automatizados de qualidade;
- ampliar observabilidade com escopo claro e respeitando privacidade;
- refinar performance com medições reais;
- avançar na substituição de mocks por contratos reais onde fizer sentido.

### Longo prazo

- evoluir para backend e telemetria realmente integrados;
- amadurecer pipelines de release, performance e monitoramento;
- manter a documentação viva como parte do fluxo normal do time;
- usar o projeto como vitrine de engenharia de front-end sustentável, não como demo descartável.

## Conclusão

O HydroRivers Dashboard demonstra uma forma madura de construir front-end: com arquitetura legível, experiência mobile séria, documentação ativa, automação responsável e visão de futuro. Ele não promete perfeição. Ele mostra disciplina.

Esse é o ponto mais forte do projeto: ele comunica que qualidade não é um acidente. É uma decisão repetida em cada camada da entrega.
