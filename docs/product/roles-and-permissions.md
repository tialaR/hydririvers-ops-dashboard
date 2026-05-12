# Papéis e Permissões (Roles & Capabilities)

Data: 2026-05-11  
Escopo: regras de produto + como isso se manifesta em navegação, rotas e dados mockados.

## Legenda

- **Implementado**: já existe no repositório (código + testes, quando aplicável).
- **Em evolução**: decisão documentada e partes no código, mas ainda com cobertura parcial.
- **Futuro**: intenção/roadmap, não entregue.

## 1. Papéis (personas de produto)

### Embarcador (shipper)

Pergunta central: "Minhas cargas, minhas propostas, meus documentos e meu rastreio."

Ações típicas:

- publicar/criar carga (quando habilitado);
- acompanhar status e documentos das próprias cargas;
- ver negociações relacionadas às próprias cargas;
- acompanhar rastreio das próprias cargas.

Status: **Implementado (parcial, mock-first)**.

### Transportador (carrier)

Pergunta central: "Oportunidades, cargas atribuídas, operação em andamento e frota."

Ações típicas:

- ver oportunidades no marketplace público;
- acompanhar cargas atribuídas/aceitas/em operação;
- gerenciar/consultar embarcações (quando disponível);
- acompanhar rastreio de cargas atribuídas;
- participar de negociações/propostas quando a funcionalidade existir.

Status: **Implementado (parcial, mock-first)**.

### Admin/QA (admin)

Pergunta central: "Qual persona estou simulando? Que risco esse cenário cobre? O que eu espero ver?"

Ações típicas:

- acessar área administrativa;
- usar Mock Mode/QA Assistant;
- resetar cenários/dados mock (quando permitido por env).

Status: **Implementado (mock/QA)**.

### Governo / stakeholder institucional (government)

Este papel pode existir como **persona** e/ou rota institucional (ex.: Governo/Impacto).  
Importante: **não** deve acessar dados privados de usuários sem regra explícita.

Status: **Futuro / Em evolução**, dependendo do trecho do app (não assumir “role government” se não existir no código).

## 2. Regra-mãe: Marketplace vs Minhas Cargas

- **`/cargas` (Marketplace / Cargas públicas)**: vitrine pública e **compartilhada**.
  - A lista pode ser igual para todos.
  - Não representa “propriedade” exclusiva.
- **`/minhas-cargas` (Minhas Cargas)**: espelho **privado** do usuário atual.
  - Muda conforme usuário/persona.
  - Não pode vazar dados entre usuários.
  - `/minhas-cargas/[id]` deve validar **ownership/assignment**.

Status: **Implementado (mock-first)**.

## 3. Matriz de rotas (alto nível)

Esta matriz documenta intenção e comportamento esperado. Onde houver divergência, trate como bug.

| Rota | Público | Embarcador | Transportador | Admin/QA |
|------|---------|------------|---------------|----------|
| `/login` | sim | sim | sim | sim |
| `/cadastro` | sim | sim | sim | sim |
| `/dashboard` | não | sim | sim | sim |
| `/cargas` | sim (ou híbrido) | sim | sim | sim |
| `/minhas-cargas` | não | sim (próprias) | sim (atribuídas) | sim (amplo) |
| `/cargas/nova` | não | sim (regra padrão) | não (regra padrão) | sim (se habilitado) |
| `/negociacoes` | não | sim (relacionadas) | sim (relacionadas) | sim |
| `/embarcacoes` | não | limitado (contextual) | sim | sim |
| `/rastreio` | não | sim (próprias) | sim (atribuídas) | sim |
| `/admin` | não | não | não | sim |

Observação: rotas exatas variam por locale (ex.: `/pt-BR/...`).

## 4. Matriz de dados (alto nível)

- Marketplace público:
  - dados de oportunidade/listagem;
  - sem vínculo exclusivo com usuário (pode ter shipper fictício/empresa, mas “visibilidade” é pública).
- Minhas cargas:
  - shipper vê `shipperId`/`ownerUserId` vinculados ao usuário;
  - carrier vê `assignedCarrierId`/`carrierId`/`operatorId` vinculados ao usuário.

## 5. Exemplos de acesso permitido/negado

- Permitido: shipper abre `/minhas-cargas/{id}` de uma carga com `shipperId === user.id`.
- Negado: shipper tenta abrir `/minhas-cargas/{id}` de outro shipper.
- Permitido: carrier abre `/minhas-cargas/{id}` de carga com `assignedCarrierId === user.id`.
- Permitido: qualquer usuário abre `/cargas/{id}` (detalhe público).

## 6. Onde isso vive no código (fonte de verdade)

Status: **Implementado**.

- Domínio de acesso (helpers/capabilities): `src/features/auth/domain/access-control.ts`
- Navegação filtrada por permissão: `src/shared/config/navigation.ts`
- Mock Mode/QA Assistant + personas/cenários: `src/shared/ui/mock-mode/*` e `src/shared/qa/*`
- Serviços/mocks de cargo (público vs privado): `src/features/cargo/services/*`, `src/features/my-cargos/mocks/*`

