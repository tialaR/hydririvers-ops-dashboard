# Mobile Cargo Dev V2 — Dark/Light Toggle

## Objetivo

Criar uma segunda experiencia visual isolada para a lista mobile de cargas sem perder a experiencia anterior.

## Rotas

- `/[locale]/dev-v2`
- `/[locale]/dev-v2/mobile-cargo-list-lab`

## Comportamento

- A tela abre em dark mode por padrao.
- O botao no header alterna entre dark e light mode.
- O filtro e o sheet continuam isolados nesta rota.

## Arquivos

- `src/app/[locale]/dev-v2/page.tsx`
- `src/app/[locale]/dev-v2/mobile-cargo-list-lab/page.tsx`
- `src/features/cargo/components/mobile-list-lab-v2/mobile-cargo-list-lab-v2.tsx`
- `src/features/cargo/components/mobile-list-lab-v2/mobile-cargo-list-lab-v2.module.scss`
