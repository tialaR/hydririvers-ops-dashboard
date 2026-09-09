# ADR 0029 — Dados mock fictícios e determinísticos

- **Status:** Aceito  
- **Data:** 2026-05-11  

## Contexto

O produto depende de mocks (serviços, JSON em `.mock-data`, personas de QA) para demonstração e testes. Dados reais de pessoas ou empresas não podem entrar no repositório; valores não determinísticos no render quebram SSR/hidratação e tornam testes frágeis.

## Decisão

1. **Ficção:** todo conteúdo de exemplo em código, testes e documentação versionada usa identidades, contactos e documentos **claramente fictícios** (ex.: `example.com`, telefones de exemplo, nomes genéricos).  
2. **Determinismo:** mocks e cenários de QA expostos a testes devem ser **reproduzíveis**; evitar `Date.now()` / `Math.random()` em caminhos de render partilhados entre servidor e cliente sem isolamento.  
3. **Fronteiras:** a separação marketplace público vs minhas cargas privadas e as regras de papel/capability permanecem nas ADRs e código existentes ([0016](./0016-dashboard-cargas-minhas-cargas-boundaries.md), [0020](./0020-roles-permissions-access-control.md), [0021](./0021-role-based-access-and-qa-personas.md)); esta ADR reforça apenas a política de **dados e estabilidade** dos mocks.

## Consequências

- PRs que introduzam PII ou segredos devem ser bloqueados na revisão.  
- Novos fluxos de demo devem reutilizar padrões de seeds e i18n já alinhados a [0005](./0005-mock-first-domain-services.md) e [0013](./0013-feature-mocks-and-business-scope.md).

## Alternativas consideradas

- **Dados “realistas” copiados da web:** rejeitado (risco legal e de privacidade).  
- **Aleatoriedade livre nos mocks:** rejeitado para caminhos cobertos por teste ou render híbrido.

## Referências

- [0013 - Feature mocks and business scope](./0013-feature-mocks-and-business-scope.md)  
- [docs/TEST-DATA.md](../TEST-DATA.md)  
- [docs/automation/mock-data-privacy-workflow.md](../automation/mock-data-privacy-workflow.md)
