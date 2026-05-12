# Auditoria de papéis e permissões: estado atual

## Papéis encontrados

- `shipper` / Embarcador
- `carrier` / Transportador
- `admin` / Administrador
- Não existe um role `government` no modelo atual. A visão governamental aparece como persona/área, mas não como role de autenticação.

## Personas mockadas encontradas

- `u-shipper-1` - Tiala Rocha - shipper - aprovado
- `u-shipper-2` - Mariana Tapajós - shipper - aprovado
- `u-carrier-1` - João Navegante - carrier - aprovado
- `u-carrier-2` - Carlos Madeira - carrier - aprovado
- `u-carrier-3` - Ana Solimões - carrier - não aprovado
- `u-admin-1` - Operação HydroRivers - admin - aprovado

## Permissões implícitas atuais

- Embarcador cria carga, acompanha cargas próprias, negocia e rastreia as próprias operações.
- Transportador consulta oportunidades públicas, acompanha cargas atribuídas e opera frota/negociação.
- Admin vê navegação ampla, usa Mock Mode e mantém console administrativo.
- Governo é uma visão institucional restrita hoje ao papel de admin.

## Rotas públicas

- `/`
- `/login`
- `/cadastro`
- `/cargas`
- `/cargas/[id]` quando a carga é pública

## Rotas que exigem autenticação

- `/dashboard`
- `/minhas-cargas`
- `/minhas-cargas/[id]`
- `/cargas/nova`
- `/negociacoes`
- `/negociacoes/[id]`
- `/rastreio`
- `/embarcacoes`
- `/embarcacoes/[id]`
- `/impacto`
- `/impacto/[id]`
- `/perfil`
- `/admin`
- `/governo`

## Telas compartilhadas demais

- `Dashboard` e `Cargas` ainda compartilham uma linguagem visual parecida, mas já têm responsabilidades diferentes.
- `Mock Mode` concentra fluxo de QA, personas e cenários em uma única interface.
- `Impacto` e `Governo` usam dados semelhantes em partes da camada analítica.

## Riscos de UX

- Rotas privadas visíveis para perfil sem acesso.
- Transporte e embarque parecendo o mesmo fluxo quando a navegação não filtra por perfil.
- Admin/QA confundindo cenário de operação com cenário de cadastro.

## Riscos técnicos

- Regras de acesso repetidas em páginas, navegação e serviços.
- Mudanças de permissão quebrando SSR/hydration se cada tela derivar acesso de forma diferente.
- Controles de QA acessíveis para perfis errados.

## Recomendações

1. Centralizar permissões e acesso por rota em helpers puros.
2. Filtrar navegação com a mesma regra usada pelas páginas.
3. Restringir rotas governamentais e administrativas com fallback humanizado.
4. Manter Mock Mode como ferramenta de QA, não como atalho de produto.
5. Evoluir a matriz de permissões a partir de `shipper`, `carrier` e `admin`.
