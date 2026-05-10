# Auditoria do estado atual do Dashboard

## Estado atual

O Dashboard deixou de ser uma listagem disfarçada e passou a funcionar como cockpit operacional. Ele usa KPIs, painel de atenção, corredores e atividade recente em vez de ocupar a maior parte da tela com cards de marketplace.

## Semelhanças com Cargas

- ambos reaproveitam cards, links e dados mockados do ecossistema de marketplace;
- ambos usam componentes compartilhados como `PageShell`, `Card` e `HydroIcon`;
- ambos podem apontar para detalhe de carga quando há contexto acionável.

## Responsabilidades duplicadas

- leitura de cargas e negociações ainda nasce de mocks comuns;
- parte da copy pode parecer próxima se não houver subtítulo claro;
- o mapa e os resumos operacionais precisam ser mantidos em contexto próprio para não virar listagem.

## Lacunas de produto

- o Dashboard ainda depende de dados mock;
- alguns cards operacionais ainda são resumo, não telemetria real;
- a visão de saúde por corredor pode crescer com mais indicadores futuros.

## Riscos de UX

- se a copy ficar genérica, o usuário volta a entender o Dashboard como lista;
- se a área de atenção perder destaque, a operação deixa de parecer priorizada;
- se os CTAs ficarem escondidos, o cockpit perde utilidade.

## Riscos técnicos

- dependência de mocks compartilhados exige cuidado para não misturar contexto público e privado;
- qualquer retorno a renderização de listas grandes pode piorar mobile e performance;
- a página precisa continuar SSR/hydration-safe.

## Recomendações

- manter o Dashboard orientado a KPIs e atenção;
- preservar a separação entre Dashboard, Cargas e Minhas cargas;
- ampliar o resumo operacional por serviços próprios;
- revisar a diferença visual sempre que a página voltar a ganhar cards demais.
