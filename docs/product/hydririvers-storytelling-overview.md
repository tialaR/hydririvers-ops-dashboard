# HydroRivers Dashboard

HydroRivers é uma plataforma operacional para logística hidroviária. Ela existe para tirar a operação da planilha, da conversa dispersa e da memória individual, e colocá-la em um ambiente onde cargas, embarcações, negociações, rastreio, impacto e governança convivem no mesmo painel.

O problema que a aplicação enfrenta é conhecido por qualquer operação que dependa de rios, terminais, janelas de embarque e documentação: a informação chega tarde, chega fragmentada ou chega no formato errado. O embarcador quer saber se a carga vai sair. O transportador quer descobrir se a embarcação está apta e se a negociação está andando. O operador precisa acompanhar exceções, documentos, alertas e previsão. Já o governo e áreas de inteligência precisam olhar o sistema como uma rede de indicadores, não como uma lista solta de embarques.

HydroRivers organiza tudo isso em uma experiência mobile-first e com linguagem humana. O dashboard não fala como um sistema bancário ou uma planilha de engenharia; ele fala como uma operação viva. A plataforma usa dark mode sofisticado, tons aqua/teal para indicar ação e estado operacional, e dourado apenas como destaque. Em telas menores, os controles viram sheets, navs compactas e mapas pensados para toque.

## A história do produto

Imagine uma cooperativa no interior da Amazônia. Ela precisa publicar uma carga refrigerada, encontrar uma embarcação compatível, acompanhar a negociação, validar documentos e monitorar o trecho do rio até a chegada. Em outro lado, um transportador quer enxergar quais cargas cabem no seu perfil operacional, quais exigem cadeia fria, quais dependem de conectividade baixa e quais estão prontas para embarque. Um terceiro personagem, o analista público, quer ver padrões: quais corredores estão ativos, onde há risco documental, onde a sazonalidade afeta a rota e qual o impacto ambiental de mover a carga por água em vez de rodovia.

HydroRivers foi desenhado para esses três mundos sem misturá-los:

- o mundo da demanda pública e das cargas do mercado;
- o mundo particular de “Minhas cargas”, onde o usuário vê apenas o que lhe pertence ou está vinculado a ele;
- o mundo operacional de rastreio, embarcações, impacto e governança.

O fluxo começa no painel. O dashboard mostra o estado geral da operação: cargas abertas, negociações ativas, embarcações disponíveis, linha do tempo de rastreio e prioridades operacionais. Ele serve para responder rapidamente perguntas como “o que está acontecendo agora?” e “onde está o risco?”. A página vive em `src/app/[locale]/dashboard/page.tsx` e usa o componente `OperationsBoard`, que concentra a visão multiaba da operação.

Depois vem a jornada da carga. Em `Cargas`, o usuário enxerga o marketplace operacional, com cargas públicas e critérios de filtragem. Em `Minhas cargas`, o mesmo universo é recortado por identidade: o embarcador vê suas próprias cargas; o transportador vê o que está ligado à sua operação. Essa separação evita confundir vitrine pública com carteira pessoal.

Ao abrir uma carga específica, a pessoa encontra o detalhe operacional: rota, cadeia fria, documentação, riscos, status e um formulário de proposta quando a negociação está aberta. A carga deixa de ser apenas um card e vira um caso operacional concreto.

Na negociação, o sistema mostra o estágio comercial e operacional do acordo. O usuário consegue acompanhar quem está participando, qual o valor, quais documentos estão envolvidos e qual é o próximo passo. Isso é importante porque em logística hidroviária a negociação não é só preço; é janela, compatibilidade, evidência documental e aceite operacional.

O rastreio fecha a história. O usuário acompanha o deslocamento e os eventos operacionais com linha do tempo, indicadores e mapa hidroviário. O mapa é pensado como ferramenta de leitura, não decoração: ele precisa deixar claro de onde a carga saiu, para onde vai, onde está o barco e qual trecho exige atenção.

As embarcações entram como o outro lado da equação. O sistema lista navios e detalhes de frota para que a operação saiba quais recursos estão disponíveis, quais atendem o corredor e quais estão em rota ou manutenção.

Impacto e governo aparecem como camadas de leitura estratégica. Impacto mostra o efeito territorial, logístico e ambiental da operação. Governo mostra o lado de regulação, monitoramento e interesse público. Juntas, essas áreas ajudam a justificar a logística hidroviária como infraestrutura operacional e não apenas transporte.

Por fim, o sistema mantém o operador orientado em qualquer dispositivo. No desktop, o dashboard ganha densidade; no mobile, a navegação vira bottom nav, sheets e headers compactos. Isso importa porque a operação real acontece em campo, em barco, em terminal e em conexão instável. HydroRivers tenta respeitar esse contexto em vez de presumir uma estação de trabalho fixa.

## O que cada área resolve

| Área | Para quem | O que resolve | Ação principal |
| --- | --- | --- | --- |
| Dashboard | Operadores, gestores e analistas | Visão geral do estado da operação | Entender rapidamente cargas, negociações, timeline e prioridades |
| Cargas | Mercado/operadores | Lista pública e operacional de cargas | Filtrar, abrir e iniciar negociações |
| Minhas cargas | Embarcador, transportador, admin com recorte | Carteira pessoal do usuário logado | Ver o que é seu e o que está vinculado a você |
| Rastreio | Operação de acompanhamento | Linha do tempo e leitura de andamento | Ver eventos, status e rota |
| Negociações | Embarcador/transportador | Acordo comercial e operacional | Abrir, aceitar, revisar e acompanhar proposta |
| Embarcações | Operação/frota | Disponibilidade e características da frota | Entender capacidade, rota e aptidão |
| Impacto | Gestão e estratégia | Efeito da operação em território e sustentabilidade | Comparar valor operacional e ambiental |
| Governo | Setor público/regulação | Leitura de indicadores e fluxo regulatório | Acompanhar a operação como sistema |
| Nova carga | Embarcador | Publicação de uma nova demanda | Inserir origem, destino, janela, volume e preço |
| Auth/Login/Register/OTP | Usuários novos e recorrentes | Entrada e cadastro na plataforma | Entrar, registrar, validar OTP |
| Perfil | Usuário autenticado | Identidade, empresa e status | Atualizar dados e ver validação |

## Lacunas que a aplicação ajuda a preencher

- visibilidade operacional;
- rastreabilidade;
- organização de cargas;
- negociação mais clara;
- priorização de urgências;
- tomada de decisão com contexto;
- governança e monitoramento;
- análise de impacto;
- experiência mobile em campo;
- redução da dependência de planilhas e conversa solta.

## O que ainda não é ou não faz

- Não é um ERP completo.
- Não é um TMS genérico para qualquer modal; o foco é hidroviário e suas variações.
- Não é um sistema de cálculo automático de frete real em produção.
- Não é um integrador oficial de documentação fiscal com backend externo real nesta fase.
- Não é um produto com API live completa para todos os domínios; boa parte da experiência ainda usa mock e persistência local.
- Não é um mapa de navegação marítima de precisão cartográfica; o mapa é operacional e contextual.

## Referências principais no código

- Layout global: `src/app/[locale]/layout.tsx`
- Dashboard: `src/app/[locale]/dashboard/page.tsx`
- Cargas: `src/app/[locale]/cargas/page.tsx`
- Minhas cargas: `src/app/[locale]/minhas-cargas/page.tsx`
- Nova carga: `src/app/[locale]/cargas/nova/page.tsx`
- Negociações: `src/app/[locale]/negociacoes/page.tsx`
- Rastreio: `src/app/[locale]/rastreio/page.tsx`
- Embarcações: `src/app/[locale]/embarcacoes/page.tsx`
- Impacto: `src/app/[locale]/impacto/page.tsx`
- Governo: `src/app/[locale]/governo/page.tsx`
- Auth: `src/app/[locale]/login/page.tsx`, `src/app/[locale]/cadastro/page.tsx`, `src/app/[locale]/perfil/page.tsx`

