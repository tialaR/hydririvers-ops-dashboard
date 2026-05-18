# Rota própria para o mapa desktop expanded de cargas

## Status

Proposto

## Contexto

O HydroRivers possui uma experiência desktop para `/<locale>/cargas` com mapa compacto integrado à lista e uma experiência mobile própria com padrões diferentes de navegação e sobreposição. O mapa desktop expanded precisa oferecer uma experiência mais rica, horizontal, compartilhável por URL e alinhada ao App Router do Next.js.

Ao longo das iterações, soluções baseadas em modal local, overlay ou reaproveitamento direto da UI mobile mostraram alto risco de acoplamento, regressão visual e confusão de responsabilidade entre `app/` e `features/`.

## Decisão

Adotar uma rota própria para o mapa desktop expanded:

```text
/<locale>/cargas/[id]/mapa
```

Diretrizes da decisão:

- `src/app/[locale]/cargas/[id]/mapa/page.tsx` deve ser fino;
- a página deve apenas resolver params, locale e dados básicos;
- a UI rica do desktop expanded deve viver em `src/features/dashboard/components/operations-board/desktop-cargo-map/`;
- o botão de fechar deve navegar explicitamente para `/<locale>/cargas`;
- o desktop expanded não deve ser modal;
- o desktop expanded não deve ser bottom sheet;
- o desktop expanded não deve reaproveitar o componente visual principal do mobile.

## Consequências

### Consequências positivas

- URL compartilhável e reproduzível para QA, produto e engenharia;
- alinhamento claro com o App Router e com segmentos de rota localizados;
- separação mais limpa entre cockpit compacto e experiência expanded;
- permite construir uma página desktop `map-first` sem empilhar chrome local em `/cargas`;
- reduz o risco de misturar padrões desktop e mobile;
- facilita evolução incremental de câmera, HUD, controles e camadas do mapa expanded.

### Consequências negativas ou trade-offs

- adiciona uma rota e uma superfície visual nova para manter;
- exige disciplina para não duplicar lógica de tracking entre cockpit e expanded;
- aumenta a necessidade de garantir consistência visual e funcional entre compact e expanded;
- requer testes manuais específicos por locale e por carga.

## Alternativas consideradas

### Modal local dentro de `/cargas`

Rejeitada.

- não gera URL compartilhável;
- aumenta acoplamento com estado local do cockpit;
- incentiva uma composição de overlay que tende a parecer dashboard expandido, não página de mapa;
- dificulta QA reproduzível e navegação explícita.

### Query param em `/<locale>/cargas/[id]?view=mapa`

Rejeitada.

- mistura estados de página com uma experiência visual significativamente diferente;
- incentiva condicionais grandes dentro da rota `[id]`;
- torna mais difícil separar compact, detalhe e expanded com clareza arquitetural;
- piora legibilidade de navegação e responsabilidades.

### Reutilizar o mapa mobile como UI principal

Rejeitada.

- desktop e mobile são experiências separadas;
- mobile pode usar bottom sheet e composição vertical;
- desktop expanded precisa ser horizontal, amplo e interativo;
- reaproveitar a UI principal do mobile aumenta o risco de compromissos ruins para as duas plataformas.

### Reaproveitar o componente compacto como visual principal do expanded

Adiada como base principal.

- helpers e dados podem ser compartilhados;
- a experiência visual principal do expanded não deve ser apenas o compact ampliado;
- o expanded precisa de câmera, geometria, canvas e chrome próprios para parecer mapa operacional.

## Links relacionados

- [ADR 0001 existente sobre arquitetura por features](./0001-feature-based-architecture.md)
- [playbook do mapa desktop expanded](../workflows/desktop-expanded-map-playbook.md)
- [workflow oficial de iteração visual com Codex](../workflows/codex-visual-iteration.md)

## Data

2026-05-18

## Responsáveis

HydroRivers frontend/product team
