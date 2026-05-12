# Auditoria — Humanização de Impacto (Estado Atual)

Data: 2026-05-11

## Problema observado

A página **Impacto** estava comunicando claims fortes (ex.: percentuais) sem diferenciar claramente:

- dado real do produto vs mock demonstrativo;
- estimativa vs evidência pública;
- contexto institucional (ex.: BR do Mar) vs promessa de execução.

Isso aumenta risco de credibilidade e pode soar como “galeria de frases fortes” para usuários leigos.

## Claims identificadas (antes)

- “-28% redução de custo logístico” (sem fonte explícita)
- “-38% CO₂ evitado” (sem fonte específica para o percentual)
- “+12 rotas otimizadas” (indicador mock, sem contextualização)
- “72% pronto” (sem definição clara)
- “offline-first” (pode ser lido como funcionalidade pronta)
- “piloto Gov” (pode parecer piloto real)

## Riscos

- Greenwashing por falta de fonte/limites.
- Confusão entre política pública e compromisso de produto.
- Usuário leigo não entende o que é dado, estimativa ou evidência.

## Recomendação

1. Reduzir percentuais absolutos sem fonte específica e sinalizar quando for estimativa demonstrativa.
2. Criar modelo de evidência pública estático (sem fetch em runtime).
3. Reorganizar o detalhe para explicar significado, valor e limites.

