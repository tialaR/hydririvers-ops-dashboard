# Papéis, permissões e casos de uso

## Visão geral

```mermaid
flowchart TD
  A[Usuário acessa HydroRivers] --> B{Está autenticado?}
  B -- Não --> C[Home / Login / Cadastro / Mercado público]
  B -- Sim --> D{Qual perfil?}
  D -- Embarcador --> E[Dashboard + Cargas públicas + Minhas cargas próprias + Nova carga + Negociações próprias + Rastreo próprio]
  D -- Transportador --> F[Dashboard + Cargas públicas + Minhas cargas atribuídas + Embarcações + Negociações + Rastreo]
  D -- Admin --> G[Dashboard amplo + Admin + Mock Mode + Governo]
```

## Embarcador

```mermaid
flowchart TD
  A[Embarcador logado] --> B[Dashboard operacional]
  B --> C[Cargas públicas]
  B --> D[Minhas cargas]
  D --> E[Detalhe da carga própria]
  E --> F[Negociar / acompanhar documentos]
  E --> G[Rastrear operação]
  B --> H[Nova carga]
```

## Transportador

```mermaid
flowchart TD
  A[Transportador logado] --> B[Dashboard operacional]
  B --> C[Cargas públicas]
  C --> D[Detalhe público]
  D --> E[Enviar proposta]
  B --> F[Minhas cargas atribuídas]
  F --> G[Detalhe privado da carga atribuída]
  G --> H[Rastreio e negociação]
  B --> I[Embarcações]
```

## Admin e QA

```mermaid
flowchart TD
  A[Admin logado] --> B[Admin]
  B --> C[Mock Mode / QA Assistant]
  C --> D[Aplicar cenário]
  C --> E[Resetar dados mock]
  C --> F[Validar permissões]
  B --> G[Governo]
  B --> H[Visão ampla da operação]
```

## Regras por área

| Área | Embarcador | Transportador | Admin | Governo |
|---|---|---|---|---|
| Dashboard | Visão da própria operação | Operação + frota | Ampla | Agregada |
| Cargas | Marketplace público | Marketplace público | Ampla | Limitada ou não aplicável |
| Minhas cargas | Próprias cargas | Cargas atribuídas | Visão ampla se aplicável | Não acessa dados privados |
| Nova carga | Pode criar | Normalmente não cria | Pode criar | Não |
| Negociações | Próprias | Enviadas/recebidas | Ampla | Não |
| Embarcações | Relacionadas à operação | Frota | Ampla | Agregada |
| Rastreio | Próprio | Cargas atribuídas | Amplo | Agregado |
| Impacto | Próprio/agregado | Operacional | Amplo | Institucional |
| Governo | Se houver visão pública | Se houver visão pública | Acesso | Acesso principal |

## Observação de produto

- O embarcador compra/organiza carga.
- O transportador oferta capacidade e opera frota.
- O admin supervisiona e valida.
- O governo consome visões agregadas e institucionais, nunca dados privados sem regra explícita.
