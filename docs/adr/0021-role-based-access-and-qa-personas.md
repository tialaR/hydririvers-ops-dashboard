# ADR 0021: Role-Based Access e QA Personas (Mock-Friendly)

Status: **accepted**  
Data: 2026-05-11

## Contexto

O HydroRivers Ops Dashboard usa dados mockados e precisa ser demonstrável e testável sem backend enterprise. Ao mesmo tempo, o produto representa uma operação real com perfis diferentes (ex.: Embarcador vs Transportador), e QA precisa conseguir validar cenários com previsibilidade.

## Problema

Sem uma camada explícita e central de acesso e sem um catálogo de personas/cenários:

- regras de “quem pode ver o quê” acabam espalhadas em JSX, difíceis de manter e inconsistentes;
- navegação pode exibir rotas que o usuário não deveria acessar;
- o Mock Mode vira uma “gaveta de botões”, pouco legível para QA humano;
- cenários ficam frágeis (difíceis de reproduzir e comparar), prejudicando QA e demo.

## Decisão

Adotar um modelo **mock-friendly** e **testável** de:

1. **Roles e capabilities centralizadas** (camada de domínio, sem depender de React).
2. **Personas de QA** com papéis claros, usadas pelo Mock Mode/QA Assistant para trocar o “usuário atual” de forma determinística.
3. **Cenários com metadados** (persona, jornada, risco, rota inicial e resultados esperados), priorizando legibilidade para QA humano.

Esta decisão não exige RBAC enterprise com backend real agora; ela prepara o terreno para evoluir a autorização no futuro sem reescrever a UI.

## Alternativas consideradas

1. Esconder/mostrar UI manualmente em cada componente.
2. Manter todos os usuários vendo tudo.
3. Criar camada central de roles/capabilities + QA personas (decisão adotada).
4. Implementar RBAC completo com backend real agora.

## Consequências positivas

- Consistência de acesso entre menu, rotas e dados mockados.
- Regras de negócio ficam rastreáveis e testáveis (unit tests).
- QA Assistant ganha previsibilidade e vira roteiro de validação humano.
- Evolução futura para backend real fica mais direta (mesma matriz de capabilities).

## Trade-offs

- Exige disciplina para consumir helpers (evitar “if (user.role===...)” espalhado).
- Pode haver casos em que o backend futuro tenha regras mais complexas (ABAC, atributos), exigindo evolução do modelo.

## Critérios de revisão futura

- Se surgir necessidade real de autorização por atributos (ex.: por “corredor”, “contrato” ou “empresa”), revisar a camada de capabilities.
- Se o Mock Mode virar fonte de verdade de testes end-to-end, consolidar a taxonomia de jornadas/riscos e a validação automática do catálogo.

## Links relacionados

- `docs/product/roles-and-permissions.md`
- `docs/product/roles-permissions-user-cases.md`
- `docs/architecture/access-control-architecture.md`
- `docs/automation/qa-assistant-human-workflow.md`

