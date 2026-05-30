'use client';

import { useMemo, useState } from 'react';

import styles from './mobile-cargo-list-lab-v2.module.scss';

type CargoStatus = 'cotacao' | 'transito' | 'reservada' | 'atencao';

type CargoItem = {
  id: string;
  title: string;
  subtitle: string;
  origin: string;
  originTerminal: string;
  destination: string;
  destinationTerminal: string;
  eta: string;
  confidence: string;
  volume: string;
  status: CargoStatus;
  statusLabel: string;
  vessel: string;
  cutoff: string;
};

const CARGOES: CargoItem[] = [
  {
    id: 'CARGO-011',
    title: 'Farinha de mandioca ensacada',
    subtitle: 'casa de farinha · lote 3',
    origin: 'Obidos, PA',
    originTerminal: 'Terminal de Obidos',
    destination: 'Santarem, PA',
    destinationTerminal: 'Terminal Fluvial de Santarem',
    eta: '4-7 dias',
    confidence: 'Confianca media',
    volume: '18 t',
    status: 'cotacao',
    statusLabel: 'Em cotacao',
    vessel: 'Balsa graneleira',
    cutoff: 'Hoje, 18:00',
  },
  {
    id: 'CARGO-009',
    title: 'Madeira serrada',
    subtitle: 'lote fechado',
    origin: 'Itaituba, PA',
    originTerminal: 'Porto de Itaituba',
    destination: 'Santarem, PA',
    destinationTerminal: 'Terminal Fluvial de Santarem',
    eta: '3-5 dias',
    confidence: 'Alta confianca',
    volume: '32 t',
    status: 'cotacao',
    statusLabel: 'Em cotacao',
    vessel: 'Convoio empurrado',
    cutoff: 'Amanha, 10:00',
  },
  {
    id: 'CARGO-007',
    title: 'Oleo de palma bruto',
    subtitle: 'tanques · lote 12',
    origin: 'Acara, PA',
    originTerminal: 'Porto de Acara',
    destination: 'Belem, PA',
    destinationTerminal: 'Porto de Belem',
    eta: '2-4 dias',
    confidence: 'Alta confianca',
    volume: '24 t',
    status: 'reservada',
    statusLabel: 'Reservada',
    vessel: 'Balsa tanque',
    cutoff: 'Sex, 12:00',
  },
  {
    id: 'CARGO-005',
    title: 'Graos de milho',
    subtitle: 'granel · lote 21',
    origin: 'Miritituba, PA',
    originTerminal: 'Porto de Miritituba',
    destination: 'Santarem, PA',
    destinationTerminal: 'Terminal Fluvial de Santarem',
    eta: '4-6 dias',
    confidence: 'Confianca media',
    volume: '28 t',
    status: 'transito',
    statusLabel: 'Em transito',
    vessel: 'Balsa graneleira',
    cutoff: 'Seg, 08:00',
  },
];

const statusFilters = [
  { id: 'todos', label: 'Todos' },
  { id: 'cotacao', label: 'Cotacao' },
  { id: 'transito', label: 'Transito' },
  { id: 'atencao', label: 'Atencao' },
] as const;

type StatusFilter = (typeof statusFilters)[number]['id'];

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M7 12h10M10 17h4" />
      <circle cx="16" cy="7" r="1.7" />
      <circle cx="9" cy="12" r="1.7" />
      <circle cx="13" cy="17" r="1.7" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function BoatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 17h14l-2 3H7l-2-3Z" />
      <path d="M7 17V9h10v8M10 9V5h4v4" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function NavIcon({ type }: { type: 'cargo' | 'quotes' | 'vessel' | 'alerts' | 'more' }) {
  if (type === 'cargo') return <CubeIcon />;
  if (type === 'vessel') return <BoatIcon />;
  if (type === 'alerts') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2ZM10 21h4" />
      </svg>
    );
  }
  if (type === 'more') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h.01M12 12h.01M19 12h.01" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 17 12 5l7 12H5Z" />
      <path d="M12 10v3M12 16h.01" />
    </svg>
  );
}

export function MobileCargoListLabV2() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('todos');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<CargoItem | null>(null);

  const filteredCargoes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return CARGOES.filter((cargo) => {
      const matchesStatus = status === 'todos' || cargo.status === status;
      const matchesQuery =
        normalizedQuery.length < 2 ||
        `${cargo.id} ${cargo.title} ${cargo.subtitle} ${cargo.origin} ${cargo.destination} ${cargo.vessel}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const activeFilterCount = (status !== 'todos' ? 1 : 0) + (query.trim().length >= 2 ? 1 : 0);
  const sheetCargo = selectedCargo ?? filteredCargoes[0] ?? CARGOES[0];

  function openCargoSheet(cargo: CargoItem) {
    setSelectedCargo(cargo);
    setIsSheetOpen(true);
  }

  function resetFilters() {
    setQuery('');
    setStatus('todos');
  }

  return (
    <main className={styles.root}>
      <section className={styles.phoneShell} aria-label="Experiencia visual dev v2 da lista de cargas">
        <div className={styles.backdrop} aria-hidden="true" />

        <header className={styles.header}>
          <div>
            <p className={styles.routeEyebrow}>DEV-V2 · Light cargo experience</p>
            <h1>Cargas</h1>
            <p>{filteredCargoes.length} de {CARGOES.length} cargas</p>
          </div>

          <button className={styles.headerIconButton} type="button" onClick={() => setIsSheetOpen(true)} aria-label="Abrir filtros">
            <FilterIcon />
            {activeFilterCount > 0 ? <span>{activeFilterCount}</span> : null}
          </button>
        </header>

        <div className={styles.searchRow}>
          <label className={styles.searchField}>
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar carga, origem ou destino"
              aria-label="Buscar carga, origem ou destino"
            />
          </label>
          <button className={styles.filterPill} type="button" onClick={() => setIsSheetOpen(true)}>
            <FilterIcon />
            <span>{activeFilterCount > 0 ? 'Filtros ativos' : 'Filtrar'}</span>
            {activeFilterCount > 0 ? <strong>{activeFilterCount}</strong> : null}
          </button>
        </div>

        <div className={styles.chipScroller} aria-label="Filtros rapidos de status">
          {statusFilters.map((item) => (
            <button
              key={item.id}
              className={styles.statusChip}
              data-active={status === item.id}
              type="button"
              onClick={() => setStatus(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeFilterCount > 0 ? (
          <section className={styles.activeFilters} aria-label="Filtros ativos">
            <div>
              <span>Filtros ativos</span>
              <strong>{activeFilterCount}</strong>
            </div>
            <button type="button" onClick={resetFilters}>Limpar tudo</button>
          </section>
        ) : null}

        <section className={styles.list} aria-label="Lista de cargas dev v2">
          {filteredCargoes.map((cargo, index) => (
            <button
              key={cargo.id}
              className={styles.cargoCard}
              type="button"
              style={{ '--card-index': index } as React.CSSProperties}
              onClick={() => openCargoSheet(cargo)}
            >
              <div className={styles.cardMain}>
                <div className={styles.cardTopline}>
                  <span className={styles.cargoIcon}><CubeIcon /></span>
                  <span className={styles.cargoId}>{cargo.id}</span>
                  <span className={styles.statusBadge} data-status={cargo.status}>{cargo.statusLabel}</span>
                </div>

                <h2>{cargo.title}</h2>
                <p className={styles.cardSubtitle}>{cargo.subtitle}</p>

                <div className={styles.routeGrid}>
                  <div>
                    <span>Origem</span>
                    <strong>{cargo.origin}</strong>
                    <small>{cargo.originTerminal}</small>
                  </div>
                  <BoatIcon />
                  <div>
                    <span>Destino</span>
                    <strong>{cargo.destination}</strong>
                    <small>{cargo.destinationTerminal}</small>
                  </div>
                </div>
              </div>

              <aside className={styles.cardAside}>
                <div>
                  <span>ETA</span>
                  <strong>{cargo.eta}</strong>
                  <small>{cargo.confidence}</small>
                </div>
                <div>
                  <span>Volume</span>
                  <strong>{cargo.volume}</strong>
                  <small>{cargo.vessel}</small>
                </div>
                <ChevronIcon />
              </aside>
            </button>
          ))}
        </section>

        <nav className={styles.bottomDock} aria-label="Navegacao principal dev v2">
          <button className={styles.logoButton} type="button" aria-label="HydriRivers">N</button>
          <button className={styles.navItem} data-active="true" type="button"><NavIcon type="cargo" /><span>Cargas</span></button>
          <button className={styles.navItem} type="button"><NavIcon type="quotes" /><span>Cotacoes</span></button>
          <button className={styles.navItem} type="button"><NavIcon type="vessel" /><span>Embarcacoes</span></button>
          <button className={styles.navItem} type="button"><NavIcon type="alerts" /><span>Alertas</span></button>
          <button className={styles.navItem} type="button"><NavIcon type="more" /><span>Mais</span></button>
        </nav>

        {isSheetOpen ? (
          <div className={styles.sheetOverlay} role="presentation" onPointerDown={() => setIsSheetOpen(false)}>
            <section
              className={styles.bottomSheet}
              role="dialog"
              aria-modal="true"
              aria-label="Detalhes e filtros da lista de cargas"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className={styles.sheetGrabber} aria-hidden="true" />
              <button className={styles.sheetClose} type="button" onClick={() => setIsSheetOpen(false)} aria-label="Fechar sheet">×</button>

              <div className={styles.sheetHero}>
                <span className={styles.cargoIcon}><CubeIcon /></span>
                <div>
                  <p>{sheetCargo.id}</p>
                  <h2>{selectedCargo ? sheetCargo.title : 'Visualizar filtros'}</h2>
                  <span>{selectedCargo ? sheetCargo.statusLabel : 'Refine a lista por operacao, origem e destino'}</span>
                </div>
              </div>

              {!selectedCargo ? (
                <div className={styles.sheetFilters}>
                  <div className={styles.sheetSectionTitle}>Status</div>
                  <div className={styles.sheetChipGrid}>
                    {statusFilters.map((item) => (
                      <button key={item.id} type="button" data-active={status === item.id} onClick={() => setStatus(item.id)}>{item.label}</button>
                    ))}
                  </div>
                  <div className={styles.sheetSectionTitle}>Operacional</div>
                  <div className={styles.sheetMetricsGrid}>
                    <div><span>Tipo de embarcacao</span><strong>Balsa graneleira</strong></div>
                    <div><span>Cut-off</span><strong>Hoje, 18:00</strong></div>
                    <div><span>Calado max.</span><strong>2.8 m</strong></div>
                    <div><span>Janela</span><strong>Portuaria</strong></div>
                  </div>
                  <div className={styles.sheetFooterActions}>
                    <button type="button" onClick={resetFilters}>Limpar filtros</button>
                    <button type="button" data-primary="true" onClick={() => setIsSheetOpen(false)}>Visualizar filtros</button>
                  </div>
                </div>
              ) : (
                <div className={styles.sheetDetails}>
                  <div className={styles.sheetRouteCard}>
                    <div><span>Origem</span><strong>{sheetCargo.origin}</strong><small>{sheetCargo.originTerminal}</small></div>
                    <BoatIcon />
                    <div><span>Destino</span><strong>{sheetCargo.destination}</strong><small>{sheetCargo.destinationTerminal}</small></div>
                  </div>
                  <button type="button"><span>Visao geral</span><small>Resumo operacional e rota hidroviaria</small><ChevronIcon /></button>
                  <button type="button"><span>Jornada</span><small>Eventos, checkpoints e prazos</small><ChevronIcon /></button>
                  <button type="button"><span>Documentos</span><small>Conhecimentos, notas e certificados</small><ChevronIcon /></button>
                  <button type="button"><span>Custos</span><small>Frete estimado, taxas e margem</small><ChevronIcon /></button>
                </div>
              )}
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
