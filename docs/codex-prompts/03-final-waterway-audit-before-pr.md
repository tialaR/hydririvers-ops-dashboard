Você está no projeto HydriRivers-Dashboard.

Objetivo:
Auditar a entrega completa de domínio hidroviário + lista de cargas + mapa imersivo antes de PR.

Não implemente feature nova.
Apenas corrija problemas pequenos encontrados na auditoria.

Atenção sobre rotas:
O projeto usa rotas com locale no App Router. Validar sempre:
- `/[locale]/cargas`
- `/pt-BR/cargas`
- `/en-US/cargas`
- `/es/cargas`

Não considerar `/cargas` sem locale como rota principal.
Não introduzir hrefs sem locale.

Auditar:
- tipos
- mocks
- lista de cargas
- filtros
- busca
- empty state
- mapa imersivo
- action sheet
- i18n
- acessibilidade
- responsividade
- animações
- testes
- preservação de rotas com `[locale]`

Rode buscas:

grep -RInE "Math.random|Date.now|getRandom|TODO|FIXME|hardcoded|waterway|CargoWaterwayTracking|HydroRoute" src

grep -RInE "href=\"/cargas|href='\/cargas|router\.push\(\"/cargas|router\.push\('/cargas|replace\(\"/cargas|replace\('/cargas" src || true

Checklist:
1. Não há Math.random/Date.now em render.
2. Não há dados reais.
3. Há pelo menos 2 exemplos por status/cenário real.
4. Lista mostra as cargas corretamente.
5. Filtros continuam funcionando.
6. Busca continua funcionando.
7. Empty state funciona.
8. Selecionar carga altera mapa.
9. Mapa exibe corredor, origem, destino, embarcação, progresso, ETA, risco e documentos.
10. Camadas não piscam.
11. i18n alinhado nos três idiomas.
12. Mobile não regressiu.
13. Desktop não regressiu.
14. Rotas continuam usando `[locale]`.
15. Não há href/push/replace novo para `/cargas` sem locale.

Comandos obrigatórios:

npm run lint
npm run typecheck
npm run check:i18n
npm run build
npm test
npm run test:mock-mode

Se houver falha, corrigir apenas dentro do escopo.
Não abrir refatoração grande.

Ao finalizar, responder:
1. Problemas encontrados.
2. Problemas corrigidos.
3. Confirmação dos 2 exemplos por status.
4. Confirmação de rotas com `[locale]` preservadas.
5. Resultado dos comandos.
6. Sugestão de título de PR.
7. Sugestão de descrição de PR.
