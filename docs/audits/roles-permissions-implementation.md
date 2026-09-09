# Implementação de papéis e permissões

## O que mudou

- A aplicação ganhou uma matriz central de acesso em `src/features/auth/domain/access-control.ts`.
- A navegação passou a filtrar itens por permissões reais, em vez de checagens soltas.
- Rotas administrativas e governamentais passaram a mostrar fallback humanizado quando acessadas sem permissão.
- A área de nova carga e a área de embarcações passaram a respeitar o papel do usuário.
- O catálogo do Mock Mode foi reorganizado por persona e jornada.
- Foram adicionados docs de produto/arquitetura para explicar regras e ajudar QA humano.
- Foi criado o ADR `0021` para consolidar o uso de capabilities + QA personas.

## Arquivos principais

- `src/features/auth/domain/access-control.ts`
- `src/shared/config/navigation.ts`
- `src/shared/routing/app-routes.ts`
- `src/shared/ui/mock-mode/mock-qa-assistant.tsx`
- `src/shared/ui/mock-mode/mock-qa-scenarios.ts`
- `src/shared/ui/mock-mode/mock-mode.module.scss`
- `src/app/[locale]/admin/page.tsx`
- `src/app/[locale]/governo/page.tsx`
- `src/app/[locale]/cargas/nova/page.tsx`
- `src/app/[locale]/embarcacoes/page.tsx`
- `src/app/[locale]/embarcacoes/[id]/page.tsx`
- `src/app/[locale]/negociacoes/[id]/page.tsx`

## Testes

- Helpers de acesso.
- Navegação filtrada por perfil.
- Cenários do Mock Mode com contagens de notificações.
- Rotas restritas com fallback humanizado.
- UI do QA Assistant com jornada recomendada.
- Docs essenciais de roles/permissões existem no repositório (teste de presença).

## Pendências

- Ainda não existe role `government` no modelo de autenticação.
- A visão governamental continua sendo uma área institucional restringida ao admin.

## Documentos relacionados

- `docs/product/roles-and-permissions.md`
- `docs/architecture/access-control-architecture.md`
- `docs/automation/qa-assistant-human-workflow.md`
- `docs/product/roles-permissions-user-cases.md`
- `docs/adr/0021-role-based-access-and-qa-personas.md`
