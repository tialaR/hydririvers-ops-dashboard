# Checklist de qualidade

## UI

- [ ] layout segue o design system;
- [ ] não há desalinhamentos;
- [ ] cards e headers mantêm consistência;
- [ ] sem sobreposição entre overlays.

## Responsividade

- [ ] 320px / 360px / 375px / 390px / 414px / tablet / desktop testados;
- [ ] textos não quebram de forma ruim;
- [ ] botões cabem sem estourar;
- [ ] bottom nav não cobre conteúdo.

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

- [ ] typecheck;
- [ ] lint;
- [ ] check:i18n;
- [ ] unit;
- [ ] integration;
- [ ] build quando o ambiente estiver estável.

## Documentação e ADR

- [ ] ADR relevante atualizada;
- [ ] docs de feature atualizadas;
- [ ] audit criado quando houver decisão nova;
- [ ] onboarding revisado quando scripts mudarem.

## CI/CD

- [ ] workflow de CI executa validações reais;
- [ ] workflow de PR evita regressão;
- [ ] secrets documentados sem vazamento;
- [ ] build monitorado com atenção.
