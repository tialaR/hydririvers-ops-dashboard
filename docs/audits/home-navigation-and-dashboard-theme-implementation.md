# Auditoria — navegação inicial e ajuste do toggle de tema na sidebar

**Data:** 2026-05-10  
**Escopo:** `src/shared/layout/admin-chrome/admin-chrome.tsx`, `src/app/globals.scss`, `src/shared/ui/theme-toggle/*`.

## Problema observado

- O footer da sidebar exibia o controle de tema com um wrapper extra, criando a sensação de “cápsula dentro de cápsula”.
- Isso aumentava o peso visual e deixava o toggle desproporcional em relação aos controles de idioma e logout.

## Solução aplicada

- Removido o wrapper redundante ao redor do `ThemeToggle` no `AdminChrome`.
- Mantida a funcionalidade de troca de tema, com `variant="pill"` no layout expandido e `variant="icon"` quando a sidebar está recolhida.
- Ajustado o CSS global para o footer da sidebar ficar mais compacto e alinhado.

## Ajuste adicional de navegação

- A rota `Home` deixou de ficar órfã no shell administrativo e passou a aparecer na navegação lateral e no atalho mobile.
- O cabeçalho do shell passou a respeitar a rota ativa, deixando de exibir `Dashboard · Operações Fluviais` na Home.
- O texto do cabeçalho agora diferencia a Home do Dashboard sem alterar a responsabilidade de cada página.

## Risco de regressão

- Baixo: a alteração é visual e limitada ao footer da sidebar.
- O comportamento de dark/light continua vindo do mesmo componente e da mesma persistência.

## Testes e validação

- Adicionado teste unitário para garantir que o `ThemeToggle` continua renderizando com `aria-label` e `data-variant` corretos.
- Adicionado teste para garantir que a navegação canônica preserva `Home` como item ativo e visível.
- A suíte de tema existente continua cobrindo persistência em e2e.

## Pendências

- A validação final de alinhamento visual depende de revisão no navegador, principalmente em sidebar recolhida e em breakpoints menores.
