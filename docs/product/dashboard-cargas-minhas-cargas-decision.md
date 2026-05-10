# Decisão de produto: Dashboard, Cargas e Minhas cargas

## 1. Problema

As telas estavam parecidas demais. O Dashboard passava a impressão de ser apenas mais uma listagem de cargas, o que enfraquecia a razão de manter rotas separadas para operação, marketplace e área privada.

## 2. Decisão

- Dashboard será visão operacional.
- Cargas será marketplace/listagem pública.
- Minhas cargas será área privada do usuário logado.

## 3. O que cada rota deve responder

| Rota | Pergunta principal | Público | Dados usados | Ações principais | O que NÃO deve fazer |
| --- | --- | --- | --- | --- | --- |
| `/[locale]/dashboard` | Como está a operação agora? | operação, gestão, stakeholders, devs | KPIs, alertas, corredores, atividade recente, resumo operacional | abrir marketplace, acompanhar alertas, ver visão geral | não deve parecer listagem principal de cargas |
| `/[locale]/cargas` | Quais cargas estão disponíveis? | qualquer pessoa com acesso ao app | cargas públicas do marketplace | buscar, filtrar, abrir detalhe público, negociar | não deve mostrar área privada como lista principal |
| `/[locale]/minhas-cargas` | Quais cargas pertencem a mim? | usuário logado | cargas do usuário atual | abrir detalhe privado, acompanhar pendências, continuar operação | não deve misturar cargas públicas como se fossem próprias |

## 4. Critérios de diferenciação visual

### Dashboard

- cards de KPI;
- alertas;
- resumo operacional;
- mapa/status ou indicadores de operação;
- prioridades;
- atividade recente;
- insights;
- CTA claro para o marketplace.

### Cargas

- listagem;
- busca;
- filtros;
- cards de carga pública;
- ordenação;
- ação de abrir/negociar.

### Minhas cargas

- lista privada;
- status das minhas cargas;
- pendências;
- documentos;
- ações pessoais;
- detalhe privado.

## 5. Riscos se a decisão não for aplicada

- duplicação de tela;
- confusão de usuário;
- manutenção duplicada;
- dados públicos e privados misturados;
- navegação pouco clara.

## 6. Decisão final

Dashboard continua existindo.
Cargas continua existindo.
Minhas cargas continua existindo.
Mas cada uma precisa ter papel próprio.
