# Workflow oficial para iteração visual com Codex

## Objetivo

Padronizar como o time usa Codex em ajustes visuais complexos, com foco em mudanças pequenas, verificáveis e seguras para desktop, mobile, i18n e arquitetura.

## Princípios obrigatórios

- começar sempre com working tree limpo;
- trabalhar em fases pequenas e explícitas;
- pedir auditoria antes de implementar;
- nunca pedir "faça tudo" em features visuais grandes;
- nunca misturar desktop e mobile no mesmo escopo;
- sempre listar arquivos permitidos e arquivos proibidos;
- sempre anexar evidência visual do estado atual e da referência desejada;
- sempre pedir auditoria final do diff antes de encerrar a iteração;
- preservar arquitetura do projeto:
  - `app/` para routing, pages, layouts, RSC e server actions;
  - `features/` para UI rica, hooks, helpers, services, mocks e CSS Modules;
  - `shared/` apenas para itens realmente compartilhados.

## Regras de segurança e estabilidade

- não editar `src/app/globals.scss` para resolver UI de feature;
- não usar CSS global para componentes de feature;
- não usar `!important`;
- não instalar dependência sem justificativa;
- não usar `Math.random()` ou `Date.now()` em render;
- não usar `router.back()` ou `window.history.back()` como fluxo principal;
- preservar i18n, locale, mocks, auth, filtros, busca e listas existentes;
- tratar desktop e mobile como experiências separadas.

## Rodadas oficiais (A–E)

Cada iteração visual deve passar pelas rodadas abaixo, em chats ou prompts separados quando possível.

### Rodada A — auditoria visual

- modo: **auditoria somente**; não editar arquivos
- confirmar branch, escopo e fronteiras (desktop vs mobile)
- reunir evidência: print atual, vídeo, referência externa, baseline interna
- listar arquivos **permitidos** e **proibidos**
- entregar: o que está errado (visual e técnico), arquivos envolvidos, riscos e plano mínimo

### Rodada B — implementação pequena

- uma microfase por rodada; nunca “fazer tudo” de uma vez
- usar a Rodada A como fonte de verdade
- implementar apenas dentro do escopo e dos arquivos permitidos
- não misturar desktop e mobile no mesmo diff

### Rodada C — auditoria do diff

- revisar `git status --short`, `git diff --stat` e `git diff --check`
- confirmar que arquivos proibidos não foram tocados (`globals.scss`, mobile fora de escopo, etc.)
- validar diff **antes** de investir em build ou testes longos

### Rodada D — validação e teste visual

- rodar validações automáticas (ver seção abaixo)
- teste manual: desktop ou mobile conforme escopo, locales afetados
- checklist visual de aceite da fase

### Rodada E — próxima microfase

- documentar o que ficou de fora e riscos restantes
- se ainda houver gap visual, voltar à **Rodada A** com escopo da fase seguinte
- não acumular correções não auditadas na mesma sessão

## Fluxo operacional (detalhe)

1. Confirmar branch, escopo e fronteiras da tarefa.
2. Verificar `git status --short`.
3. Reunir o material visual (print, vídeo, referência, baseline).
4. Executar **Rodada A** (auditoria).
5. Executar **Rodada B** (implementação pequena).
6. Executar **Rodada C** (auditoria do diff).
7. Executar **Rodada D** (validação automática + teste visual).
8. Executar **Rodada E** (planejar próxima microfase ou encerrar).

## Estrutura recomendada para prompts

### Prompt de auditoria

- declarar o modo: `MODO AUDITORIA SOMENTE`;
- informar branch;
- listar arquivos permitidos;
- listar arquivos proibidos;
- descrever o requisito correto;
- anexar print, vídeo e referência;
- pedir diagnóstico visual, técnico e plano mínimo.

### Prompt de implementação

- declarar o modo: `MODO IMPLEMENTAÇÃO FOCADA`;
- informar branch;
- citar a auditoria anterior como fonte de verdade;
- limitar a fase atual;
- listar o que entra e o que fica explicitamente fora;
- exigir validações e auditoria final do diff.

## Checklist de entrada

- branch correta confirmada;
- `git status --short` executado;
- working tree limpo ou justificativa explícita para não implementar;
- print atual anexado;
- vídeo atual anexado;
- referência externa anexada, se houver;
- baseline interna anexada, se existir;
- critérios visuais de aceite definidos;
- lista de arquivos permitidos definida;
- lista de arquivos proibidos definida;
- desktop e mobile separados no escopo;
- estratégia de validação manual combinada.

## Checklist de saída

- `git status --short` revisado;
- `git diff --stat` revisado;
- `git diff --check` revisado;
- `next-env.d.ts` sem alteração;
- `src/app/globals.scss` sem alteração;
- arquivos mobile fora do escopo sem alteração;
- i18n alinhado em `pt-BR`, `en-US` e `es` quando aplicável;
- validações automáticas executadas;
- teste manual de desktop realizado;
- teste manual de mobile realizado;
- teste manual de locale realizado;
- riscos restantes documentados.

## Validações mínimas obrigatórias

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

Quando a mudança tocar fluxo de usuário, regra de negócio, navegação ou integrações, executar também:

```bash
npm test
npm run test:mock-mode
```

## Boas práticas para features visuais complexas

- preferir wrappers desktop-only ou mobile-only em vez de ifs espalhados;
- separar claramente canvas, HUD, controles e painéis quando a experiência for rica;
- isolar experimentação visual em componentes da feature, não em `shared/`;
- evitar misturar refatoração estrutural grande com correção visual no mesmo passo;
- guardar tentativas quebradas em patch temporário em `/tmp` quando for necessário limpar a árvore.

## Sinais de alerta

Interromper a implementação e voltar para auditoria quando ocorrer qualquer um destes casos:

- o compact desktop começou a degradar ao corrigir o expanded;
- desktop e mobile começaram a compartilhar componente visual principal;
- uma correção visual exige mexer em muitos arquivos fora da feature;
- o mapa ou canvas só melhora com `scale/translate` arbitrários sem entender `viewBox`, `aspect-ratio` e wrappers;
- o diff começou a incluir arquivos de auth, mocks globais, shell compartilhado ou mobile sem necessidade real.
