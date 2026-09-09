# Linguagem visual do HydriRivers

## 1. Referência visual

A tela de **Cargas** é a referência principal da aplicação. Ela estabelece o ritmo visual do produto:

- fundo escuro com profundidade;
- cards sólidos com bordas sutis;
- teal/aqua como cor operacional;
- dourado apenas para atenção;
- tipografia técnica e legível;
- filtros minimalistas;
- chips/status claros;
- espaçamento respirável;
- mobile-first.

## 2. O que deve ser reaproveitado

- `PageShell` com título, subtítulo e corpo organizado.
- `Card` escuro com borda discreta e sombra suave.
- `Badge` e chips com semântica clara.
- botões compactos com foco visível.
- empty states humanizados.
- loading/error states coerentes.
- footer da sidebar compacto e alinhado.
- badge de notificações sincronizado com `unreadCount`.

## 3. O que não deve ser copiado literalmente

- listagem principal de cargas em telas que não são marketplace.
- filtros em páginas sem necessidade real de busca/filtro.
- dourado como decoração contínua.
- cards de carga para entidades que não são cargas.
- hero de marketing em rotas operacionais.

## 4. Como diferenciar as rotas

- **Home/Início**: porta narrativa do produto.
- **Dashboard**: cockpit operacional com resumo guiado (explica "o que merece atenção" e aponta próximos passos).
- **Cargas**: marketplace público.
- **Minhas cargas**: área privada do usuário.
- **Rastreio**: mapa e acompanhamento.
- **Negociações**: decisão comercial.
- **Embarcações**: ativos/frota.
- **Impacto**: indicadores socioambientais/operacionais.
- **Governo**: visão institucional.
- **Auth/Register/OTP**: onboarding e acesso.

## 5. Regras de uso

- use teal para ações operacionais e estados de progresso;
- use dourado para destaque, prioridade ou atenção;
- use surfaces elevadas apenas onde a informação precisa de separação;
- permita crescimento vertical em mobile quando o texto ficar longo;
- mantenha ícones e labels claros;
- preserve acessibilidade e contraste em dark/light.
