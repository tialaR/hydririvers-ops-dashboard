# Checklist de qualidade

Data: 2026-05-11

## Pré-commit (higiene do repo)

- [ ] `git status` não inclui `node_modules/`.
- [ ] `git status` não inclui artefatos de build (`.next/`, `dist/`, etc.), salvo decisão explícita documentada.
- [ ] `.mock-data/*.json` **não** aparece staged (privacidade e determinismo).
- [ ] não há PII real em seeds/documentos (e-mail/telefone/nome/avatars base64).

## UI

- [ ] layout segue a linguagem visual operacional (referência: tela de Cargas) sem copiar a função da tela;
- [ ] não há desalinhamentos;
- [ ] cards e headers mantêm consistência;
- [ ] sem sobreposição entre overlays.

## Responsividade

- [ ] 320px / 360px / 375px / 390px / 414px / tablet / desktop testados;
- [ ] textos não quebram de forma ruim;
- [ ] botões cabem sem estourar;
- [ ] bottom nav não cobre conteúdo (safe-area e padding-bottom ok);
- [ ] floating actions não cobrem cards/CTAs primários.

## UI consistency (rotas)

- [ ] rotas principais têm título/subtítulo coerentes com o papel da página;
- [ ] Home não é chamada de Dashboard;
- [ ] Dashboard continua cockpit operacional (não “lista de cargas disfarçada”);
- [ ] marketplace (`/cargas`) continua público/compartilhado;
- [ ] “Minhas Cargas” (`/minhas-cargas`) continua privado por usuário/persona.

## Acessibilidade

- [ ] botões icon-only têm `aria-label`;
- [ ] foco visível;
- [ ] dialogs e sheets têm semântica correta;
- [ ] contraste adequado;
- [ ] teclado funciona.

## i18n

- [ ] textos visíveis traduzidos;
- [ ] chaves alinhadas;
- [ ] sem hardcoded copy óbvia;
- [ ] mensagens humanas.

## Tema

- [ ] dark mode legível;
- [ ] light mode legível;
- [ ] tokens usados;
- [ ] sem cores hardcoded problemáticas.

## Permissões e dados (produto)

- [ ] regra de negócio não está espalhada em JSX;
- [ ] navegação é filtrada por permissões/capabilities;
- [ ] acesso direto a rota restrita mostra fallback humanizado (não 404 genérico);
- [ ] `/cargas` não vaza dados privados de `/minhas-cargas`;
- [ ] `/minhas-cargas/[id]` valida ownership/assignment.

## Performance

- [ ] mapa e overlays pesados revisados;
- [ ] imagens estáveis;
- [ ] sem CLS perceptível;
- [ ] bundle sem regressão óbvia.

## Serviços e hooks

- [ ] regra de negócio fora da UI;
- [ ] services retornam tipos explícitos;
- [ ] hooks têm responsabilidade clara.

## Types

- [ ] sem `any` desnecessário;
- [ ] mocks tipados;
- [ ] validação explícita em dados externos;
- [ ] schemas usados onde há formulário.

## Testes

- [ ] `npm run typecheck`;
- [ ] `npm run lint`;
- [ ] `npm run check:i18n`;
- [ ] `npm test` (Vitest, suíte completa);
- [ ] `npm run test:mock-mode` (regressão Mock Mode / cenários críticos — ver `package.json`);
- [ ] `npm run test:unit` / `npm run test:integration` quando o PR tocar APIs ou domínio;
- [ ] `npm run build` antes de merge ou quando o CI principal (`ci.yml`) for referência (o job de PR `verify` **não** inclui build).

**Agregado local (espelho do PR):** `npm run verify` = lint + typecheck + check:i18n + test + test:mock-mode.

**Scripts não existentes neste repo:** `verify:qa`, `check:mock-data` — não documentar como obrigatórios até existirem no `package.json`.

## Documentação e ADR

- [ ] ADR relevante atualizada;
- [ ] docs de feature atualizadas;
- [ ] audit criado quando houver decisão nova;
- [ ] onboarding revisado quando scripts mudarem.

## CI/CD

- [ ] workflow de CI executa validações reais (ver [CI-QUALITY-GATES.md](../CI-QUALITY-GATES.md));
- [ ] workflow de PR evita regressão (`verify` + onboarding + audit de docs);
- [ ] secrets documentados sem vazamento;
- [ ] build monitorado com atenção no pipeline principal (`ci.yml`).

## Referências

- `docs/automation/mock-data-privacy-workflow.md`
- `docs/automation/qa-assistant-human-workflow.md`
- `docs/automation/mobile-ui-quality-workflow.md`
- `docs/automation/navigation-route-quality-workflow.md`
- `docs/automation/filter-quality-workflow.md`
