# HydroRivers — Page 62 · Shipper Domain Research & Journey v1.0

**Data de consolidação:** 2026-09-24  
**Status:** contrato de domínio para implementação desktop  
**Persona:** embarcadora autenticada  
**Escopo:** transporte hidroviário de cargas no Norte do Brasil, com foco amazônico  
**Modo atual de dados:** DEMO/mock com fronteiras de repositório preparadas para futura API

## 1. Por que este documento existe

O Page 62 não deve ser uma coleção de telas desenhadas por aparência. Ele deve responder ao trabalho real da embarcadora:

**CARTEIRA → DETECTAR → SELECIONAR → ENTENDER → INVESTIGAR → DECIDIR → AGIR → RECEBER FEEDBACK → CORRIGIR SE NECESSÁRIO → ACOMPANHAR**

A regra é: uma informação entra na interface porque sustenta uma decisão, reduz risco, explica uma exceção ou permite uma ação operacional. Gráfico, status ou CTA sem função operacional é dívida.

## 2. Evidência oficial usada

### DNIT · hidrovias amazônicas

O DNIT descreve o Amazonas como principal via de transporte e escoamento de cargas da Região Norte. Também registra transporte de passageiros e pequenas cargas para localidades ribeirinhas, além de grandes volumes em cabotagem e longo curso. O regime hidrológico altera a operação ao longo do ano.

Fontes:
- Hidrovia do Amazonas: https://www.gov.br/dnit/pt-br/assuntos/aquaviario/antiga-daq/hidrovia-do-amazonas
- Hidrovia do Solimões: https://www.gov.br/dnit/pt-br/assuntos/aquaviario/intervencao-em-hidrovias/hidrovias-1/hidrovia-do-solimoes
- Hidrovia do Solimões–Amazonas: https://www.gov.br/dnit/pt-br/assuntos/hidrovias/hidrovias-interiores/hidrovia-do-solimoes-amazonas
- Hidrovia do Madeira: https://www.gov.br/dnit/pt-br/assuntos/aquaviario/intervencao-em-hidrovias/hidrovias-1/hidrovia-do-madeira

Consequência de produto:
- corredor, trecho, origem/destino e porto/marco são primeira classe;
- nível/tendência hidrológica e condição de navegabilidade precisam de fonte e freshness;
- bancos de areia móveis, pedrais, corredeiras, dragagem e alterações de canal não podem virar um genérico “risco de rota”;
- a estação seca pode aumentar tempo de viagem e risco, então ETA deve explicar delta e causa.

### ANA · hidrologia e eventos críticos

A ANA mantém Hidroweb, telemetria e monitoramento hidrológico. Em 2023/2024 declarou escassez crítica em bacias amazônicas, inclusive Madeira/Purus, e associa o monitoramento a prevenção e mitigação dos impactos sobre os usos da água.

Fontes:
- Monitoramento Hidrológico: https://www.gov.br/ana/pt-br/assuntos/monitoramento-e-eventos-criticos/monitoramento-hidrologico
- Hidroweb: https://www.gov.br/pt-br/apps/hidroweb
- Sala de Situação do Madeira: https://www.gov.br/ana/pt-br/sala-de-situacao/rio-madeira/saiba-mais
- Escassez Madeira/Purus 2024: https://www.gov.br/ana/pt-br/assuntos/noticias-e-eventos/noticias/ana-declara-situacao-de-escassez-hidrica-nos-rios-madeira-ro-am-e-purus-ac-am

Consequência de produto:
- mostrar valor sem timestamp/fonte é insuficiente;
- o dashboard deve diferenciar dado live, cache e DEMO;
- tendência é mais útil que um número isolado;
- alertas hidrológicos precisam ser ligados a trecho e impacto operacional.

### ANTAQ · regulação, seca e continuidade do abastecimento

Em agosto de 2026 a ANTAQ reforçou medidas preventivas para estiagem amazônica, citando planejamento para eventos hidrológicos extremos, redistribuição/transbordo de carga, reorganização de programação, embarcações de menor calado e acompanhamento de dragagem em Madeira, Amazonas e Tapajós. A finalidade inclui reduzir impacto no transporte e contribuir para continuidade do abastecimento.

Em 15/09/2026, a ANTAQ estabeleceu maior controle para eventual Low Water Surcharge / Taxa de Seca em 2026. A cobrança depende de análise/homologação regulatória e comprovação técnica de custos extraordinários; a referência divulgada para 2026 é cota oficial do Rio Negro no Porto de Manaus igual ou inferior a 17,7 m.

Fontes:
- Estiagem 2026: https://www.gov.br/antaq/pt-br/noticias/2026/antaq-reforca-acoes-preventivas-diante-dos-impactos-da-estiagem-na-regiao-amazonica
- Taxa de Seca 2026: https://www.gov.br/antaq/pt-br/noticias/2026/antaq-reforca-controle-sobre-cobranca-da-taxa-de-seca-na-regiao-amazonica/
- Modernização da navegação interior: https://www.gov.br/antaq/pt-br/noticias/2026/antaq-moderniza-regulacao-da-navegacao-interior-e-simplifica-procedimentos-para-o-setor

Regra temporal importante:
- as Resoluções ANTAQ 136–141/2026 foram publicadas em agosto de 2026, mas entram em vigor em **13/02/2027**;
- o produto pode mostrar esta mudança como horizonte regulatório, nunca como regra vigente em 24/09/2026;
- acordos operacionais, troca de espaço, cessão de barcaças com carga e compartilhamento de equipamentos ganham disciplina específica quando as novas regras entrarem em vigor.

### Lei 9.432/1997

A Lei 9.432/1997 ordena o transporte aquaviário e define navegação interior como a realizada em hidrovias interiores em percurso nacional ou internacional, além de regras de afretamento.

Fonte:
- https://www.planalto.gov.br/ccivil_03/leis/l9432.htm

Consequência de produto:
- embarcação, operador/transportador e modalidade contratual são entidades distintas;
- compatibilidade operacional não deve ser reduzida ao nome do transportador;
- futuras integrações regulatórias devem preservar a distinção entre autorização, registro, afretamento e execução da operação.

### CHM / Marinha · segurança da navegação

Avisos aos Navegantes atualizam cartas e publicações náuticas com avisos temporários, preliminares e permanentes. Os Roteiros complementam cartas com informação de canais, acessos, portos e regimes fluviais/climáticos.

Fontes:
- Avisos aos Navegantes: https://www.marinha.mil.br/chm/dados-do-segnav-aviso-aos-navegantes-tela
- Roteiros: https://www.marinha.mil.br/chm/dados-do-segnav-publicacoes/roteiros
- Catálogo de Cartas e Publicações: https://www.marinha.mil.br/chm/dados-do-segnav-publicacoes/catalogo-de-cartas-e-publicacoes

Consequência de produto:
- “aviso de trecho” deve conter tipo, vigência, fonte e trecho afetado;
- um aviso não pode aparecer como fato eterno;
- mapas e alertas devem preservar a rastreabilidade da origem da informação.

### Receita Federal · documentos fiscais eletrônicos

A Receita lista CT-e, MDF-e e NF-e entre os documentos fiscais eletrônicos.

Fonte:
- https://www.gov.br/receitafederal/pt-br/assuntos/empresas-e-negocios/dfe

Regra de produto:
- **NF-e**: documento fiscal da mercadoria, quando aplicável;
- **CT-e**: documento eletrônico do serviço de transporte, quando aplicável;
- **MDF-e**: Manifesto Eletrônico de Documentos Fiscais;
- “romaneio”, comprovante de coleta, foto/assinatura e evidências operacionais não devem ser apresentados como se fossem o mesmo tipo de documento fiscal federal;
- seguros, licenças e autorizações são condicionais ao contexto da carga/operação. O produto não presume universalidade.

### Planejamento logístico federal

O PNL 2035 trata intermodalidade, eficiência, segurança, sustentabilidade e redução de custos logísticos como objetivos da transformação da matriz de transportes.

Fonte:
- https://www.gov.br/transportes/pt-br/assuntos/noticias/2021/12/com-plano-nacional-governo-federal-mostra-futuro-da-infraestrutura-de-transportes-no-pais

Consequência de produto:
- comparação de proposta deve considerar custo + ETA + risco + condição operacional, não somente “menor preço”;
- conexão com portos/terminais e outros modais pode ser adicionada sem quebrar o modelo.

## 3. Persona operacional

### Embarcadora autenticada

Responsável por acompanhar cargas próprias, selecionar ou negociar capacidade de transporte, garantir prontidão documental, responder a ocorrências e manter previsibilidade sobre entrega.

Perguntas que o produto deve responder rapidamente:
1. Qual carga exige minha atenção agora?
2. O problema é documental, hidrográfico, operacional, comercial ou de comunicação?
3. Qual o impacto no ETA/custo/janela?
4. Que evidência sustenta o alerta?
5. Qual ação é possível agora?
6. Quem é responsável por agir?
7. O que muda depois da minha decisão?
8. Como sei que a ação foi aplicada?
9. O que ainda preciso acompanhar?

## 4. Objetos de domínio

### Carga
Código, origem, destino, corredor, mercadoria, peso/volume, status, prioridade, janela, ETA, risco, transportador e embarcação quando vinculados.

### Corredor/trecho hidroviário
Rio/corredor, segmento, condição, nível/tendência, calado/margem operacional quando disponível, restrições, dragagem/sinalização, porto/marco e fonte.

### Freshness
Todo dado operacional externo precisa declarar:
- origem;
- momento observado;
- modo: live / cache / DEMO;
- idade do dado;
- estado fresh / stale / offline.

### Documento/evidência
Tipo, aplicabilidade, status, responsável, prazo, valor/evidência comparável, fonte e ação de correção.

### Ocorrência
Tipo, severidade, causa, evidência, impacto, trecho/objeto afetado, deadline e plano de mitigação.

### Proposta
Contraparte, embarcação/serviço, preço, ETA, janela, demurrage quando contratualmente aplicável, validade, compatibilidade operacional, documentação e risco.

### Decisão
Objeto afetado, valor anterior, valor proposto, consequência, evidências vinculadas, ator e confirmação explícita.

### Evento operacional
O que ocorreu, quando ocorreu, quem/qual sistema registrou, evidência, efeito e próximo passo.

## 5. Filtros reais da carteira

Os filtros devem refletir decisões da embarcadora e o dado existente. Baseline:

- status da carga;
- ação requerida;
- corredor hidroviário;
- origem;
- destino/terminal;
- tipo/família de carga;
- risco operacional;
- condição de navegabilidade;
- estado documental;
- freshness/sinal;
- janela de ETA;
- ocorrência aberta;
- contraparte/transportador quando vinculado.

Filtros puramente decorativos ou sem campo correspondente no domínio não entram.

## 6. Page 62 · descoberta de composição

Os exports entregues mostram repetição pixel-idêntica. Isto não representa treze layouts diferentes.

### Grupo A · D01 + D02 + D03
**Carteira + Selected Cargo Overview + Route/Hydrographic Context**

A mesma composição deve permitir:
- detectar carga em atenção;
- selecionar;
- enxergar mapa/rota grande o suficiente para leitura;
- ver ETA, progresso, documentos, sinal/freshness e risco;
- abrir contextos mais profundos.

### Grupo B · D04 + D05
**Cargo Cockpit + Operational Timeline**

Cockpit e timeline coexistem. Telemetria quantitativa não deve ser comprimida para caber. Em largura insuficiente a composição empilha; o gráfico preserva área útil.

### Grupo C · D06 + D07
**Documents & Evidence + Risk/Occurrence**

A persona precisa reconciliar documento → evidência → divergência → impacto → correção.

### Grupo D · D08 + D09
**Proposal / Negotiation + Operational Communication**

Comparação comercial e comunicação são lados da mesma decisão. A proposta selecionada deve carregar seus trade-offs para a revisão.

### Grupo E · D10
**Decision / Action Review**

Antes de uma ação irreversível, exibir:
- objeto afetado;
- antes → depois;
- consequência operacional;
- evidências;
- contraparte;
- botão de confirmação e cancelamento.

### Grupo F · D11
**Action Feedback**

Depois da ação, dizer claramente:
- ação registrada;
- o que mudou;
- o que não mudou;
- qual é o próximo passo;
- como acompanhar.

### Grupo G · D12
**Correction / Resubmit**

Exibir divergência comparável, evidência correta e stepper explícito. Corrigir sem mostrar “enviado vs comprovado” é insuficiente.

### Grupo H · D13
**Follow-up / Monitoring**

Estado pós-ação, eventos recentes, condição atual, pendências e próxima decisão.

## 7. Jornada consolidada

**A. DETECTAR**
D01–D03: carteira + mapa + attention signals.

**B. ENTENDER**
D04–D05: cockpit + timeline + telemetria + milestone.

**C. INVESTIGAR**
D06–D07: evidências + ocorrência + causa/impacto.

**D. DECIDIR**
D08–D10: comparar proposta → conversar → revisar consequência.

**E. AGIR E RECEBER FEEDBACK**
D11: ação persistida e diferenças materializadas.

**F. CORRIGIR**
D12 somente quando uma evidência/ação é rejeitada ou divergente.

**G. ACOMPANHAR**
D13: monitorar estado e próxima decisão.

## 8. Regras de UX que passam a ser contrato

1. **Mapa não é wallpaper.** Deve explicar corredor, posição, trecho e restrição.
2. **Telemetria não encolhe até ficar ilegível.** Responsividade troca simultaneidade por empilhamento.
3. **Timeline é para eventos temporais.** Risco, progresso, documento e preço usam representações próprias.
4. **Status tem causa e consequência.** “Atenção” sem porquê é FAIL.
5. **Dado externo tem fonte e freshness.**
6. **DEMO é explícito.** Nenhum dado mock pode parecer live.
7. **Documento é tipado.** MDF-e não é um “manifesto” genérico no modelo.
8. **Aplicabilidade é condicional.** Seguro/licença não são universais.
9. **Proposta não tem winner mágico.** A tela mostra trade-offs; a pessoa decide.
10. **CTA precisa fechar consequência.** Ação → feedback → correção quando necessária → monitoramento.
11. **Desktop maximiza leitura simultânea; responsividade preserva inteligência.**
12. **Storybook certifica componentes/estados antes da composição final.**

## 9. Mock → API readiness

O front não pode conhecer “onde o dado veio” além da interface de repositório.

Todo snapshot de jornada precisa ser serializável e fornecer:
- identificadores estáveis;
- timestamps ISO quando houver tempo real;
- source metadata;
- estados semânticos;
- payloads de ação explícitos;
- relações por id entre carga, documento, ocorrência, proposta, decisão e evento.

Trocar mock por API deve exigir substituir o adapter/repository, não reescrever componentes.

## 10. O que ainda é inferência profissional

Marcado como inferência e não como obrigação regulatória:
- quais combinações exatas de documentos são obrigatórias para cada tipo de carga;
- como cada embarcadora organiza aprovação interna;
- thresholds específicos de risco/calado para cada embarcação;
- regras contratuais de demurrage;
- SLAs comerciais e de comunicação;
- integrações específicas com operadores/terminais.

Essas áreas permanecem configuráveis no domínio e não são hard-coded como lei.

## 11. Gate de prontidão

Page 62 só pode ser chamado de pronto quando:
- todas as decisões importantes têm fonte, contrato ou inferência marcada;
- nenhuma tela depende de dado inexistente no domínio;
- nenhum CTA termina em beco;
- todos os mocks declaram DEMO;
- os componentes usam tokens semânticos;
- D01–D13 estão cobertos pelos oito estados visuais reais;
- Storybook, lint, typecheck, testes e gates passam.


## 12. Visual evidence reconciliation — delivered exports

The supplied `M01 · BLUEPRINT DESKTOP FLOW.svg` (SHA-256 `fa54c14618aff4bff3c3b6f52a7745cdbf99fe355a58092b0ca4c31344a8e871`) confirms the business journey already inferred from the smaller D01–D13 exports:

1. portfolio / map context;
2. operational cockpit;
3. documents + risk;
4. proposal comparison + communication;
5. action review;
6. action feedback;
7. rejection / correction when required;
8. post-action monitoring.

The supplied `Negotiation + Communication.svg` (SHA-256 `2e285c2df656d172dce0db18a4b9f015bfc2017c6e4335fa31cb05e9b3ca7e6a`) is **not a new screen**. It is the 1440×980 parent composition for the D08/D09 pair:
- left: proposal comparison / trade-offs / rationale;
- right: contextual operational communication;
- footer: explicit transition into review.

The smaller `PLAY-D08.png` and `PLAY-D09.png` are byte-identical in the delivered material. The implementation therefore keeps one reusable composition and assigns D08/D09 as semantic responsibilities instead of cloning markup.

### Consequence

The flow is implemented as **state progression over reusable components**, not thirteen independent pages. This is the fastest path to production parity and the safest path to a future API because data state, action state and visual state remain separate.
