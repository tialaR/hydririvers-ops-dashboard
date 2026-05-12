# Arquitetura: Mock Data (Privacidade, Seeds e Estado Local)

Data: 2026-05-11

## 1. Objetivo

Documentar como o projeto usa dados mockados sem comprometer:

- privacidade (sem PII real);
- determinismo (QA reproduzível);
- regras de negócio (público vs privado);
- SSR/hydration safety.

## 2. Dois conceitos diferentes

### 2.1. Fixtures/Seeds (fonte de verdade em código)

Definição:

- Dados “seed” definidos em TypeScript, versionados no repositório.
- Devem ser **determinísticos** (sem `Math.random`/`Date.now` durante render).

Uso:

- gerar/repovoar estado local;
- alimentar cenários do QA Assistant;
- produzir listas públicas/privadas de forma previsível.

### 2.2. Estado local mutável (`.mock-data/*.json`)

Definição:

- Arquivos JSON que representam estado mutável em ambiente local/demo.
- Devem ficar em `.gitignore` para evitar commit acidental de dados reais.

Importante:

- **Nunca** commitar PII real (e-mail, telefone, nome real, avatar base64 real).
- Preferir domínios `example.com` e dados obviamente fictícios.

## 3. Regra-mãe: marketplace público vs dados privados

- **Marketplace (`/cargas`)**: público e compartilhado.
- **Minhas Cargas (`/minhas-cargas`)**: privado e por usuário/persona.
  - trocar persona no Mock Mode deve trocar imediatamente a lista privada exibida;
  - `/minhas-cargas/[id]` deve validar ownership/assignment.

## 4. Notificações por persona

Decisão:

- badge e texto devem usar **unreadCount derivado da mesma lista** exibida;
- não usar contadores hardcoded/desacoplados;
- estado de leitura, quando persistido, deve ser por usuário/persona e não pode rodar no SSR.

## 5. Reset de cenário

Princípio:

- reset deve restaurar o estado esperado do cenário/persona de forma determinística;
- reset não deve depender de geração aleatória em render;
- se houver persistência client-side, usar chave por persona e não ler no SSR.

## 6. Referências

- `docs/automation/mock-data-privacy-workflow.md`
- `docs/product/roles-and-permissions.md`

