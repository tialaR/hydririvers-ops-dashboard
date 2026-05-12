# Roadmap futuro: Storybook e Monorepo (não implementado)

Data: 2026-05-11  
Status: **futuro** (este documento não descreve algo já entregue).

## Objetivo

Registrar que Storybook e monorepo são iniciativas valiosas, mas **adiadas** até que o produto esteja mais sólido em:

- onboarding (Login/Cadastro/OTP) claro;
- regras de negócio por perfil (shipper vs carrier vs admin/QA);
- navegação guiada por permissões;
- mocks por persona determinísticos (público vs privado);
- i18n humanizado;
- mobile estável (bottom nav/safe-area/BottomSheet);
- primitives visuais estabilizadas (sem “design system ornamental”).

## Por que não agora

- Trocar fundação antes de estabilizar regras de negócio aumenta risco de retrabalho.
- Storybook é mais útil quando componentes e variantes já têm contratos mais estáveis.
- Monorepo sem clareza de boundaries vira “condomínio de arquivos sem síndico”.

## Pré-requisitos (checklist)

- Papéis/permissões documentados e com testes.
- `Minhas Cargas` por usuário/persona funcionando com dados ricos.
- QA Assistant organizado por persona/jornada com catálogo validado.
- Mobile guidelines + workflows aplicados nas rotas principais.
- Quality gates consistentes (CI + reproduzível localmente).

## Próximos passos (quando chegar a hora)

Storybook:

- mapear quais primitives e padrões valem virar “stories”;
- definir estratégia de i18n/theme no Storybook;
- garantir que stories não dependam de mock state mutável.

Monorepo:

- definir boundary real (apps vs packages);
- extrair shared/ui e domain libs apenas quando houver consumo real;
- evitar mover “feature específica” para shared sem múltiplos consumidores.

