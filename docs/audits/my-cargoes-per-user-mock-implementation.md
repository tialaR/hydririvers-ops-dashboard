# Auditoria: Minhas cargas (mocks por usuario/persona)

Data: 2026-05-11  
Branch: `feat/mock-mode-qa-assistant`

## Regra central

- `/cargas` e vitrine publica e compartilhada.
- `/minhas-cargas` e area privada e muda conforme usuario/persona atual.

## Mudancas aplicadas

### 1. Service: fallback deterministico por usuario

Arquivo:

- `src/features/cargo/services/cargo.service.ts`

Mudanca:

- alem dos seeds por userId (`u-shipper-1`, `u-carrier-1`, etc.), o service agora aplica fallback deterministico:
  - se `userId` indicar shipper, clona mocks base e amarra `ownerId/shipperId` ao `userId`;
  - se `userId` indicar carrier, clona mocks base e amarra `carrierId` ao `userId`.

Objetivo:

- evitar empty state inesperado em personas que nao tem seed explicito;
- manter regra de privacidade (cargas privadas sempre vinculadas ao usuario atual).

### 2. Pagina: copy por role

Arquivo:

- `src/app/[locale]/minhas-cargas/page.tsx`

Mudanca:

- titulo e descricao variam para carrier vs shipper (sem duplicar pagina inteira).

### 3. i18n

Arquivos:

- `messages/pt-BR.json`
- `messages/en-US.json`
- `messages/es.json`

Mudanca:

- empty state humanizado (vinculo ao perfil, nao "cadastro");
- keys adicionadas: `titleCarrier` e `descriptionCarrier`.

## Testes recomendados

- service retorna private cargoes para shipper/carrier nao mapeados explicitamente;
- pagina usa copy correta por role;
- `/cargas` continua publico e nao recebe privadas.

