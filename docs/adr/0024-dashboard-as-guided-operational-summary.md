# ADR 0024: Dashboard como resumo operacional guiado

Status: **accepted**  
Data: 2026-05-11

## Contexto

O HydroRivers precisa oferecer uma tela inicial operacional que seja util tanto para usuarios experientes quanto para pessoas leigas (primeiro contato). O Dashboard ja reune metricas e paineis, mas precisava explicar melhor "para que serve" e evitar redundancias de CTA.

## Problema

- Copy tecnica demais nao orienta usuarios leigos.
- CTAs duplicados aumentam ruido visual e confundem prioridades.
- Numeros e listas podem parecer soltos sem contexto.

## Decisao

O Dashboard deve funcionar como um **resumo operacional guiado**:

- contextualiza o usuario (onde estou e o que vejo);
- resume o que merece atencao agora;
- oferece uma "ponte" clara para acao (marketplace publico vs minhas cargas privadas);
- evita duplicacao de CTAs e detalhes profundos que pertencem a outras rotas.

## Alternativas consideradas

1. Manter o Dashboard estritamente tecnico/operacional (sem onboarding/copy explicativa).
2. Transformar o Dashboard em uma listagem de cargas (copiando `Cargas`).
3. Criar um dashboard separado para cada role com telas diferentes.
4. Adotar resumo guiado (decisao), preservando o papel do Dashboard como cockpit e mantendo detalhes nas rotas certas.

## Consequencias positivas

- Melhor entendimento para usuarios leigos sem perder utilidade operacional.
- Menos ruido e repeticao de CTA.
- Maior coerencia com a linguagem visual e informacional do produto.

## Trade-offs

- Exige cuidado para nao virar "marketing": copy deve ser humana e util, sem prometer o que nao existe.
- Pode exigir evolucao por role (shipper vs carrier) com cuidado para nao fragmentar UI.

## Criterios de revisao futura

- Se o Dashboard ficar grande demais, reavaliar que blocos devem sair para rotas de detalhe.
- Se roles pedirem visoes muito diferentes, considerar variacao por capability sem duplicar layout inteiro.

## Links relacionados

- `docs/product/dashboard-ux-purpose.md`
- `docs/product/dashboard-information-architecture.md`
- `docs/adr/0017-dashboard-as-operational-cockpit.md`
- `docs/adr/0016-dashboard-cargas-minhas-cargas-boundaries.md`

