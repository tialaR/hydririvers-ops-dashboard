# Mobile Cargo Round 26 — Filter Menu Frosted Glass UX

## Objetivo

Preservar a correção de hierarquia/hit-test da Round 25, mas melhorar a percepção visual do menu de filtros:

- o fundo da página continua visível fora do menu;
- o blur forte fica concentrado dentro do próprio menu;
- a área sob o menu fica turva e escurecida o suficiente para não atrapalhar a leitura;
- o menu continua capturando todos os toques enquanto aberto;
- nenhuma ação por baixo deve ser acionada.

## Arquivos alterados

- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss`
- `src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx` preservado da Round 25 para manter o modal firewall operacional.
