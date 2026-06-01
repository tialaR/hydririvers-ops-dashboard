# Mobile Cargo Dev V2 Light Mode

Nova rota experimental para testar uma direcao visual alternativa da lista de cargas sem tocar na rota anterior.

## Rotas

- `/pt-BR/dev-v2`
- `/pt-BR/dev-v2/mobile-cargo-list-lab`

## Objetivo

Validar uma experiencia visual mais clara, leve e operacional:

- light mode premium;
- cards brancos com alto contraste;
- bottom dock no estilo da experiencia anterior;
- filtros e sheet isolados nessa rota;
- sem alterar `/pt-BR/dev/mobile-cargo-list-lab`.

## Arquivos

- `src/app/[locale]/dev-v2/page.tsx`
- `src/app/[locale]/dev-v2/mobile-cargo-list-lab/page.tsx`
- `src/features/cargo/components/mobile-list-lab-v2/mobile-cargo-list-lab-v2.tsx`
- `src/features/cargo/components/mobile-list-lab-v2/mobile-cargo-list-lab-v2.module.scss`
