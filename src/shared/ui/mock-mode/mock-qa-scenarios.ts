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
  startRoute: string;
  datasetScenarioId: MockScenarioId;
  steps: readonly string[];
  expectedResult: string;
  areas: readonly string[];
  priority: MockQaScenarioPriority;
  status: MockQaScenarioStatus;
  tags: readonly string[];
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
    startRoute: intlAppPaths.cargos.myCargos,
    datasetScenarioId: 'market-active',
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
    startRoute: intlAppPaths.cargos.myCargos,
    datasetScenarioId: 'empty-state',
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
    tags: ['notifications', 'badge', 'read-state', 'mobile']
  },
  {
    id: 'notifications-zero-unread',
    title: 'Notificações zeradas',
    description: 'Verifica o estado com badge ausente ou zero depois da ação de leitura em lote.',
    objective: 'Garantir que o estado zerado seja estável e não deixe resíduos visuais no badge.',
    riskCovered: 'Badge fixo, contador desatualizado ou lista lida sem atualização visual imediata.',
    persona: 'Admin ou operação interna',
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
    tags: ['notifications', 'zero', 'persisted-state']
  },
  {
    id: 'notifications-one-unread',
    title: 'Uma notificação não lida',
    description: 'Cobre o estado em que resta apenas um item não lido para validar badge discreto e lista parcial.',
    objective: 'Confirmar que um único item pendente continua visível sem confundir o usuário.',
    riskCovered: 'Badge incorreto para 1 item, leitura parcial que não atualiza o contador e estados pouco claros.',
    persona: 'QA mobile',
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
    tags: ['notifications', 'single-unread', 'badge']
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
