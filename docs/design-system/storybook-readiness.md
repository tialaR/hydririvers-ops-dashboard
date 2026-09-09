# Storybook readiness

Status: **implementado e validado**.

O catálogo vivo do HydroRivers usa Storybook com Next.js/Vite, temas Dark e Light e auditoria de acessibilidade bloqueante. A relação vigente de componentes e estados publicados está em [`STORYBOOK.md`](./STORYBOOK.md).

## Regras atuais

- publicar apenas componentes reais e contratos operacionais vigentes;
- não catalogar wrappers ou rotas com nomenclatura de lab/legado;
- cobrir variantes relevantes, estados vazios, inválidos, desabilitados e conteúdo longo;
- manter stories determinísticas e isoladas de estado global mutável;
- executar `npm run build-storybook` antes do merge;
- manter o catálogo alinhado ao inventário documentado em `STORYBOOK.md`.

O monorepo continua fora deste escopo e só deve ser considerado quando houver consumo real que justifique uma fronteira de pacote.
