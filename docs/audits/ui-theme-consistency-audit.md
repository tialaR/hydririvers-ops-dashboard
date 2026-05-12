# Auditoria de consistência visual das rotas

**Data:** 2026-05-10  
**Escopo:** Home/Início, Dashboard, Cargas, Minhas cargas, Rastreio, Negociações, Embarcações, Impacto, Governo, Auth/Register/OTP, Perfil, Mock Mode.

## Resumo

A tela de **Cargas** continua sendo a melhor referência visual do produto: dark operacional, cards escuros, bordas sutis, teal/aqua funcional e dourado apenas como destaque.

O principal desalinhamento observado no shell era de navegação, não de “estilo novo”:

- a Home existia, mas não tinha item claro no menu lateral;
- o cabeçalho da Home mostrava linguagem de Dashboard;
- o item ativo não reconhecia a rota raiz `/`.

## Estado atual

| Rota / componente | Papel | Estado visual | Ajuste recomendado | Prioridade | Risco |
| --- | --- | --- | --- | --- | --- |
| Home/Início | Porta narrativa | Parcialmente alinhada | Mostrar `Início` no menu e usar cabeçalho roteado | Alta | Baixo |
| Dashboard | Cockpit operacional | Alinhada, mas precisa manter distância de marketplace | Manter KPIs/alertas e não copiar lista de Cargas | Média | Baixo |
| Cargas | Marketplace público | Alinhada | Preservar como referência | Baixa | Baixo |
| Minhas cargas | Área privada | Alinhada | Garantir detalhe privado e estados seguros | Média | Baixo |
| Rastreio | Mapa/acompanhamento | Parcialmente alinhada | Reaproveitar cards/surfaces e reduzir peso visual | Média | Baixo |
| Negociações | Decisão comercial | Parcialmente alinhada | Manter cards/status no padrão operacional | Média | Baixo |
| Embarcações | Frota/ativos | Parcialmente alinhada | Evitar card de carga onde a entidade é diferente | Média | Baixo |
| Impacto | Indicadores | Parcialmente alinhada | Manter linguagem de KPI e hierarquia clara | Média | Baixo |
| Governo | Visão institucional | Parcialmente alinhada | Preservar superfície escura, copy clara e sem excesso comercial | Média | Baixo |
| Auth/Register/OTP | Onboarding | Parcialmente alinhada | Reforçar affordance de cadastro e estado de OTP | Média | Baixo |
| Perfil | Identidade/sessão | Alinhada após correções recentes | Manter nome compacto e card não esmagado | Baixa | Baixo |
| Mock Mode / QA Assistant | QA embutido | Parcialmente alinhada | Preservar visual operacional e evitar poluição de produção | Média | Baixo |

## Recomendações

- usar a tela de Cargas como base para surfaces, bordas, chips e CTA;
- manter Home como porta narrativa e Dashboard como cockpit operacional;
- não copiar o layout de listagem pública para rotas institucionais;
- preservar tokens globais e CSS Modules por responsabilidade;
- corrigir só o que gera confusão real de navegação ou leitura.

## Observações

- A consistência visual geral está boa na maioria das rotas principais.
- O maior ganho nesta rodada veio da navegação Home, do header roteado e da clareza do item ativo.
