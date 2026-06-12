# Operation Zero Redemoinho — governança contra padrões paralelos

## Status

Aceito

## Contexto

O HydriRivers acumulou risco de *redemoinho arquitetural*: múltiplos padrões paralelos de UI, tokens (`--bn-*` vs `--hy-*`), labs temporários permanentes, strings hardcoded, magic numbers, componentes com lógica no corpo, arquivos fora de kebab-case e documentação citando rotas removidas.

Antes de novas implementações de fluxo transacional, o projeto precisa de um **gate único** que force reutilização, tokens nomeados, i18n, fronteiras feature/shared e proof auditável.

## Decisão

Adotar **Operation Zero Redemoinho** como política oficial de agentes e engenharia:

1. **Architecture Gate** obrigatório antes de implementar — buscar padrão existente; reutilizar ou documentar padrão novo.
2. **Tokens de componente** somente `--hy-<component>-<property>`; migrar legado ao tocar.
3. **Proibir** magic numbers e strings UI hardcoded sem exceção documentada.
4. **Kebab-case** obrigatório para paths novos; `.module.sass` preferido para estilos de componente.
5. **Componentes burros** + hooks locais; feature/shared boundaries rígidas.
6. **Labs temporários** removidos após validação; glass UI exige fundo colorido/rolável.
7. **Implementation Proof** estendido com audits de padrão, token, i18n, naming, sass, docs mortos, persona e CWV.
8. **Captain closeout 🟢** bloqueado quando qualquer violação acima permanece.

Documento canônico: `docs/agents/AGENTS-ZERO-REDEMOINHO.md`.  
Enforcement: `docs/agents/AGENTS-TASK-ROUTER.md`, `docs/agents/AGENTS-IMPLEMENTATION-PROOF.md`, `.cursor/rules/hydri-zero-redemoinho.mdc`.

## Consequências

**Ganhos:** menos duplicação, onboarding de agentes previsível, PRs menores, docs alinhados ao código.

**Custos:** agentes devem preencher proof mais longo; migrações incrementais de legado ao tocar arquivos.

**Riscos:** agentes podem ignorar regras sem CI enforcement — mitigação via closeout 🔴/🟡 e revisão humana.

## Alternativas consideradas

- **Lint customizado** para tokens/kebab-case — adiado; custo alto nesta rodada (escopo docs-only).
- **Big-bang rename** de legado — rejeitado; migração incremental *on touch* permanece.

## Data

2026-06-11

## Responsáveis

HydroRivers frontend/product team
