# Decisão de produto: Início, Dashboard, Cargas e Minhas Cargas

Data: 2026-05-11

## 1. Problema

Em determinados momentos do produto, uma página “hero”/apresentação pode ser renderizada dentro do mesmo shell (header/sidebar) das rotas operacionais. Quando isso acontece sem rota/nome claros:

- a página fica órfã (sem item no menu);
- o header pode chamar a tela de “Dashboard” mesmo quando ela não é cockpit operacional;
- o usuário perde orientação sobre “onde estou” e “qual é a função desta tela”.

## 2. Decisão

Separar explicitamente o papel de cada rota principal:

- **Início/Home**: porta narrativa do produto (o “porquê” e “o que é”).
- **Dashboard**: cockpit operacional (o “agora”: atenção, operação, atalhos).
- **Cargas**: marketplace/listagem pública (o “que existe disponível”).
- **Minhas Cargas**: área privada do usuário atual (o “meu universo operacional”).

Regra: **não transformar Home em Dashboard** e **não transformar Dashboard em landing**.

## 3. Rotas e menu (intenção)

| Rota (por locale) | Nome no menu | Papel | Pergunta que responde |
|---|---|---|---|
| `/{locale}` | Início | narrativa | "O que é o HydroRivers?" |
| `/{locale}/dashboard` | Dashboard | operação | "O que exige ação agora?" |
| `/{locale}/cargas` | Cargas | marketplace | "Quais oportunidades existem?" |
| `/{locale}/minhas-cargas` | Minhas Cargas | privado | "Quais cargas estão comigo (minhas/atribuídas)?" |

Observação: se uma rota estiver fora do shell administrativo (pública), documentar a exceção em `docs/product/` e no ADR aplicável.

## 4. Header e navegação

Regras de UI:

- O header deve refletir a rota real (ex.: Home não pode exibir título de Dashboard).
- O menu lateral não deve deixar rota principal órfã (toda rota principal tem item ou decisão explícita).
- Active state precisa ser específico (evitar `startsWith` genérico que marque item errado).

## 5. Riscos evitados

- Página órfã (sem acesso explícito).
- Dashboard confundido com landing page.
- Duplicação de propósito entre telas.
- Active state incorreto.
- Usuário sem orientação de navegação.

## 6. ADR relacionado

- `docs/adr/0019-home-navigation-boundaries.md`

