'use client';

import { useMemo, useState } from 'react';
import styles from './embarcador-glass-flow-lab.module.sass';
import { cargos, flowSteps, type Cargo, type CargoStatus } from '../data/embarcador-flow-data';

type AppMode = 'light' | 'dark';
type Screen = 'home' | 'create' | 'detail' | 'map';
type SheetKind = 'route' | 'quote' | 'documents' | 'eta' | 'payment' | 'issue' | 'filters' | 'cargo' | 'risk' | 'performance' | null;

const stepToSheet: Record<CargoStatus, SheetKind> = {
  planning: 'route',
  quote: 'quote',
  documents: 'documents',
  tracking: 'eta',
  payment: 'payment',
  issue: 'issue',
};

export function EmbarcadorGlassFlowLab() {
  const [mode, setMode] = useState<AppMode>('light');
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedCargoId, setSelectedCargoId] = useState(cargos[0]?.id ?? '');
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [activeFilter, setActiveFilter] = useState('Todas');

  const selectedCargo = useMemo(
    () => cargos.find((cargo) => cargo.id === selectedCargoId) ?? cargos[0],
    [selectedCargoId],
  );

  function openCargo(cargo: Cargo) {
    setSelectedCargoId(cargo.id);
    setScreen('detail');
    setSheet(null);
  }

  function openStep(step: CargoStatus) {
    setSheet(stepToSheet[step]);
  }

  return (
    <section className={`${styles.labPage} ${mode === 'dark' ? styles.dark : styles.light}`}>
      <div className={styles.screenBackground} aria-hidden="true" />

      <main className={styles.contentShell}>
        <header className={styles.labIntro}>
          <p>HydriRivers Lab</p>
          <h1>Jornada da embarcadora</h1>
          <span>Fluxo completo em lab, sem tocar nas rotas reais.</span>
        </header>

        <div className={styles.screenStack} aria-label="Preview mobile da jornada da embarcadora">
          {screen === 'home' ? (
            <HomeScreen
              mode={mode}
              setMode={setMode}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              onOpenCargo={openCargo}
              onOpenFilters={() => setSheet('filters')}
              onCreate={() => setScreen('create')}
            />
          ) : null}

          {screen === 'create' ? (
            <CreateCargoScreen
              onBack={() => setScreen('home')}
              onOpenStep={openStep}
              onOpenCargo={() => openCargo(cargos[0])}
            />
          ) : null}

          {screen === 'detail' && selectedCargo ? (
            <CargoDetailScreen
              cargo={selectedCargo}
              onBack={() => setScreen('home')}
              onOpenMap={() => setScreen('map')}
              onOpenSheet={setSheet}
            />
          ) : null}

          {screen === 'map' && selectedCargo ? (
            <MapScreen cargo={selectedCargo} onBack={() => setScreen('detail')} />
          ) : null}

          <GlassBottomNav active={screen === 'home' ? 'inicio' : 'cargas'} onSelect={(target) => setScreen(target === 'inicio' ? 'home' : 'detail')} />
        </div>
      </main>

      {sheet ? <GlassSheet kind={sheet} cargo={selectedCargo} onClose={() => setSheet(null)} /> : null}
    </section>
  );
}

type HomeProps = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onOpenCargo: (cargo: Cargo) => void;
  onOpenFilters: () => void;
  onCreate: () => void;
};

function getCargoStatusVariant(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes('trânsito') || normalizedStatus.includes('transito')) {
    return styles.statusInTransit;
  }
  if (normalizedStatus.includes('aguardando')) {
    return styles.statusWaiting;
  }
  if (normalizedStatus.includes('atracado') || normalizedStatus.includes('concluído') || normalizedStatus.includes('concluido')) {
    return styles.statusCompleted;
  }
  if (
    normalizedStatus.includes('atrasado')
    || normalizedStatus.includes('risco')
    || normalizedStatus.includes('bloqueado')
    || normalizedStatus.includes('atenção')
    || normalizedStatus.includes('atencao')
  ) {
    return styles.statusRisk;
  }
  if (normalizedStatus.includes('análise') || normalizedStatus.includes('analise') || normalizedStatus.includes('vistoria')) {
    return styles.statusAnalysis;
  }

  return styles.statusNeutral;
}

function HomeScreen({ mode, setMode, activeFilter, setActiveFilter, onOpenCargo, onOpenFilters, onCreate }: HomeProps) {
  const filters = ['Todas', 'Em trânsito', 'Aguardando', 'Atracado'];

  return (
    <div className={styles.screen}>
      <header className={styles.heroCard}>
        <div className={styles.topRow}>
          <span className={styles.brand}>⚓ HydriRivers</span>
          <div className={styles.iconCluster}>
            <button className={styles.iconButton} type="button" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} aria-label="Alternar tema">
              {mode === 'light' ? '☾' : '☼'}
            </button>
            <button className={styles.iconButton} type="button" aria-label="Idioma">PT</button>
          </div>
        </div>
        <p>Quarta, 18 Jun</p>
        <h2>Minhas Cargas</h2>
        <span>4 comboios · Região Norte</span>
      </header>

      <div className={styles.searchRow}>
        <label className={styles.searchBar}>
          <span>⌕</span>
          <input aria-label="Buscar comboio" placeholder="Buscar comboio ou rota..." />
        </label>
        <button className={styles.iconButtonLarge} type="button" onClick={onOpenFilters} aria-label="Abrir filtros">☷</button>
      </div>

      <div className={styles.chipRail} aria-label="Filtros de carga">
        {filters.map((filter) => (
          <button
            className={`${styles.chip} ${activeFilter === filter ? styles.chipActive : ''}`}
            type="button"
            key={filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <button className={styles.createCargo} type="button" onClick={onCreate}>
        <span>▧</span>
        <strong>Criar carga</strong>
        <small>Iniciar novo envio pela hidrovia</small>
      </button>

      <div className={styles.cardList}>
        {cargos.map((cargo) => (
          <button
            className={`${styles.cargoCard} ${getCargoStatusVariant(cargo.status)}`}
            type="button"
            key={cargo.id}
            onClick={() => onOpenCargo(cargo)}
          >
            <div className={styles.cargoCardHeader}>
              <strong className={styles.cargoTitle}>{cargo.title}</strong>
              <span className={styles.cargoBadge}>{cargo.status}</span>
            </div>
            <p className={styles.cargoRoute}>{cargo.origin} → {cargo.destination}</p>
            <div className={styles.cargoMeta}>
              <span className={styles.cargoMetaIcon} aria-hidden="true">◷</span>
              <span>{cargo.eta} · {cargo.tonnage} · {cargo.cargoType}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

type CreateCargoProps = {
  onBack: () => void;
  onOpenStep: (step: CargoStatus) => void;
  onOpenCargo: () => void;
};

function CreateCargoScreen({ onBack, onOpenStep, onOpenCargo }: CreateCargoProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.compactHeader}>
        <button className={styles.iconButton} type="button" onClick={onBack} aria-label="Voltar">‹</button>
        <div>
          <span>Jornada</span>
          <h2>Criar carga</h2>
        </div>
        <button className={styles.iconButton} type="button" onClick={onOpenCargo} aria-label="Abrir detalhe">✓</button>
      </header>

      <section className={`${styles.card} ${styles.mainAction}`}>
        <span className={styles.bigIcon}>▧</span>
        <h3>Nova carga hidroviária</h3>
        <p>Monte a operação do início ao fim: rota, cotação, documentos, ETA, pagamento e ocorrência.</p>
        <button className={styles.primaryButton} type="button" onClick={onOpenCargo}>Ir para detalhe</button>
      </section>

      <section className={styles.flowGrid}>
        {flowSteps.map((step) => (
          <button className={styles.flowStep} type="button" key={step.id} onClick={() => onOpenStep(step.id)}>
            <span>{step.eyebrow}</span>
            <strong>{step.title}</strong>
            <small>{step.description}</small>
            <em>{step.cta}</em>
          </button>
        ))}
      </section>

      <section className={styles.scenarioGrid}>
        <article className={`${styles.card} ${styles.successCard}`}>
          <strong>Cenário de sucesso</strong>
          <p>Carga criada → operador encontrado → docs aprovados → viagem iniciada → entrega confirmada.</p>
        </article>
        <article className={`${styles.card} ${styles.errorCard}`}>
          <strong>Cenário de erro</strong>
          <p>OTP inválido → documento pendente → restrição de calado → clima severo → pagamento falhou.</p>
        </article>
      </section>
    </div>
  );
}

type DetailProps = {
  cargo: Cargo;
  onBack: () => void;
  onOpenMap: () => void;
  onOpenSheet: (kind: SheetKind) => void;
};

function CargoDetailScreen({ cargo, onBack, onOpenMap, onOpenSheet }: DetailProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.compactHeader}>
        <button className={styles.iconButton} type="button" onClick={onBack} aria-label="Voltar">‹</button>
        <div>
          <span>{cargo.status}</span>
          <h2>{cargo.title}</h2>
          <p>{cargo.cargoType} · {cargo.tonnage} · ETA {cargo.eta}</p>
        </div>
      </header>

      <button className={`${styles.card} ${styles.mapPreview}`} type="button" onClick={onOpenMap}>
        <CardTitle icon="⌖" title="Mapa de rastreio" action="Abrir mapa" />
        <RouteMapPreview cargo={cargo} />
      </button>

      <div className={styles.metricsGrid}>
        <MetricCard title="Calado" value={cargo.draft} caption="0,3 m acima do mínimo" icon="≋" onClick={() => onOpenSheet('cargo')} />
        <MetricCard title="Nível do rio" value={cargo.riverLevel} caption="Tendência estável" icon="♧" onClick={() => onOpenSheet('cargo')} />
        <MetricCard title="ETA" value={cargo.eta.split(',')[0]} caption={cargo.destination} icon="◷" onClick={() => onOpenSheet('eta')} />
        <MetricCard title="Risco" value={cargo.risk} caption="Sem restrições críticas" icon="◜" onClick={() => onOpenSheet('risk')} />
      </div>

      <button className={`${styles.card} ${styles.routeProgress}`} type="button" onClick={() => onOpenSheet('performance')}>
        <CardTitle icon="⌁" title="Progresso da rota" action="Detalhes" />
        <strong>{cargo.origin} → {cargo.destination}</strong>
        <div className={styles.sliderTrack}><span style={{ width: `${cargo.progress}%` }} /><i style={{ left: `${cargo.progress}%` }} /></div>
        <p><b>{cargo.progress}%</b> da rota concluída · 1.240 km percorridos · 2.310 km restantes</p>
      </button>

      <button className={`${styles.card} ${styles.costCard}`} type="button" onClick={() => onOpenSheet('payment')}>
        <CardTitle icon="$" title="Custos e impacto" action="Abrir" />
        <strong>{cargo.cost}</strong>
        <p>Custo atual · impacto estimado do atraso {cargo.delayCost}</p>
      </button>

      <button className={`${styles.card} ${styles.timelineCard}`} type="button" onClick={() => onOpenSheet('eta')}>
        <CardTitle icon="◷" title="Timeline da carga" action="Ver" />
        <div className={styles.timelineDots}>
          {['Planejamento', 'Autorização', 'Documentação', 'Embarque', 'Trânsito', 'Destino'].map((item, index) => (
            <span key={item} data-done={index < 4}>{item}</span>
          ))}
        </div>
      </button>
    </div>
  );
}

function CardTitle({ icon, title, action }: { icon: string; title: string; action?: string }) {
  return (
    <div className={styles.cardTitle}>
      <span>{icon}</span>
      <strong>{title}</strong>
      {action ? <em>{action}</em> : null}
    </div>
  );
}

function RouteMapPreview({ cargo }: { cargo: Cargo }) {
  return (
    <div className={styles.mapCanvas}>
      <span className={`${styles.river} ${styles.riverOne}`} />
      <span className={`${styles.river} ${styles.riverTwo}`} />
      <span className={`${styles.riverLabel} ${styles.rioNegro}`}>Rio Negro</span>
      <span className={`${styles.riverLabel} ${styles.rioSolimoes}`}>Rio Solimões</span>
      <span className={`${styles.riverLabel} ${styles.rioTapajos}`}>Rio Tapajós</span>
      <svg viewBox="0 0 360 220" className={styles.routeSvg} aria-hidden="true">
        <path d="M78 72 C124 68 134 96 153 105 C177 122 185 151 203 162 C225 177 247 170 263 190" />
        <circle cx="78" cy="72" r="5" />
        <circle cx="153" cy="105" r="5" />
        <circle cx="203" cy="162" r="5" />
        <circle cx="263" cy="190" r="7" />
      </svg>
      <span className={`${styles.place} ${styles.manaus}`}>Manaus</span>
      <span className={`${styles.place} ${styles.itacoatiara}`}>Itacoatiara</span>
      <span className={`${styles.place} ${styles.santarem}`}>Santarém</span>
      <span className={`${styles.place} ${styles.altamira}`}>Altamira</span>
      <strong className={styles.routeBubble}>{cargo.progress}</strong>
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  caption: string;
  icon: string;
  onClick: () => void;
};

function MetricCard({ title, value, caption, icon, onClick }: MetricCardProps) {
  return (
    <button className={`${styles.card} ${styles.metricCard}`} type="button" onClick={onClick}>
      <CardTitle icon={icon} title={title} />
      <strong>{value}</strong>
      <p>{caption}</p>
      <i aria-hidden="true" />
    </button>
  );
}

function MapScreen({ cargo, onBack }: { cargo: Cargo; onBack: () => void }) {
  return (
    <div className={styles.screen}>
      <header className={styles.compactHeader}>
        <button className={styles.iconButton} type="button" onClick={onBack} aria-label="Voltar">‹</button>
        <div>
          <span>Mapa hidroviário</span>
          <h2>{cargo.origin} → {cargo.destination}</h2>
        </div>
      </header>
      <section className={`${styles.card} ${styles.fullMapCard}`}>
        <CardTitle icon="⌖" title="Mapa de rastreio" />
        <RouteMapPreview cargo={cargo} />
        <p>Preview visual estilo MapLibre para o lab. Na rota real, ligar ao mapa operacional existente.</p>
      </section>
    </div>
  );
}

function GlassSheet({ kind, cargo, onClose }: { kind: SheetKind; cargo?: Cargo; onClose: () => void }) {
  if (!kind) return null;

  const titleMap: Record<Exclude<SheetKind, null>, string> = {
    route: 'Comparar rotas',
    quote: 'Solicitar cotação',
    documents: 'Documentos',
    eta: 'ETA e timeline',
    payment: 'Pagamento',
    issue: 'Reportar ocorrência',
    filters: 'Filtros',
    cargo: 'Dados da carga',
    risk: 'Riscos e alertas',
    performance: 'Desempenho da viagem',
  };

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true" aria-label={titleMap[kind]}>
      <button className={styles.scrim} type="button" onClick={onClose} aria-label="Fechar" />
      <section className={styles.sheet}>
        <span className={styles.grabber} />
        <div className={styles.sheetHeader}>
          <div>
            <h3>{titleMap[kind]}</h3>
            <p>{cargo?.title ?? 'Jornada da embarcadora'}</p>
          </div>
          <button className={styles.iconButton} type="button" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        {kind === 'filters' ? <FilterSheet /> : null}
        {kind === 'risk' ? <RiskSheet cargo={cargo} /> : null}
        {kind === 'performance' ? <PerformanceSheet cargo={cargo} /> : null}
        {kind !== 'filters' && kind !== 'risk' && kind !== 'performance' ? <GenericSheet kind={kind} cargo={cargo} /> : null}
      </section>
    </div>
  );
}

function FilterSheet() {
  return (
    <div className={styles.sheetContent}>
      {['Status', 'Corredor', 'Tipo de carga', 'Janela portuária'].map((item) => (
        <button className={styles.sheetRow} type="button" key={item}>
          <span>{item}</span>
          <strong>Todos</strong>
        </button>
      ))}
    </div>
  );
}

function GenericSheet({ kind, cargo }: { kind: Exclude<SheetKind, null>; cargo?: Cargo }) {
  return (
    <div className={styles.sheetContent}>
      <article className={styles.sheetChartCard}>
        <strong>{kind === 'documents' ? cargo?.docs : cargo?.progress + '%'}</strong>
        <p>{kind === 'payment' ? cargo?.cost : 'Resumo operacional do item selecionado'}</p>
      </article>
      <article className={styles.timelineList}>
        {['Carregamento concluído', 'Partida de Miritituba', 'Passagem por Itaituba', 'Entrada Canal Norte', 'Atracação em Barcarena'].map((event, index) => (
          <span key={event} data-active={index < 4}>{event}</span>
        ))}
      </article>
    </div>
  );
}

function RiskSheet({ cargo }: { cargo?: Cargo }) {
  return (
    <div className={styles.sheetContent}>
      <article className={styles.riskGauge}>
        <strong>{cargo?.risk ?? 'Baixo'}</strong>
        <span />
      </article>
      <article className={styles.timelineList}>
        <span data-active>Restrição de calado monitorada</span>
        <span data-active>Chuva leve prevista</span>
        <span>Sem bloqueios críticos</span>
      </article>
    </div>
  );
}

function PerformanceSheet({ cargo }: { cargo?: Cargo }) {
  return (
    <div className={styles.sheetContent}>
      <article className={styles.sheetChartCard}>
        <CardTitle icon="⌁" title="Progresso da rota" />
        <strong>{cargo?.progress ?? 68}%</strong>
        <div className={styles.barChart}>
          {[42, 68, 52, 83, 36, 74].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
        </div>
      </article>
    </div>
  );
}

function GlassBottomNav({ active, onSelect }: { active: 'inicio' | 'cargas'; onSelect: (target: 'inicio' | 'cargas') => void }) {
  const items = [
    { id: 'inicio', icon: '⌂', label: 'Início' },
    { id: 'cargas', icon: '▧', label: 'Cargas' },
    { id: 'mapa', icon: '⌖', label: 'Mapa' },
    { id: 'alertas', icon: '△', label: 'Alertas' },
  ] as const;

  return (
    <nav className={styles.bottomNav} aria-label="Navegação do lab">
      {items.map((item) => (
        <button
          className={active === item.id ? styles.navActive : ''}
          type="button"
          key={item.id}
          onClick={() => onSelect(item.id === 'inicio' ? 'inicio' : 'cargas')}
        >
          <span>{item.icon}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}
