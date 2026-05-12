# Auditoria: Header responsivo (estado atual)

Data: 2026-05-11  
Branch: `feat/mock-mode-qa-assistant`

## Problema observado

Em desktop/tablet, o campo de busca pode crescer e competir com:

- pill de status do sistema;
- botao de notificacoes;
- resumo de perfil (avatar + nome + role).

Quando o layout nao encolhe de forma previsivel, o header "esmaga" controles laterais ou cria overflow.

## Componentes envolvidos

- `src/shared/layout/admin-chrome/admin-chrome.tsx` (estrutura do header desktop)
- `src/app/globals.scss` (classes globais `hx-*`):
  - `.hx-topbar`, `.hx-top-search`, `.hx-top-actions`, `.hx-system-pill`, `.hx-profile`

## Causa provavel

- `.hx-topbar` usa grid com `minmax(270px, 420px)` e `minmax(280px, 1fr)`, o que reduz a capacidade de "encolher" titulo/busca em larguras intermediarias.
- `.hx-top-actions` tem `min-width: 0`, mas elementos dentro podem ser comprimidos se a busca nao tiver limite claro de encolhimento.
- `.hx-profile strong` nao aplicava ellipsis, o que piora quando nome e longo.

## Riscos

- area clicavel de notificacoes/perfil fica pequena.
- layout "oval" do perfil e textos quebrados.
- experiencia inconsistente entre desktop/tablet.

## Plano de correcao (incremental)

1. Ajustar grid do header para:
   - titulo ser flexivel (`minmax(0, 1fr)`);
   - busca ter limite (`minmax(0, 520px)`);
   - acoes ficarem como coluna `auto` sem serem esmagadas.
2. Busca:
   - `width: 100%` e `max-width` para nao invadir acoes.
3. Acoes:
   - garantir `flex: 0 0 auto` em status/notificacoes/perfil.
4. Perfil:
   - aplicar ellipsis no nome;
   - exibir nome compacto (primeiro + ultimo) via helper de dominio.

