# QA Assistant: roteiro humano (manual assistido)

Data: 2026-05-11

Este roteiro orienta QA humano a usar o painel "Modo mock · QA Assistant" para validar jornadas por persona.

## Como aplicar um cenario

1. Abra "Modo mock · QA Assistant".
2. Filtre por persona/jornada quando fizer sentido.
3. Leia objetivo e risco coberto.
4. Use "Abrir rota" para iniciar.
5. Execute os passos e compare com o resultado esperado.

## Como resetar

- Use o reset do painel para voltar ao dataset base.
- Se o ambiente usar `.mock-data/*.json`, aplique o reset local conforme scripts do projeto (quando existirem).

## Checklist por persona

### Visitante (nao autenticado)
- Consegue abrir Home e Cargas publicas.
- Rotas privadas exibem fallback humanizado (nao 404 generico).

### Embarcador (shipper)
- "Minhas cargas" mostra apenas itens do embarcador.
- Carga propria abre em `/minhas-cargas/[id]`.
- Pode criar/publicar carga quando aprovado.
- Empty state (quando sem cargas) tem CTA coerente para criar carga.

### Transportador (carrier)
- "Minhas cargas" mostra apenas itens atribuidos ao transportador.
- Carga atribuida abre em `/minhas-cargas/[id]`.
- Empty state nao deve sugerir "publicar carga".
- CTA do empty state deve orientar para "ver oportunidades publicas".

### Admin/QA
- Consegue aplicar/resetar datasets quando permitido.
- Consegue validar permissoes por role/capability.

## Como reportar bug

Inclua:
- scenario id
- persona usada
- rota inicial
- passos executados
- resultado esperado vs observado
