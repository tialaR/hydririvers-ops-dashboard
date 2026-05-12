# Dashboard como cockpit operacional

## 1. Objetivo

O Dashboard existe para responder, em poucos segundos, a pergunta central da operação: **como está a operação agora?**

Ele não deve ser lido como marketplace nem como carteira privada. O papel dele é resumir o estado operacional, destacar o que pede atenção imediata e oferecer caminhos rápidos para as rotas certas.

Nesta fase, o Dashboard tambem atua como **resumo guiado**: explica o que a pessoa esta vendo e qual proximo passo faz sentido (marketplace publico vs minhas cargas privadas), sem duplicar atalhos em varios cards.

## 2. Diferença entre Dashboard, Cargas e Minhas cargas

| Área | Pergunta principal | Público | Dados | Ações | O que não deve fazer |
| --- | --- | --- | --- | --- | --- |
| Dashboard | Como está a operação agora? | operação, gestão, stakeholders | KPIs, alertas, corredores, atividade recente, próximas janelas | abrir marketplace, abrir minhas cargas, acompanhar alertas | não deve virar listagem completa de cargas |
| Cargas | Quais cargas públicas estão disponíveis? | qualquer pessoa com acesso ao app | cargas públicas, filtros, negociação, detalhe público | buscar, filtrar, abrir detalhe, negociar | não deve representar carteira privada |
| Minhas cargas | Quais cargas pertencem ao usuário logado? | usuário autenticado | cargas do usuário, pendências, documentos, detalhe privado | abrir detalhe privado, acompanhar operação pessoal | não deve misturar cargas públicas como se fossem próprias |

## 3. Blocos do Dashboard

### KPIs

Mostram números que ajudam a entender o estado atual:

- cargas ativas;
- cargas em atenção;
- documentos pendentes;
- operações em rota;
- alertas críticos;
- janelas próximas;
- negociações pendentes;
- eficiência ou impacto, quando houver dado confiável.

### Atenção agora

Lista itens acionáveis e urgentes, como:

- NF-e pendente;
- janela de atracação próxima;
- contraproposta recebida;
- alerta operacional;
- carga atrasada;
- documentação incompleta.

### Próximas janelas

Mostra previsões operacionais relevantes:

- atracação;
- coleta;
- entrega;
- chegada ao corredor;
- inspeção;
- prazo de resposta de negociação.

### Saúde por corredor

Resume movimentação e risco por corredor ou rota, ajudando a identificar onde a operação está mais carregada.

### Mapa ou preview operacional

Quando o mapa fizer sentido, ele aparece como apoio visual. O Dashboard não deve transformar o mapa em protagonista absoluto.

### Atividade recente

Mostra o que mudou recentemente na operação, sem virar listagem completa.

### CTAs

O Dashboard precisa sempre apontar para as próximas ações:

- ver cargas públicas;
- ver minhas cargas;
- abrir rastreio;
- revisar negociações;
- criar nova carga, quando permitido.

## 4. Jornada de usuário

Uma pessoa entra no Dashboard no início do dia, olha os KPIs, identifica alertas e marcos próximos, e então decide para onde seguir.

O fluxo esperado é:

1. entender o estado geral;
2. identificar o que exige atenção;
3. navegar para Cargas, Minhas cargas ou Rastreio conforme a necessidade;
4. tomar uma ação concreta.

## 5. Linguagem para usuários leigos

A copy precisa falar com clareza operacional.

Preferir termos como:

- operação em atenção;
- documento pendente;
- janela próxima;
- ação recomendada;
- ver detalhes;
- abrir rastreio;
- ver cargas públicas.

Evitar termos técnicos que só fazem sentido para dev ou infraestrutura.

## 6. Limitações atuais

- Parte dos dados ainda é mock.
- Não há backend real completo para todos os fluxos.
- A operação é demonstrativa e precisa de evolução futura para monitoramento real e integrações externas.
