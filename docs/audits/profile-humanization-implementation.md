# Auditoria — humanização da página de Perfil

## Problema observado

- O topo da página repetia linguagem genérica de “conta” e pouco explicava **valor operacional** do perfil.
- Nome completo em **caixa alta** ocupava o cartão e o header; faltava **nome compacto** legível com nome completo preservado no formulário.
- Linhas de e-mail, empresa, papel e validação pareciam lista administrativa, sem dizer **por que importam**.
- O formulário não explicava o benefício de manter dados atualizados.

## O que foi alterado

- **`PageShell`** em `src/app/[locale]/perfil/page.tsx` com copy `pages.profile` (identidade operacional, título e subtítulo).
- **`ProfilePanel`**: cartão de identidade com nome compacto (`getCompactUserDisplayName`), `title` com nome completo; badge e textos de acesso humanizados; nota de **ambiente demo**; cartão de detalhes com **label + dica + valor**; bloco “Por que manter isso atualizado?”; formulário com título, lead e dicas por campo.
- **`getCompactDisplayInitials`** em `user-display-name.ts` para avatares com iniciais alinhadas ao nome compacto; uso em **`admin-chrome`** e **`app-header`** (avatar mobile).
- **Estilos** (`profile-panel.module.scss`): cards alinhados ao DS (gradiente sutil, borda, foco visível, `padding-bottom` para bottom nav), layout responsivo em coluna única no mobile.

## Regra de nome compacto

Implementação existente ampliada por testes em `user-display-name.test.ts`:

- Partículas (`de`, `da`, `do`, …) são ignoradas na escolha do **último sobrenome significativo**.
- Caixa normalizada para título (ex.: `TIALA … ROCHA` → `Tiala Rocha`).
- `João Pedro Silva` → `João Silva`.
- Iniciais: primeira letra do primeiro nome + primeira do último token do nome compacto.

## Como a página responde “para que serve”

- Subtítulo do `PageShell` + bloco de valor com três bullets ligam dados a **acesso**, **empresa em cargas/contratos** e **contato operacional**.

## Design system

- Mesma linguagem visual de cards escuros com realce amarelo/teal já usada em outras áreas; bordas e raios consistentes; foco em teal no input.

## Testes executados

- `tests/unit/features/auth/user-display-name.test.ts` — nome compacto e iniciais.
- `tests/unit/app/profile-page.test.ts` — topo humanizado com `PageShell`.

## Privacidade

- Não foram alterados arquivos em `.mock-data/users.json` nem adicionados dados pessoais reais.

## Pendências

- Teste E2E opcional: fluxo completo de upload/remoção de foto após login mock.
- Opcional: alinhar 100% do `app-header` desktop com o mesmo padrão de nome do `admin-chrome` se no futuro o header público exibir texto ao lado do avatar.
