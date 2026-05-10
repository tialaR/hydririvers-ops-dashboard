# Mock Mode QA Assistant

O Mock Mode QA Assistant é a camada de apoio para QA, desenvolvimento e revisão técnica do HydroRivers. Ele transforma o painel de mock em um catálogo de cenários reais, com contexto, risco coberto, passos sugeridos, rota inicial e resultado esperado.

## O que ele resolve

- Ajuda a reproduzir fluxos importantes sem depender de memória ou de documentação solta.
- Explica por que cada cenário existe.
- Mostra que dataset mock usar como base.
- Facilita abrir a rota correta e copiar os passos de verificação.
- Mantém a separação entre dados públicos, dados privados e estados operacionais.

## Como ativar

1. Abra a aplicação em ambiente com Mock Mode habilitado.
2. Clique no botão flutuante `M`.
3. Use o painel `Cenário mock (dataset)` para trocar a base de dados.
4. Navegue até o bloco `Assistente de QA` para escolher o fluxo que deseja validar.

### Flags úteis

- `HYDRORIVERS_FORCE_MOCK_QA_UI=true` mostra o painel em ambiente compatível com produção.
- `HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true` permite resetar a base do dataset via `POST /api/mock-mode`.
- `HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true` libera login direto em cenários controlados de CI/E2E.
- `npm run test:mock-mode` executa a suíte focada no catálogo, no mock-mode e nos fluxos de autenticação vinculados.

## Como escolher um cenário

Cada cenário mostra:

- título;
- descrição;
- objetivo;
- risco coberto;
- persona simulada;
- rota inicial;
- dataset sugerido;
- áreas cobertas;
- prioridade;
- status;
- tags;
- passos recomendados;
- resultado esperado.

Use a busca para filtrar por rota, risco, tags ou palavras-chave operacionais.

## Como resetar

Use o botão `Resetar base` no painel de dataset para voltar ao estado base do projeto.
O reset depende de sessão admin e da flag `HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true`.

## Como criar um novo cenário

1. Adicione um item em `src/shared/ui/mock-mode/mock-qa-scenarios.ts`.
2. Preencha todos os campos obrigatórios.
3. Mapeie o cenário para um dataset existente quando fizer sentido.
4. Escreva um teste unitário para garantir id único, rota inicial, passos e resultado esperado.
5. Atualize os textos do painel se o cenário introduzir um novo padrão de linguagem.

## Como escrever dados mockados

- Prefira dados determinísticos.
- Reaproveite datasets existentes quando possível.
- Evite gerar estado novo em cada render.
- Mantenha coerência entre usuário, cargas, notificações, negociação e rastreio.

## Como o QA deve usar

- Escolha um cenário.
- Leia o risco coberto e o resultado esperado.
- Aplique o dataset sugerido, se necessário.
- Abra a rota inicial.
- Execute os passos sugeridos.
- Compare o resultado com o que o cenário descreve.

## Como o dev deve usar

- Use o catálogo para reproduzir bugs.
- Crie testes unitários para cada cenário novo.
- Atualize o audit quando algum cenário deixar de ser fiel ao produto.
- Registre decisões relevantes em ADR quando a mudança alterar o fluxo ou a arquitetura.

## Como IA/Codex deve usar

- Ler o catálogo antes de propor alteração de fluxo.
- Não inventar estados que não existem no mock.
- Validar com os comandos do projeto.
- Documentar o que é implementação real e o que é simulação.

## Limitações

- O QA Assistant não substitui validação visual manual em mobile e landscape.
- Ainda há fluxos que dependem de interação humana ou de backends futuros.
- O catálogo deve ser mantido junto com as mudanças de produto para continuar útil.
