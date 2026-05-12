# Propósito da página Impacto

## Para que serve

A rota **Impacto** (`/impacto`) apresenta **indicadores narrativos** que ligam a operação fluvial do produto a temas de custo, ambiente, região, documentos, conectividade e visão institucional. Ela não substitui estudo de viabilidade nem auditoria ambiental.

## Valor para o usuário

- **Embarcador / transportador**: prioriza o que observar em **Cargas**, **Negociações**, **Rastreio** e documentos antes de comunicar benefícios a terceiros.
- **Stakeholder público**: usa blocos de evidência e limites para separar **dado agregado de demo** de **fonte pública** (quando cadastrada).

## O que é “dado” aqui

- **Demonstrativo / mock**: cenários do produto para treino de decisão (rótulos nos cartões).
- **Estimativa**: valores ou comparações que dependem de rota, ocupação e modal substituído — sempre com seção **Limites da estimativa** no detalhe quando há narrativa numérica forte na lista.
- **Fonte pública**: entradas em `impact-evidence.ts` com URL institucional; a UI mostra badge por tipo (`Fonte pública`, `Política pública`, etc.).

## Leitura recomendada

1. Cartão na lista → chip de **tipo de valor** + chip de **confiança**.
2. Detalhe → **O que isso significa** → **Como isso entrega valor** → **Evidências** → **Limites** → **O que observar na operação**.

## Idiomas

Copy alinhada em **pt-BR**, **en-US** e **es** em `messages/*.json` (`pages.impact`, `pages.impactDetail`, `impactCards.*`).
