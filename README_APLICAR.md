# HydriRivers — pacote de prompts e auditoria

Este ZIP foi preparado para ser extraido na raiz do projeto `hydririvers-ops-dashboard`.

Ele cria:

- `docs/codex-prompts/01-connect-waterway-domain-to-cargo-list.md`
- `docs/codex-prompts/02-connect-selected-cargo-to-immersive-map.md`
- `docs/codex-prompts/03-final-waterway-audit-before-pr.md`
- `scripts/audit-waterway-flow.sh`

## Como aplicar

Na raiz do projeto:

```bash
unzip -o hydririvers-waterway-prompts-pack.zip -d .
chmod +x scripts/audit-waterway-flow.sh
```

## Como copiar prompts para usar no Codex

No macOS:

```bash
pbcopy < docs/codex-prompts/01-connect-waterway-domain-to-cargo-list.md
pbcopy < docs/codex-prompts/02-connect-selected-cargo-to-immersive-map.md
pbcopy < docs/codex-prompts/03-final-waterway-audit-before-pr.md
```

## Como auditar depois das alteracoes

```bash
scripts/audit-waterway-flow.sh
```

## Observacao importante sobre rotas

As rotas do projeto usam locale no App Router. Portanto, os prompts tratam as rotas como:

- `/[locale]/cargas`
- `/pt-BR/cargas`
- `/en-US/cargas`
- `/es/cargas`

Nao usar rotas sem `[locale]` como fonte de verdade.
