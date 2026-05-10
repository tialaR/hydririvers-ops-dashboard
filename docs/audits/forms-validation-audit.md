# Auditoria de validação de formulários — HydroRivers

## Resumo executivo

O projeto já tinha Zod bem consolidado no domínio de auth, mas a camada de UI ainda validava vários formulários de forma manual. Nesta rodada, padronizei a publicação de carga, o perfil e a proposta de negociação com schemas Zod reaproveitados no cliente e no servidor. Auth continua parcialmente padronizado: o domínio é forte, mas a tela ainda usa estado local em vez de React Hook Form.

## Matriz de status

| Formulário | Status | Evidência no código | Problemas encontrados | Próximo passo |
| --- | --- | --- | --- | --- |
| Login | Implementado parcial | `src/features/auth/components/auth-form/auth-form.tsx`, `src/features/auth/domain/auth-schemas.ts` | Usa Zod no domínio e `safeParse`, mas ainda depende de estado local e validação manual no componente | Migrar para React Hook Form quando o fluxo de auth for refeito de forma incremental |
| Register | Implementado parcial | `src/features/auth/components/auth-form/auth-form.tsx`, `src/features/auth/domain/auth-schemas.ts` | Mesma limitação do login: valida com Zod, mas o estado e as mensagens continuam manuais | Consolidar com RHF sem mexer no fluxo OTP |
| OTP | Implementado parcial | `src/features/auth/components/auth-form/auth-form.tsx`, `src/features/auth/domain/auth-schemas.ts` | Código OTP já valida por schema, mas o fluxo completo ainda é orquestrado manualmente | Separar o bloco OTP em um formulário controlado quando houver janela para isso |
| Nova carga | Implementado | `src/features/cargo-market/components/new-cargo-form/new-cargo-form.tsx`, `src/features/cargo-market/domain/new-cargo-form.schema.ts`, `src/features/cargo-market/actions/publish-cargo-action.ts`, `src/app/api/cargas/route.ts` | Antes usava checagem manual de campos; agora client e server compartilham schema Zod | Avaliar migração para RHF apenas se houver necessidade de erros por campo |
| Perfil | Implementado | `src/features/auth/components/profile-panel/profile-panel.tsx`, `src/features/auth/domain/profile.schema.ts`, `src/app/api/auth/profile/route.ts` | Antes era totalmente manual; agora valida com schema no cliente e no servidor | Se necessário, migrar inputs para RHF para exibir erros por campo |
| Negociações | Implementado parcial | `src/features/cargo-market/components/cargo-detail/cargo-detail.tsx`, `src/features/cargo-market/domain/cargo-proposal.schema.ts`, `src/app/api/negociacoes/route.ts` | A proposta de negociação ainda é um form manual, mas já ganhou schema Zod para validação do submit | Extrair o formulário em componente dedicado e considerar RHF |
| Filtros complexos | Não aplicável | `src/features/cargo-market/components/cargo-list/cargo-list.tsx` | A UI de filtros é majoritariamente instantânea e não funciona como formulário clássico de submit | Manter manual por enquanto; só migrar se surgir submit formal |

## Mudanças feitas

- Criei schemas Zod específicos para `nova carga`, `perfil` e `proposta de negociação`.
- Reaproveitei os schemas no cliente e no servidor para evitar divergência de contrato.
- Troquei a validação manual da nova carga por `safeParse` com schema.
- Passei o perfil a rejeitar payload inválido antes de chamar `updateProfile`.
- Validei a proposta de negociação antes de enviar o `POST /api/negociacoes`.
- Adicionei testes unitários cobrindo os novos schemas.

## Lacunas restantes

- Auth/login/register/OTP ainda usam estado local e validação manual no componente; o domínio já está com Zod, mas a UI não migrou para RHF.
- Não há padronização de React Hook Form em nenhum formulário crítico ainda.
- Filtros complexos seguem como UI manual sem schema porque não há submit formal neste fluxo.

## Comandos executados

- `npx vitest run tests/unit/features/forms-validation.test.ts tests/integration/api/auth.profile.put.test.ts tests/integration/api/cargas.post.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run check:i18n`

## Resultados

- `vitest` parcial: passou, 3 arquivos e 18 testes.
- `typecheck`: passou.
- `lint`: passou.
- `npm test`: passou, 33 arquivos e 212 testes.
- `build`: travou em `Creating an optimized production build ...`; o processo `node /Users/tialarocha/Desktop/hydrorivers-dashboard-v27-sidebar-controls/node_modules/.bin/next build` foi identificado com PID `68051` e encerrado manualmente.
- `check:i18n`: passou, com `1230` chaves alinhadas em `pt-BR`, `en-US` e `es`.

