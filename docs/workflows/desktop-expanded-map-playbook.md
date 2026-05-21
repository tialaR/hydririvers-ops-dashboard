# Playbook do mapa desktop expanded

## Objetivo

O mapa desktop expanded deve ser uma experiência operacional hidroviária `map-first`.

Ele deve:

- parecer mapa, não dashboard;
- ocupar a viewport de forma inteligente;
- ser horizontal, amplo e interativo;
- destacar rota, origem, destino e embarcação;
- oferecer zoom, pan, reset, `fit route` e `recenter`;
- evoluir para marcadores vivos em fases futuras;
- preservar a identidade visual HydroRivers.

## Diferenças obrigatórias entre experiências

- mobile usa experiência própria e pode usar bottom sheet;
- desktop cockpit em `/<locale>/cargas` usa mapa compacto integrado à lista;
- desktop expanded em `/<locale>/cargas/[id]/mapa` é rota própria;
- desktop expanded não é modal;
- desktop expanded não é bottom sheet;
- desktop expanded não deve reaproveitar o componente visual mobile;
- dados e helpers podem ser compartilhados;
- UI principal do expanded deve ser desktop-only.

## Rota oficial

```text
/<locale>/cargas/[id]/mapa
```

## Decisão de arquitetura

- `src/app/[locale]/cargas/[id]/mapa/page.tsx` deve ser fino;
- a página deve resolver `locale`, `id` e dados básicos;
- componentes ricos devem viver em:

```text
src/features/dashboard/components/operations-board/desktop-cargo-map/
```

## Estrutura recomendada

- `desktop-cargo-map-expanded-page.tsx`
- `desktop-cargo-map-canvas.tsx`
- `desktop-cargo-map-toolbar.tsx`
- `desktop-cargo-map-hud.tsx`
- `desktop-cargo-map-floating-controls.tsx`
- `desktop-cargo-map-markers-layer.tsx`
- `desktop-cargo-map-route-layer.tsx`
- `desktop-cargo-map.module.scss`

Nem todos precisam existir desde o início, mas a evolução deve apontar para essa separação.

## Fases oficiais

### Fase 0

- limpar tentativa quebrada;
- salvar patch em `/tmp` se for necessário preservar experimento;
- garantir working tree limpo;
- isolar o escopo para não quebrar cockpit compact nem mobile.

### Fase 1

- criar rota expanded mínima e `map-first`;
- header mínimo;
- canvas dominante;
- sem rail pesado;
- sem cards inferiores;
- sem dashboard ao redor do mapa.

### Fase 2

- criar canvas desktop-only próprio;
- não usar `HydroRouteTrackingMapSvg` como visual principal do expanded sem adaptação apropriada;
- definir `viewBox` próprio;
- manter geometria determinística;
- favorecer rota horizontal ampla e legível.

### Fase 3

- implementar câmera e interação;
- zoom;
- pan/drag;
- reset;
- `fit route`;
- `recenter vessel`;
- cursor `grab` e `grabbing`.

### Fase 4

- marcadores vivos;
- origem pulsando;
- destino pulsando;
- embarcação com halo e pulso;
- rota com animação sutil;
- respeitar `prefers-reduced-motion`.

### Fase 5

- HUDs e controles flutuantes;
- legenda colapsável;
- painéis compactos;
- reduzir repetição de informação;
- mover o que for contexto operacional para overlays leves quando fizer sentido.

## Regras técnicas específicas

- não degradar o mapa compacto de `/<locale>/cargas`;
- não tocar mobile enquanto o escopo for desktop expanded;
- não usar `router.back()` como fluxo principal de fechar;
- o botão fechar deve navegar explicitamente para `/<locale>/cargas`;
- não hardcodar `CARGO-001`;
- `CARGO-001`, `CARGO-002` e `CARGO-004` devem continuar coerentes;
- usar helpers e adapters existentes de tracking quando possível;
- qualquer fallback deve ser determinístico por `cargo.id`.

## Prompt-modelo de auditoria

```text
MODO AUDITORIA SOMENTE.
NÃO IMPLEMENTAR.
NÃO EDITAR ARQUIVOS.

Estamos na branch <branch>.

Objetivo:
Auditar o mapa desktop expanded em /[locale]/cargas/[id]/mapa.

Arquivos permitidos:
- <lista permitida>

Arquivos proibidos:
- <lista proibida>

Requisito:
- desktop expanded deve ser map-first;
- desktop compact não pode degradar;
- mobile não pode ser tocado.

Auditar:
1. o que está errado visualmente;
2. o que está errado tecnicamente;
3. quais arquivos estão envolvidos;
4. quais mudanças devem ser revertidas;
5. plano mínimo de correção.
```

## Prompt-modelo de implementação

```text
MODO IMPLEMENTAÇÃO FOCADA.
NÃO FAZER COMMIT.
NÃO FAZER PUSH.

Use a auditoria anterior como fonte de verdade.

Objetivo desta fase:
<descrever apenas uma fase pequena>

Arquivos permitidos:
- <lista permitida>

Arquivos proibidos:
- <lista proibida>

Critérios de aceite:
- <lista visual e funcional>

Validação obrigatória:
- npm run lint
- npm run typecheck
- npm run check:i18n
- npm test
- npm run test:mock-mode
```

## Checklist visual

- a primeira impressão é mapa, não dashboard;
- o canvas domina a viewport;
- rota ampla e centralizada;
- origem clara;
- destino claro;
- embarcação clara;
- labels importantes não cortam;
- legenda não empurra o mapa;
- controles são claros;
- reset volta para enquadramento útil;
- `fit route` e `recenter` fazem sentido;
- compact continua estável;
- mobile continua intacto.

## Checklist de arquivos proibidos

- `src/app/globals.scss`
- `next-env.d.ts`
- componentes mobile
- bottom sheet/action sheet
- cards mobile
- mapa mobile
- `src/app/[locale]/cargas/[id]/cargo-map-immersive-client.tsx`
- auth/login/cadastro
- mocks globais fora do escopo

## Checklist de validação

```bash
npx sass --no-source-map src/features/dashboard/components/operations-board/operations-board.module.scss /tmp/operations-board.css
npx sass --no-source-map src/features/dashboard/components/operations-board/desktop-cargo-map/desktop-cargo-map.module.scss /tmp/desktop-cargo-map.css
npm run lint
npm run typecheck
npm run check:i18n
npm test
npm run test:mock-mode
```

## Sinais de regressão

- compact desktop ficou alto demais com mapa pequeno;
- expanded parece SVG ampliado em vez de câmera de mapa;
- metade inferior da viewport ficou vazia;
- labels ou embarcação cortam na direita;
- desktop voltou a usar modal;
- desktop passou a importar fluxo mobile;
- diff começou a tocar arquivos fora da feature sem necessidade.
