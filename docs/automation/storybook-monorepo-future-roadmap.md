# Storybook entregue; monorepo permanece futuro

Data: 2026-05-11  
Status: **Storybook implementado; monorepo não iniciado**.

> A decisão antiga de adiar o Storybook foi superada pelo ciclo de estabilização do Design System. O catálogo vigente e sua cobertura estão documentados em [`../design-system/STORYBOOK.md`](../design-system/STORYBOOK.md). O histórico abaixo permanece para explicar os pré-requisitos originais.

## Objetivo

Registrar que Storybook e monorepo são iniciativas valiosas, mas **adiadas** até que o produto esteja mais sólido em:

- onboarding (Login/Cadastro/OTP) claro;
- regras de negócio por perfil (shipper vs carrier vs admin/QA);
- navegação guiada por permissões;
- mocks por persona determinísticos (público vs privado);
- i18n humanizado;
- mobile estável (bottom nav/safe-area/BottomSheet);
- primitives visuais estabilizadas (sem “design system ornamental”).

## Por que o monorepo não entra agora

- Trocar fundação antes de estabilizar regras de negócio aumenta risco de retrabalho.
- Monorepo sem clareza de boundaries vira “condomínio de arquivos sem síndico”.

## Pré-requisitos (checklist)

- Papéis/permissões documentados e com testes.
- `Minhas Cargas` por usuário/persona funcionando com dados ricos.
- QA Assistant organizado por persona/jornada com catálogo validado.
- Mobile guidelines + workflows aplicados nas rotas principais.
- Quality gates consistentes (CI + reproduzível localmente).

## Próximos passos do monorepo (quando houver consumo real)

- definir boundary real (apps vs packages);
- extrair shared/ui e domain libs apenas quando houver consumo real;
- evitar mover “feature específica” para shared sem múltiplos consumidores.
