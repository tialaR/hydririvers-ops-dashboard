/**
 * Catálogo do QA Assistant (painel Mock mode).
 * Metadados de cenários partial/duplicados: `docs/audits/mock-mode-current-state.md`.
 * Dívida Fase 6: strings do catálogo ainda em pt-BR hardcoded (sem next-intl).
 */
import { intlAppPaths } from '@/shared/routing/app-routes';
import type { MockScenarioId } from '@/shared/config/mock-scenario-ids';

export type MockQaScenarioPriority = 'high' | 'medium' | 'low';
export type MockQaScenarioStatus = 'ready' | 'partial' | 'planned';

export type MockQaScenario = {
  id: string;
  title: string;
  description: string;
  objective: string;
  riskCovered: string;
  persona: string;
  personaGroup?: 'shipper' | 'carrier' | 'admin' | 'government' | 'visitor' | 'qa' | 'operations';
  expectedCargoCount?: number;
  startRoute: string;
  datasetScenarioId: MockScenarioId;
  steps: readonly string[];
  expectedResult: string;
  areas: readonly string[];
  priority: MockQaScenarioPriority;
  status: MockQaScenarioStatus;
  tags: readonly string[];
  totalNotifications?: number;
  expectedUnreadCount?: number;
  notificationCount?: number;
  unreadNotificationCount?: number;
};

export const mockQaScenarios = [
  {
    id: 'auth-login-success',
    title: 'Login com sucesso',
    description: 'Simula um embarcador aprovado entrando no sistema e validando o fluxo principal de autenticação.',
    objective: 'Confirmar que o login cria sessão, libera as rotas privadas e mantém a navegação operacional.',
    riskCovered: 'Falha no login, sessão ausente ou redirecionamento incorreto após autenticação.',
    persona: 'Tiala Rocha, embarcadora aprovada',
    startRoute: intlAppPaths.auth.login,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir a rota de login.',
      'Preencher credenciais de demo e seguir até a etapa de OTP.',
      'Concluir a autenticação com sucesso.',
      'Validar o redirecionamento para a rota privada esperada.'
    ],
    expectedResult: 'O usuário entra com sessão válida e consegue acessar Dashboard, Cargas e demais rotas protegidas.',
    areas: ['auth', 'onboarding', 'session'],
    priority: 'high',
    status: 'ready',
    tags: ['login', 'session', 'otp', 'happy-path']
  },
  {
    id: 'auth-login-error',
    title: 'Login com erro',
    description: 'Cobre credenciais inválidas, erro de autenticação e feedback consistente para a pessoa usuária.',
    objective: 'Garantir que erro de login não autentica ninguém e mantém o estado da tela previsível.',
    riskCovered: 'Senha inválida, OTP errado ou payload incompleto gerando sucesso indevido.',
    persona: 'Usuário não aprovado',
    startRoute: intlAppPaths.auth.login,
    datasetScenarioId: 'error-scenarios',
    steps: [
      'Abrir a rota de login.',
      'Informar dados inválidos ou OTP incorreto.',
      'Tentar autenticar.',
      'Confirmar que a sessão não é criada e o erro fica visível.'
    ],
    expectedResult: 'A autenticação falha com mensagem clara e sem redirecionar para rotas privadas.',
    areas: ['auth', 'validation', 'session'],
    priority: 'high',
    status: 'ready',
    tags: ['login', 'error', 'otp', 'block']
  },
  {
    id: 'auth-register-and-otp',
    title: 'Cadastro com OTP válido',
    description: 'Valida o fluxo de criação de conta e a passagem pela etapa de confirmação por código.',
    objective: 'Assegurar que o cadastro cria usuário demo, respeita validação e conclui o onboarding com sucesso.',
    riskCovered: 'Cadastro incompleto, OTP inválido ou transição errada entre etapas de registro.',
    persona: 'Novo embarcador',
    startRoute: intlAppPaths.auth.register,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir a rota de cadastro.',
      'Preencher os campos obrigatórios com dados válidos.',
      'Confirmar a etapa de OTP.',
      'Validar a criação da conta e a navegação esperada.'
    ],
    expectedResult: 'A conta é criada ou o desafio de OTP é concluído sem quebrar layout nem sessão.',
    areas: ['auth', 'onboarding', 'forms'],
    priority: 'high',
    status: 'ready',
    tags: ['register', 'otp', 'validation', 'onboarding']
  },
  {
    id: 'auth-session-expired',
    title: 'Sessão expirada ou ausente',
    description: 'Testa o comportamento quando a pessoa tenta entrar em uma rota protegida sem sessão válida.',
    objective: 'Confirmar proteção de rotas e redirecionamento para login quando a sessão expira.',
    riskCovered: 'Acesso indevido a áreas privadas com cookie ausente, expirado ou inválido.',
    persona: 'Visitante sem sessão',
    startRoute: intlAppPaths.dashboard.home,
    datasetScenarioId: 'error-scenarios',
    steps: [
      'Acessar uma rota protegida sem sessão ativa.',
      'Confirmar o redirecionamento para login.',
      'Validar que a pessoa consegue retomar o fluxo após autenticação.'
    ],
    expectedResult: 'O sistema bloqueia o acesso e orienta o usuário para o login sem loop de navegação.',
    areas: ['auth', 'routing', 'guards'],
    priority: 'high',
    status: 'ready',
    tags: ['session', 'protected-route', 'redirect']
  },
  {
    id: 'dashboard-active-and-alert',
    title: 'Dashboard com operação ativa',
    description: 'Valida a visão operacional principal com cargas em andamento, alertas e cards longos.',
    objective: 'Checar se o dashboard comunica operação em curso sem quebrar layout nem hierarquia.',
    riskCovered: 'Cards sobrepostos, textos longos quebrando a grade e alertas pouco legíveis.',
    persona: 'Operação interna',
    startRoute: intlAppPaths.dashboard.home,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir o dashboard.',
      'Conferir os cards principais e o resumo operacional.',
      'Validar alertas e estados com conteúdo longo.',
      'Atualizar o cenário e confirmar que os indicadores mudam de forma coerente.'
    ],
    expectedResult: 'O dashboard continua legível, responsivo e coerente com a operação ativa.',
    areas: ['dashboard', 'overview', 'alerts'],
    priority: 'high',
    status: 'ready',
    tags: ['dashboard', 'operational', 'cards', 'status']
  },
  {
    id: 'dashboard-empty',
    title: 'Dashboard vazio',
    description: 'Cobertura para o estado sem cargas e sem atividade operacional visível.',
    objective: 'Garantir empty state claro, sem ruído visual e sem confundir dados mockados com dados reais.',
    riskCovered: 'Tela vazia sem contexto, componentes desalinhados e leituras erradas de métricas.',
    persona: 'Operação interna',
    startRoute: intlAppPaths.dashboard.home,
    datasetScenarioId: 'empty-state',
    steps: [
      'Abrir o dashboard com dataset vazio.',
      'Validar empty states e call to actions.',
      'Conferir responsividade e contraste do conteúdo de apoio.'
    ],
    expectedResult: 'A pessoa entende que não há operação ativa no momento e sabe onde seguir.',
    areas: ['dashboard', 'empty-state', 'copy'],
    priority: 'low',
    status: 'ready',
    tags: ['empty-state', 'dashboard', 'fallback']
  },
  {
    id: 'cargos-market-and-filters',
    title: 'Cargas com resultados e filtros',
    description: 'Simula a lista pública com resultados, filtros por corredor, origem, destino e documento pendente.',
    objective: 'Validar que a listagem pública responde a filtros e mantém legibilidade em desktop e mobile.',
    riskCovered: 'Filtro pesado, layout quebrado e resultado vazio sem explicação.',
    persona: 'Embarcador explorando o mercado',
    startRoute: intlAppPaths.cargos.marketplace,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir a lista pública de cargas.',
      'Aplicar filtros por corredor, origem e destino.',
      'Selecionar um estado documental pendente.',
      'Validar resultado e chips de filtros ativos.'
    ],
    expectedResult: 'A lista pública continua útil para descoberta e comparação de oportunidades.',
    areas: ['cargos', 'filters', 'marketplace'],
    priority: 'high',
    status: 'partial',
    tags: ['cargo', 'filters', 'marketplace', 'document']
  },
  {
    id: 'cargos-empty-state',
    title: 'Cargas sem resultado',
    description: 'Cobertura do empty state quando filtros ou dataset deixam a lista sem itens.',
    objective: 'Garantir feedback útil quando não houver resultados na listagem pública.',
    riskCovered: 'Tela vazia sem orientação, com impressão de erro ou quebra de layout.',
    persona: 'Embarcador explorando o mercado',
    startRoute: intlAppPaths.cargos.marketplace,
    datasetScenarioId: 'empty-state',
    steps: [
      'Abrir a lista pública com dataset vazio.',
      'Validar empty state e mensagens de apoio.',
      'Confirmar que a ação de limpar filtros restaura a busca.'
    ],
    expectedResult: 'O usuário entende por que não há resultados e como recuperar a lista.',
    areas: ['cargos', 'empty-state', 'filters'],
    priority: 'medium',
    status: 'ready',
    tags: ['cargo', 'empty-state', 'filters']
  },
  {
    id: 'my-cargos-with-items',
    title: 'Minhas cargas com itens',
    description: 'Mostra apenas as cargas vinculadas à pessoa logada e mantém a separação em relação ao marketplace.',
    objective: 'Confirmar que a área privada respeita o vínculo do usuário e não mistura dados públicos.',
    riskCovered: 'Mistura entre cargas públicas e privadas, ou ausência de vínculo do owner.',
    persona: 'Embarcador aprovado',
    personaGroup: 'shipper',
    startRoute: intlAppPaths.cargos.myCargos,
    datasetScenarioId: 'market-active',
    expectedCargoCount: 6,
    steps: [
      'Abrir Minhas cargas.',
      'Validar que só itens do usuário aparecem.',
      'Comparar com a listagem pública para garantir separação.',
      'Abrir um detalhe e verificar o vínculo.'
    ],
    expectedResult: 'A pessoa vê apenas suas próprias cargas e entende o que está sob sua responsabilidade.',
    areas: ['my-cargos', 'ownership', 'routing'],
    priority: 'high',
    status: 'ready',
    tags: ['my-cargos', 'owner', 'private', 'separation']
  },
  {
    id: 'my-cargos-empty',
    title: 'Minhas cargas vazias',
    description: 'Cobertura para usuário sem cargas próprias, com orientação clara e CTA útil.',
    objective: 'Garantir empty state honesto e útil quando o usuário ainda não publicou nada.',
    riskCovered: 'Sem dados, sem contexto e sem próximo passo visível.',
    persona: 'Embarcador novo',
    personaGroup: 'shipper',
    startRoute: intlAppPaths.cargos.myCargos,
    datasetScenarioId: 'empty-state',
    expectedCargoCount: 0,
    steps: [
      'Abrir Minhas cargas como um usuário sem itens próprios.',
      'Conferir texto de empty state.',
      'Validar CTA para publicar nova carga ou seguir ao marketplace.'
    ],
    expectedResult: 'O usuário entende que ainda não tem cargas próprias e sabe como começar.',
    areas: ['my-cargos', 'empty-state', 'onboarding'],
    priority: 'medium',
    status: 'ready',
    tags: ['my-cargos', 'empty-state', 'cta']
  },
  {
    id: 'my-cargos-carrier-with-items',
    title: 'Minhas cargas (transportador) com itens',
    description: 'Mostra apenas as cargas atribuídas ao transportador e evita confusão com o marketplace público.',
    objective: 'Validar que o transportador vê apenas operações vinculadas ao seu usuário (carrierId).',
    riskCovered: 'Mistura de cargas públicas e privadas, ou cargas atribuídas aparecendo para o perfil errado.',
    persona: 'Transportador aprovado',
    personaGroup: 'carrier',
    startRoute: intlAppPaths.cargos.myCargos,
    datasetScenarioId: 'market-active',
    expectedCargoCount: 4,
    steps: [
      'Entrar como transportador (persona carrier).',
      'Abrir Minhas cargas.',
      'Validar que apenas itens atribuídos aparecem.',
      'Abrir um detalhe e confirmar o vínculo.'
    ],
    expectedResult: 'O transportador vê apenas as cargas atribuídas/operadas pelo seu usuário.',
    areas: ['my-cargos', 'ownership', 'routing'],
    priority: 'high',
    status: 'ready',
    tags: ['my-cargos', 'carrier', 'private', 'separation']
  },
  {
    id: 'my-cargos-carrier-empty',
    title: 'Minhas cargas (transportador) vazias',
    description: 'Empty state do transportador sem cargas atribuídas, com CTA coerente para oportunidades públicas.',
    objective: 'Garantir que o transportador não recebe CTA de “publicar carga” quando estiver sem operações.',
    riskCovered: 'CTA incoerente por perfil e confusão de onboarding operacional.',
    persona: 'Transportador sem operações',
    personaGroup: 'carrier',
    startRoute: intlAppPaths.cargos.myCargos,
    datasetScenarioId: 'empty-state',
    expectedCargoCount: 0,
    steps: [
      'Entrar como transportador (persona carrier).',
      'Abrir Minhas cargas com dataset vazio.',
      'Validar empty state e CTA para o marketplace público.'
    ],
    expectedResult: 'O transportador entende que ainda não há operações atribuídas e consegue voltar ao marketplace.',
    areas: ['my-cargos', 'empty-state', 'onboarding'],
    priority: 'medium',
    status: 'ready',
    tags: ['my-cargos', 'carrier', 'empty-state', 'cta']
  },
  {
    id: 'new-cargo-form-validation',
    title: 'Nova carga com validação',
    description: 'Cobre campos obrigatórios, feedback de erro, estado loading e publicação simulada.',
    objective: 'Assegurar que o formulário não publica dados inválidos e responde bem em mobile.',
    riskCovered: 'Validação ausente, submit incorreto e mensagens técnicas para a pessoa usuária.',
    persona: 'Embarcador aprovando uma nova viagem',
    startRoute: intlAppPaths.cargos.publishCargo,
    datasetScenarioId: 'error-scenarios',
    steps: [
      'Abrir o formulário de nova carga.',
      'Tentar enviar com campos obrigatórios vazios.',
      'Corrigir os dados e reenviar.',
      'Validar o estado de sucesso e a publicação simulada.'
    ],
    expectedResult: 'A validação impede envio inválido e a publicação simulada conclui com feedback claro.',
    areas: ['cargas', 'forms', 'validation'],
    priority: 'high',
    status: 'ready',
    tags: ['new-cargo', 'form', 'validation', 'loading']
  },
  {
    id: 'tracking-map-active-and-overlay',
    title: 'Rastreio com mapa e overlays',
    description: 'Valida mapa com operação ativa, expansão fullscreen e comportamento dos overlays sobre a rota.',
    objective: 'Garantir que o mapa não seja coberto por bottom sheets, menus ou notificações.',
    riskCovered: 'Z-index errado, mapa cortado e informações importantes escondidas por overlays.',
    persona: 'Operação de rastreio',
    startRoute: intlAppPaths.tracking.home,
    datasetScenarioId: 'in-transit',
    steps: [
      'Abrir a rota de rastreio.',
      'Expandir o mapa.',
      'Abrir um overlay ou BottomSheet.',
      'Validar que o mapa continua acessível e legível.'
    ],
    expectedResult: 'A rota é navegável, o mapa segue interativo e os overlays ficam acima sem cortar conteúdo.',
    areas: ['tracking', 'map', 'overlays'],
    priority: 'high',
    status: 'ready',
    tags: ['tracking', 'map', 'fullscreen', 'bottom-sheet']
  },
  {
    id: 'tracking-map-alert',
    title: 'Rastreio com alerta operacional',
    description: 'Simula evento de risco no trajeto, útil para validar severidade e mensagem contextual.',
    objective: 'Checar como o sistema responde a alertas de rota e eventos críticos.',
    riskCovered: 'Alertas pouco visíveis, perda de contexto operacional e textos excessivos.',
    persona: 'Operação de rastreio',
    startRoute: intlAppPaths.tracking.home,
    datasetScenarioId: 'error-scenarios',
    steps: [
      'Abrir a rota de rastreio com cenário de erro.',
      'Conferir o alerta operacional.',
      'Validar se a mensagem explica o impacto sem dramatizar.',
      'Checar se os controles móveis continuam acessíveis.'
    ],
    expectedResult: 'O alerta é visível, objetivo e mantém a interação do mapa e da timeline.',
    areas: ['tracking', 'map', 'alerts'],
    priority: 'high',
    status: 'ready',
    tags: ['tracking', 'alert', 'map', 'risk']
  },
  {
    id: 'notifications-unread-and-mark-all',
    title: 'Notificações com leitura em lote',
    description: 'Simula contagem de não lidas, clique individual e ação de marcar todas como lidas.',
    objective: 'Garantir badge real, persistência por usuário e feedback imediato no desktop e no mobile.',
    riskCovered: 'Badge fake, estado inconsistente e ação de leitura sem efeito real.',
    persona: 'Admin ou operação interna',
    personaGroup: 'admin',
    startRoute: intlAppPaths.dashboard.home,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir o sino de notificações.',
      'Conferir a quantidade de não lidas.',
      'Marcar uma notificação e depois marcar todas como lidas.',
      'Validar que o badge cai para zero.'
    ],
    expectedResult: 'O badge reflete o estado real, a lista responde ao clique e o contador zera sem reload.',
    areas: ['notifications', 'badge', 'popover'],
    priority: 'high',
    status: 'ready',
    tags: ['notifications', 'badge', 'read-state', 'mobile'],
    totalNotifications: 5,
    expectedUnreadCount: 5,
    notificationCount: 5,
    unreadNotificationCount: 5
  },
  {
    id: 'notifications-zero-unread',
    title: 'Notificações zeradas',
    description: 'Verifica o estado com badge ausente ou zero depois da ação de leitura em lote.',
    objective: 'Garantir que o estado zerado seja estável e não deixe resíduos visuais no badge.',
    riskCovered: 'Badge fixo, contador desatualizado ou lista lida sem atualização visual imediata.',
    persona: 'Admin ou operação interna',
    personaGroup: 'admin',
    startRoute: intlAppPaths.dashboard.home,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir o sino de notificações.',
      'Marcar todas como lidas.',
      'Confirmar que o badge zera ou desaparece.',
      'Reabrir o painel e validar o estado persistido.'
    ],
    expectedResult: 'O badge desaparece ou mostra zero e a lista permanece marcada como lida após o reload.',
    areas: ['notifications', 'badge', 'persistence'],
    priority: 'medium',
    status: 'ready',
    tags: ['notifications', 'zero', 'persisted-state'],
    totalNotifications: 5,
    expectedUnreadCount: 0,
    notificationCount: 5,
    unreadNotificationCount: 0
  },
  {
    id: 'notifications-one-unread',
    title: 'Uma notificação não lida',
    description: 'Cobre o estado em que resta apenas um item não lido para validar badge discreto e lista parcial.',
    objective: 'Confirmar que um único item pendente continua visível sem confundir o usuário.',
    riskCovered: 'Badge incorreto para 1 item, leitura parcial que não atualiza o contador e estados pouco claros.',
    persona: 'QA mobile',
    personaGroup: 'qa',
    startRoute: intlAppPaths.dashboard.home,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir as notificações.',
      'Marcar quatro itens como lidos, deixando apenas um pendente.',
      'Validar que o badge mostra 1.',
      'Conferir o item restante como não lido.'
    ],
    expectedResult: 'O badge mostra 1 e o estado da lista continua coerente com um único item pendente.',
    areas: ['notifications', 'badge', 'persistence'],
    priority: 'low',
    status: 'partial',
    tags: ['notifications', 'single-unread', 'badge'],
    totalNotifications: 5,
    expectedUnreadCount: 1,
    notificationCount: 5,
    unreadNotificationCount: 1
  },
  {
    id: 'notifications-four-unread',
    title: 'Quatro notificações não lidas',
    description: 'Valida o número intermediário exibido no sino e no texto do popover com o mesmo valor.',
    objective: 'Garantir que badge e texto compartilham exatamente a mesma contagem de não lidas.',
    riskCovered: 'Badge desatualizado, contagem divergente e leitura parcial fora de sincronia.',
    persona: 'QA mobile',
    personaGroup: 'qa',
    startRoute: intlAppPaths.dashboard.home,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir notificações.',
      'Deixar quatro itens como não lidos.',
      'Confirmar que o badge mostra 4.',
      'Conferir que o texto do popover também mostra 4.'
    ],
    expectedResult: 'Badge e texto exibem 4, sem divergência entre lista e contador.',
    areas: ['notifications', 'badge', 'persistence'],
    priority: 'medium',
    status: 'ready',
    tags: ['notifications', 'unread-count', 'badge'],
    totalNotifications: 5,
    expectedUnreadCount: 4,
    notificationCount: 5,
    unreadNotificationCount: 4
  },
  {
    id: 'negotiations-flow',
    title: 'Negociações abertas e concluídas',
    description: 'Cobre contraproposta, aceite, encerramento e tela vazia quando não há negociações.',
    objective: 'Validar que os estados de negociação comunicam andamento comercial com clareza.',
    riskCovered: 'Estados confusos, histórico incompleto e cards que não refletem a situação real.',
    persona: 'Embarcador ou transportador',
    startRoute: intlAppPaths.negotiations.home,
    datasetScenarioId: 'negotiation-flow',
    steps: [
      'Abrir a lista de negociações.',
      'Validar um caso aberto, um com contraproposta e um concluído.',
      'Conferir a coerência entre status e texto.',
      'Testar o estado vazio se não houver itens.'
    ],
    expectedResult: 'A pessoa entende rapidamente o estado comercial de cada negociação e o próximo passo.',
    areas: ['negotiations', 'status', 'cards'],
    priority: 'high',
    status: 'ready',
    tags: ['negotiation', 'counteroffer', 'contract', 'empty-state']
  },
  {
    id: 'vessels-and-maintenance',
    title: 'Embarcações disponíveis e manutenção',
    description: 'Valida frota disponível, embarcação em operação, estados vazios e alerta de manutenção.',
    objective: 'Checar a leitura da frota como recurso operacional e não só como catálogo visual.',
    riskCovered: 'Card de frota com informação pouco clara ou mistura de disponibilidade com manutenção.',
    persona: 'Operação de frota',
    startRoute: intlAppPaths.vessels.marketplace,
    datasetScenarioId: 'error-scenarios',
    steps: [
      'Abrir a área de embarcações.',
      'Validar embarcação disponível e embarcação em operação.',
      'Conferir o alerta de manutenção ou indisponibilidade.',
      'Checar o empty state quando não houver registros.'
    ],
    expectedResult: 'A leitura da frota permanece clara, com disponibilidade e manutenção bem separadas.',
    areas: ['vessels', 'fleet', 'alerts'],
    priority: 'medium',
    status: 'ready',
    tags: ['vessels', 'maintenance', 'availability', 'fleet']
  },
  {
    id: 'impact-and-government',
    title: 'Impacto e governo',
    description: 'Valida as visões institucionais e os indicadores de impacto com estados vazios e longos.',
    objective: 'Confirmar que as áreas de impacto e governo ajudam na leitura pública e operacional.',
    riskCovered: 'Indicadores sem contexto, cards longos quebrando layout e visão institucional confusa.',
    persona: 'Stakeholder público',
    startRoute: intlAppPaths.impact.home,
    datasetScenarioId: 'completed',
    steps: [
      'Abrir Impacto.',
      'Conferir cards e indicadores.',
      'Abrir Governo e validar a visão institucional.',
      'Checar o tratamento de textos longos e empty states.'
    ],
    expectedResult: 'As visões institucionais seguem legíveis e úteis para stakeholder e auditoria.',
    areas: ['impact', 'government', 'reporting'],
    priority: 'medium',
    status: 'ready',
    tags: ['impact', 'government', 'indicators', 'public-view']
  },
  {
    id: 'impact-overview-layperson',
    title: 'Impacto: visão geral para usuário leigo',
    description: 'Confere o texto introdutório, chips de tipo e avisos de estimativa/mock na grade de Impacto.',
    objective: 'Garantir que a página explica propósito, limites e linguagem acessível sem prometer medição real.',
    riskCovered: 'Leitura técnica demais ou números tratados como medição de campo.',
    persona: 'Visitante ou embarcador sem familiaridade com hidrovias',
    startRoute: intlAppPaths.impact.home,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir Impacto em pt-BR.',
      'Ler o bloco “Como ler estes indicadores” e a nota de rodapé.',
      'Conferir chips de categoria (valor econômico, ambiental, operacional, institucional) e rótulos de confiança.',
      'Repetir em en-US e es para checar i18n.'
    ],
    expectedResult: 'A pessoa entende que os indicadores são demonstrativos e onde há fonte pública versus mock.',
    areas: ['impact', 'i18n', 'copy'],
    priority: 'medium',
    status: 'ready',
    tags: ['impact', 'onboarding', 'trust', 'labels']
  },
  {
    id: 'impact-environmental-estimate',
    title: 'Impacto: indicador ambiental com estimativa',
    description: 'Valida o card de sustentabilidade com sublinha de cenário e o detalhe com limites da estimativa.',
    objective: 'Assegurar que emissão potencial não é comunicada como percentual universal nem medição oficial.',
    riskCovered: 'Claim ambiental absoluto sem limites ou fonte.',
    persona: 'QA de produto',
    startRoute: intlAppPaths.impact.home,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir Impacto e localizar o card ambiental.',
      'Ler a métrica, a sublinha de cenário e o chip de confiança.',
      'Abrir o detalhe do indicador e rolar até “Limites da estimativa” e “Evidências e contexto público”.'
    ],
    expectedResult: 'Textos deixam claro cenário demonstrativo, variáveis da rota e presença de fonte pública onde cadastrada.',
    areas: ['impact', 'sustainability', 'compliance-copy'],
    priority: 'high',
    status: 'ready',
    tags: ['impact', 'environment', 'estimate', 'evidence']
  },
  {
    id: 'impact-detail-estimate-limits',
    title: 'Impacto: detalhe com limites da estimativa',
    description: 'Cobre o detalhe de um indicador econômico ou operacional com seção obrigatória de limites.',
    objective: 'Confirmar que números fortes ou narrativas de ganho aparecem com limites e sem promessa absoluta.',
    riskCovered: 'Detalhe sem limites ou sem conexão com fluxos do produto.',
    persona: 'Operação comercial',
    startRoute: intlAppPaths.impact.impactDetail('cost'),
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir o detalhe do indicador de custo (rota /impacto/cost no app router).',
      'Ler “O que isso significa” e “Como isso entrega valor”.',
      'Validar “Limites da estimativa” e “O que observar na operação”.',
      'Conferir evidência em modo stub com aviso de validação.'
    ],
    expectedResult: 'O detalhe lista limites, observações operacionais e evidência marcada como mock ou a validar.',
    areas: ['impact', 'detail', 'risk'],
    priority: 'medium',
    status: 'ready',
    tags: ['impact', 'detail', 'limits', 'stub-evidence']
  },
  {
    id: 'impact-public-context-to-validate',
    title: 'Impacto: contexto público a validar',
    description: 'Garante que placeholders “a validar com fonte pública” aparecem quando não há série vinculada.',
    objective: 'Evitar falsa sensação de pesquisa ou benchmark oficial sem fonte cadastrada.',
    riskCovered: 'Stub de evidência lido como estudo validado.',
    persona: 'Auditoria ou parceiro institucional',
    startRoute: intlAppPaths.impact.impactDetail('compliance'),
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir detalhe de conformidade documental.',
      'Na seção de evidências, localizar texto de “a validar” ou badge de cenário mock.',
      'Confirmar que não há link externo apresentado como validação oficial do produto.'
    ],
    expectedResult: 'A UI deixa explícito que a evidência é placeholder até fonte pública ou integração existir.',
    areas: ['impact', 'evidence', 'trust'],
    priority: 'medium',
    status: 'ready',
    tags: ['impact', 'evidence', 'stub', 'public-source']
  },
  {
    id: 'profile-operational-identity-review',
    title: 'Perfil: revisar identidade operacional',
    description: 'Valida o texto de topo, cartão de identidade, status e nota de ambiente demo.',
    objective: 'Garantir que a página explica papel, empresa e acesso sem parecer só formulário burocrático.',
    riskCovered: 'Perfil ilegível ou status confundido com validação oficial em produção.',
    persona: 'Embarcadora ou transportadora',
    startRoute: intlAppPaths.auth.profile,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir Perfil autenticado.',
      'Ler o título, subtítulo e nota sobre ambiente de demonstração.',
      'Conferir cartão com nome legível, empresa e badge de acesso.',
      'Validar bloco “Por que manter isso atualizado?” e dicas nos campos.'
    ],
    expectedResult: 'A pessoa entende identidade operacional, o que está aprovado e por que os dados importam.',
    areas: ['profile', 'identity', 'copy'],
    priority: 'medium',
    status: 'ready',
    tags: ['profile', 'onboarding', 'trust']
  },
  {
    id: 'profile-edit-basic-fields',
    title: 'Perfil: editar dados básicos',
    description: 'Cobre edição de nome completo, empresa, telefone e cidade com salvamento e feedback.',
    objective: 'Confirmar que o formulário continua persistindo e que labels de apoio não confundem.',
    riskCovered: 'Salvar perfil quebrado ou campos sem contexto.',
    persona: 'Operação comercial',
    startRoute: intlAppPaths.auth.profile,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir Perfil.',
      'Alterar um campo opcional (telefone ou cidade) e salvar.',
      'Confirmar mensagem de sucesso ou estado “Salvo”.',
      'Recarregar e verificar persistência no mock.'
    ],
    expectedResult: 'Atualização conclui sem erro e o usuário reconhece o que foi salvo.',
    areas: ['profile', 'forms', 'session'],
    priority: 'high',
    status: 'ready',
    tags: ['profile', 'save', 'validation']
  },
  {
    id: 'profile-long-name-header',
    title: 'Perfil: nome longo não quebra header',
    description: 'Garante nome compacto e reticências no chrome e avatar com iniciais corretas.',
    objective: 'Evitar overflow do nome no header desktop/mobile após login com nome extenso em caixa alta.',
    riskCovered: 'Layout quebrado no topbar ou avatar com iniciais erradas.',
    persona: 'QA de layout',
    startRoute: intlAppPaths.dashboard.home,
    datasetScenarioId: 'market-active',
    steps: [
      'Entrar com usuário mock cujo nome completo seja longo e em maiúsculas.',
      'Observar o nome exibido no header (sidebar/topbar) e no link de perfil.',
      'Abrir Perfil e conferir nome legível no cartão sem estourar a largura.'
    ],
    expectedResult: 'O nome aparece compacto, com reticências quando necessário, e iniciais batem com primeiro e último nome.',
    areas: ['profile', 'layout', 'chrome'],
    priority: 'medium',
    status: 'ready',
    tags: ['profile', 'header', 'ellipsis', 'initials']
  },
  {
    id: 'profile-access-status-explained',
    title: 'Perfil: status de acesso explicado',
    description: 'Checa textos de status de acesso, valores aprovado/pendente e rodapé de demo.',
    objective: 'Assegurar que “aprovado” não soa como certificação externa sem o aviso de demonstração.',
    riskCovered: 'Promessa indevida de validação regulatória ou comercial.',
    persona: 'Auditoria interna',
    startRoute: intlAppPaths.auth.profile,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir Perfil com usuário aprovado e ler “Status de acesso” e badge.',
      'Repetir ou simular usuário pendente e comparar textos.',
      'Confirmar presença da nota de ambiente de demonstração.'
    ],
    expectedResult: 'Status e descrições deixam claro o que é acesso à plataforma versus validação real.',
    areas: ['profile', 'trust', 'copy'],
    priority: 'medium',
    status: 'ready',
    tags: ['profile', 'access', 'demo-disclaimer']
  },
  {
    id: 'mobile-overlays-and-bottom-sheets',
    title: 'Mobile com bottom sheets e overlays',
    description: 'Cobre menu mobile, filtros, notificações, bottom nav, safe area e mapa fullscreen em landscape.',
    objective: 'Garantir que a experiência mobile pareça app nativo e não desktop espremido.',
    riskCovered: 'Overlay atrás do mapa, bottom nav cobrindo conteúdo e scroll vazando por trás.',
    persona: 'QA mobile',
    startRoute: intlAppPaths.cargos.marketplace,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir a aplicação em mobile estreito.',
      'Testar filtros e notificações dentro de bottom sheets.',
      'Expandir o mapa e girar o dispositivo para landscape.',
      'Validar safe area, scroll lock e z-index dos overlays.'
    ],
    expectedResult: 'A navegação mobile mantém foco, camadas corretas e conteúdo legível em qualquer orientação.',
    areas: ['mobile', 'bottom-sheet', 'navigation', 'map'],
    priority: 'high',
    status: 'ready',
    tags: ['mobile', 'bottom-sheet', 'safe-area', 'landscape']
  },
  {
    id: 'theme-and-i18n',
    title: 'Tema e internacionalização',
    description: 'Cobre troca de tema, mudança de idioma e textos longos em pt-BR, en-US e es.',
    objective: 'Garantir contraste, persistência e traduções consistentes nas rotas principais.',
    riskCovered: 'Tema ilegível, texto hardcoded ou idioma quebrando labels e badges.',
    persona: 'QA de interface',
    startRoute: intlAppPaths.dashboard.home,
    datasetScenarioId: 'market-active',
    steps: [
      'Alternar entre tema escuro e claro.',
      'Trocar entre pt-BR, en-US e es.',
      'Validar labels, badges e textos longos.',
      'Confirmar que a persistência do usuário continua estável.'
    ],
    expectedResult: 'Tema e idioma seguem legíveis, persistentes e coerentes com o design system.',
    areas: ['theme', 'i18n', 'accessibility'],
    priority: 'medium',
    status: 'ready',
    tags: ['theme', 'i18n', 'contrast', 'translations']
  },
  {
    id: 'negotiations-counteroffer-review',
    title: 'Negociações: revisar contraproposta',
    description: 'Valida cartões com alerta de resposta, resumo de contrapropostas e próximo passo legível.',
    objective: 'Garantir que contrapropostas apareçam como prioridade visual sem perder contexto de rota e valor.',
    riskCovered: 'Usuário não percebe que precisa responder ou confunde estágio comercial.',
    persona: 'Embarcadora revisando propostas',
    startRoute: intlAppPaths.negotiations.home,
    datasetScenarioId: 'completed',
    steps: [
      'Abrir /negociacoes com dataset que mantenha contrapropostas na lista.',
      'Conferir o bloco “Entenda onde agir primeiro” e o contador de pendências.',
      'Localizar cartão em contraproposta com selo “Precisa de resposta”.',
      'Abrir o detalhe e validar histórico e próximos passos.'
    ],
    expectedResult: 'A lista destaca contrapropostas, mostra próximo passo claro e o resumo reflete pendências.',
    areas: ['negotiations', 'commercial', 'copy'],
    priority: 'high',
    status: 'ready',
    tags: ['negotiations', 'counteroffer', 'action-required']
  },
  {
    id: 'negotiations-quote-waiting',
    title: 'Negociações: cotação aguardando análise',
    description: 'Cobre cotações abertas com linguagem acessível e sem ruído de pipeline técnico.',
    objective: 'Confirmar que estágio “Cotação” explica espera de análise de preço e mantém hierarquia de valor.',
    riskCovered: 'Status técnico sem explicação e valores ilegíveis em mobile.',
    persona: 'Transportador acompanhando oportunidades',
    startRoute: intlAppPaths.negotiations.home,
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir /negociacoes com dataset de cotações em aberto.',
      'Ler o subtítulo e o resumo de “Cotações abertas”.',
      'Validar microcopy do estágio e o valor estimado no cartão.',
      'Checar layout em coluna única no mobile.'
    ],
    expectedResult: 'Cotações comunicam espera de análise de preço e valores permanecem legíveis.',
    areas: ['negotiations', 'mobile', 'copy'],
    priority: 'medium',
    status: 'ready',
    tags: ['negotiations', 'quote', 'pricing']
  },
  {
    id: 'negotiations-contract-advanced',
    title: 'Negociações: contrato avançado',
    description: 'Garante leitura clara de acordos em contrato com contrapartes e rota visíveis.',
    objective: 'Validar estágio “Contrato” com explicação de acordo avançado e resumo de contratos em andamento.',
    riskCovered: 'Confusão entre contrato e embarque ou perda de contexto comercial.',
    persona: 'Operação comercial',
    startRoute: intlAppPaths.negotiations.home,
    datasetScenarioId: 'negotiation-flow',
    steps: [
      'Abrir /negociacoes com dataset de fluxo de negociação.',
      'Identificar cartões em contrato e o contador de contratos em andamento.',
      'Conferir contrapartes e rota no cartão.',
      'Abrir detalhe para validar documentos e próximo passo.'
    ],
    expectedResult: 'Contratos em andamento aparecem no resumo e os cartões explicam o avanço do acordo.',
    areas: ['negotiations', 'contract', 'commercial'],
    priority: 'medium',
    status: 'ready',
    tags: ['negotiations', 'contract', 'deal-stage']
  },
  {
    id: 'negotiations-empty-list',
    title: 'Negociações: lista vazia',
    description: 'Confirma estado vazio amigável quando não há negociações no dataset.',
    objective: 'Evitar impressão de erro quando a lista está vazia e orientar o usuário leigo.',
    riskCovered: 'Grade vazia sem contexto ou layout quebrado com bottom navigation.',
    persona: 'Nova conta sem operações',
    startRoute: intlAppPaths.negotiations.home,
    datasetScenarioId: 'empty-state',
    steps: [
      'Aplicar dataset vazio com negociações zeradas.',
      'Abrir /negociacoes e ler o cartão de orientação com contadores zerados.',
      'Validar mensagem de lista vazia e ausência de cards.',
      'Confirmar espaço inferior para a bottom nav no mobile.'
    ],
    expectedResult: 'A página explica a ausência de negociações e mantém hierarquia visual sem cards fantasmas.',
    areas: ['negotiations', 'empty-state', 'mobile'],
    priority: 'low',
    status: 'ready',
    tags: ['negotiations', 'empty-state', 'onboarding']
  },
  {
    id: 'negotiation-detail-quote-received',
    title: 'Detalhe de negociação: cotação recebida',
    description: 'Valida guia de decisão, valor negociado e timeline em estágio de cotação.',
    objective: 'Garantir que o detalhe explique o que fazer agora sem depender de ações falsas.',
    riskCovered: 'Detalhe técnico sem contexto comercial ou próximo passo ilegível.',
    persona: 'Embarcadora acompanhando proposta',
    startRoute: intlAppPaths.negotiations.negotiationDetail('neg-001'),
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir o detalhe de uma negociação em cotação.',
      'Ler o bloco “O que precisa acontecer agora” e o próximo passo sugerido.',
      'Conferir termos humanizados e documentos com status.',
      'Revisar a linha do tempo e o link para a carga relacionada.'
    ],
    expectedResult: 'A tela orienta a revisão de documentos e termos com hierarquia clara e sem botões falsos.',
    areas: ['negotiations', 'detail', 'copy'],
    priority: 'high',
    status: 'ready',
    tags: ['negotiations', 'detail', 'quote']
  },
  {
    id: 'negotiation-detail-counteroffer-review',
    title: 'Detalhe de negociação: contraproposta para revisar',
    description: 'Cobre estágio de contraproposta e linguagem de urgência responsável.',
    objective: 'Confirmar que contrapropostas comunicam necessidade de resposta sem alarmismo.',
    riskCovered: 'Usuário ignora contraproposta ou confunde com contrato fechado.',
    persona: 'Operação comercial',
    startRoute: intlAppPaths.negotiations.negotiationDetail('neg-002'),
    datasetScenarioId: 'completed',
    steps: [
      'Abrir neg-002 com dataset que mantenha contraproposta.',
      'Validar significado do estágio e próximo passo destacado.',
      'Checar documentos com alerta ou pendência.',
      'Registrar decisão em notas internas de QA.'
    ],
    expectedResult: 'O detalhe destaca contraproposta e próximos passos com microcopy consistente.',
    areas: ['negotiations', 'detail', 'commercial'],
    priority: 'high',
    status: 'ready',
    tags: ['negotiations', 'counteroffer', 'detail']
  },
  {
    id: 'negotiation-detail-document-pending',
    title: 'Detalhe de negociação: documento pendente',
    description: 'Garante leitura de documentos pendentes com impacto operacional.',
    objective: 'Assegurar que chips de documento mostrem status e impacto em pt-BR/en-US/es.',
    riskCovered: 'Documentação tratada como lista técnica sem prioridade.',
    persona: 'Transportador revisando compliance',
    startRoute: intlAppPaths.negotiations.negotiationDetail('neg-001'),
    datasetScenarioId: 'market-active',
    steps: [
      'Abrir detalhe com NF-e ou manifesto pendente no mock.',
      'Ler o impacto descrito abaixo do nome do documento.',
      'Alternar idioma e validar rótulos de status.',
      'Confirmar contraste em tema claro e escuro.'
    ],
    expectedResult: 'Documentos pendentes aparecem com status visível e texto de impacto.',
    areas: ['negotiations', 'documents', 'i18n'],
    priority: 'medium',
    status: 'ready',
    tags: ['negotiations', 'documents', 'detail']
  },
  {
    id: 'negotiation-detail-access-denied',
    title: 'Detalhe de negociação: sem acesso',
    description: 'Confirma mensagem amigável quando o perfil não pode ver o detalhe.',
    objective: 'Evitar página vazia ou erro genérico quando a regra de acesso bloqueia.',
    riskCovered: 'Vazamento de contexto ou mensagem agressiva para usuário leigo.',
    persona: 'Conta sem vínculo com a negociação',
    startRoute: intlAppPaths.negotiations.negotiationDetail('neg-001'),
    datasetScenarioId: 'market-active',
    steps: [
      'Entrar com usuário sem vínculo com a negociação alvo.',
      'Abrir o ID da negociação diretamente pela URL.',
      'Validar título e descrição de acesso negado.',
      'Confirmar ausência de dados sensíveis no corpo.'
    ],
    expectedResult: 'A UI comunica falta de acesso sem expor detalhes da negociação.',
    areas: ['negotiations', 'access-control', 'copy'],
    priority: 'medium',
    status: 'ready',
    tags: ['negotiations', 'access', 'detail']
  }
] satisfies readonly MockQaScenario[];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function filterMockQaScenarios(query: string, scenarios: readonly MockQaScenario[] = mockQaScenarios) {
  const normalized = normalize(query);
  if (!normalized) return scenarios;

  return scenarios.filter((scenario) =>
    [
      scenario.id,
      scenario.title,
      scenario.description,
      scenario.objective,
      scenario.riskCovered,
      scenario.persona,
      scenario.startRoute,
      scenario.datasetScenarioId,
      scenario.expectedResult,
      scenario.priority,
      scenario.status,
      ...scenario.areas,
      ...scenario.tags,
      ...scenario.steps
    ].some((entry) => normalize(entry).includes(normalized))
  );
}

export function formatMockQaScenarioClipboard(scenario: MockQaScenario) {
  return [
    scenario.title,
    '',
    `Objetivo: ${scenario.objective}`,
    `Risco coberto: ${scenario.riskCovered}`,
    `Persona: ${scenario.persona}`,
    `Rota inicial: ${scenario.startRoute}`,
    `Dataset sugerido: ${scenario.datasetScenarioId}`,
    `Áreas: ${scenario.areas.join(', ')}`,
    `Tags: ${scenario.tags.join(', ')}`,
    '',
    'Passos recomendados:',
    ...scenario.steps.map((step, index) => `${index + 1}. ${step}`),
    '',
    `Resultado esperado: ${scenario.expectedResult}`
  ].join('\n');
}
