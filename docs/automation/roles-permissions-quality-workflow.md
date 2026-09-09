# Workflow de qualidade: papéis e permissões

## Checklist de implementação

### 1. Produto

- O papel do usuário está claro?
- Embarcador e transportador veem coisas diferentes?
- Admin e Governo estão documentados sem vazar dados privados?

### 2. Acesso

- A navegação usa a mesma matriz de acesso das páginas?
- Rotas restritas têm fallback humanizado ou redirect seguro?
- O acesso direto não revela conteúdo indevido?

### 3. Serviços e mocks

- A regra está centralizada em helpers puros?
- Os services reaproveitam a mesma política?
- O Mock Mode continua determinístico e coerente com o role?

### 4. Testes

- Helpers de acesso têm cobertura unitária?
- A navegação filtra itens corretamente?
- As rotas restritas exibem fallback adequado?

### 5. Quality gates

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm test`
- `npm run build`

## Observação

- Sempre que um novo perfil for adicionado, atualize esta matriz primeiro e a UI depois.
- Se a decisão envolver nova regra de negócio, registre ADR antes de espalhar a mudança.
