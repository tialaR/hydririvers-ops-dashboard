'use client';

import { type CSSProperties, useMemo, useState } from 'react';

import styles from './mobile-cargo-list-lab-v2.module.scss';

type CargoStatus = 'cotacao' | 'transito' | 'reservada' | 'atencao';
type StatusFilter = 'todos' | CargoStatus;
type SheetMode = 'filters' | 'details' | null;
type VisualTheme = 'dark' | 'light';

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
    id: 'CRG-7845',
    title: 'Eletronicos e componentes',
    subtitle: 'cabos, placas e sensores',
    origin: 'Sao Paulo, SP',
    originTerminal: 'Terminal Barra Funda',
    destination: 'Manaus, AM',
    destinationTerminal: 'Porto Chibatao',
    eta: '24 Mai, 14:00',
    confidence: 'Entrega prevista em 2 dias',
    volume: '18 t',
    status: 'transito',
    statusLabel: 'Em transito',
    vessel: 'Balsa porta-conteineres',
    cutoff: 'Hoje, 18:00',
  },
  {
    id: 'CRG-3921',
    title: 'Maquinas industriais',
    subtitle: 'carga projeto',
    origin: 'Curitiba, PR',
    originTerminal: 'Terminal CIC',
    destination: 'Salvador, BA',
    destinationTerminal: 'Terminal Aratu',
    eta: '28 Mai, 09:30',
    confidence: 'Janela confirmada',
    volume: '32 t',
    status: 'cotacao',
    statusLabel: 'Agendado',
    vessel: 'Convoio empurrado',
    cutoff: 'Amanha, 10:00',
  },
  {
    id: 'CRG-7012',
    title: 'Insumos refrigerados',
    subtitle: 'cadeia fria',
    origin: 'Belem, PA',
    originTerminal: 'Porto de Belem',
    destination: 'Santarem, PA',
    destinationTerminal: 'Terminal Fluvial de Santarem',
    eta: '2-4 dias',
    confidence: 'Alta confianca',
    volume: '24 t',
    status: 'reservada',
    statusLabel: 'Reservada',
    vessel: 'Balsa refrigerada',
    cutoff: 'Sex, 12:00',
  },
  {
    id: 'CRG-4510',
    title: 'Graos de milho',
    subtitle: 'granel solido · lote 21',
    origin: 'Miritituba, PA',
    originTerminal: 'Porto de Miritituba',
    destination: 'Santarem, PA',
    destinationTerminal: 'Terminal Fluvial de Santarem',
    eta: '4-6 dias',
    confidence: 'Confianca media',
    volume: '28 t',
    status: 'cotacao',
    statusLabel: 'Em cotacao',
    vessel: 'Balsa graneleira',
    cutoff: 'Seg, 08:00',
  },
];

const statusFilters: Array<{ id: StatusFilter; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'transito', label: 'Em transito' },
  { id: 'cotacao', label: 'Agendado' },
  { id: 'reservada', label: 'Reservada' },
  { id: 'atencao', label: 'Atencao' },
];

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

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11V5h6l10 10-6 6L4 11Z" />
      <path d="M8 8h.01" />
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

function ThemeIcon({ theme }: { theme: VisualTheme }) {
  if (theme === 'dark') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a7 7 0 1 0 11.5 11.5Z" />
    </svg>
  );
}

function NavIcon({ type }: { type: 'cargo' | 'quotes' | 'vessel' | 'alerts' | 'profile' }) {
  if (type === 'cargo') return <CubeIcon />;
  if (type === 'vessel') return <BoatIcon />;
  if (type === 'alerts') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2ZM10 21h4" />
      </svg>
    );
  }
  if (type === 'profile') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    );
  }
  return <TagIcon />;
}

export function MobileCargoListLabV2() {
  const [theme, setTheme] = useState<VisualTheme>('dark');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('todos');
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
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

  function openFilters() {
    setSelectedCargo(null);
    setSheetMode('filters');
  }

  function openCargoSheet(cargo: CargoItem) {
    setSelectedCargo(cargo);
    setSheetMode('details');
  }

  function closeSheet() {
    setSheetMode(null);
  }

  function resetFilters() {
    setQuery('');
    setStatus('todos');
  }

  return (
    <main className={styles.root} data-theme={theme}>
      <section className={styles.phoneShell} aria-label="Experiencia visual dev v2 da lista de cargas">
        <div className={styles.backdrop} aria-hidden="true" />
        <div className={styles.statusBar} aria-hidden="true">
          <span>9:41</span>
          <span>▴ ))) ▱</span>
        </div>

        <header className={styles.header}>
          <div>
            <h1>Cargas</h1>
            <p>{filteredCargoes.length} de {CARGOES.length} cargas</p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.headerIconButton}
              type="button"
              onClick={openFilters}
              aria-label="Abrir filtros"
            >
              <FilterIcon />
              {activeFilterCount > 0 ? <span>{activeFilterCount}</span> : null}
            </button>
            <button
              className={styles.headerIconButton}
              type="button"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              aria-label={theme === 'dark' ? 'Ativar light mode' : 'Ativar dark mode'}
            >
              <ThemeIcon theme={theme} />
            </button>
          </div>
        </header>

        <div className={styles.searchRow}>
          <label className={styles.searchField}>
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar cargas..."
              aria-label="Buscar carga, origem ou destino"
            />
          </label>
          <button className={styles.filterSquare} type="button" onClick={openFilters} aria-label="Visualizar filtros">
            <FilterIcon />
          </button>
        </div>

        <section className={styles.list} aria-label="Lista de cargas dev v2">
          {filteredCargoes.map((cargo, index) => (
            <button
              key={cargo.id}
              className={styles.cargoCard}
              type="button"
              style={{ '--card-index': index } as CSSProperties}
              onClick={() => openCargoSheet(cargo)}
            >
              <div className={styles.cardTopline}>
                <span className={styles.cargoIcon}><CubeIcon /></span>
                <span className={styles.cargoId}>{cargo.id}</span>
                <span className={styles.statusBadge} data-status={cargo.status}>{cargo.statusLabel}</span>
              </div>

              <h2>{cargo.title}</h2>
              <p className={styles.cardSubtitle}>{cargo.subtitle}</p>

              <div className={styles.routeLine}>
                <span>{cargo.origin}</span>
                <i aria-hidden="true" />
                <BoatIcon />
                <i aria-hidden="true" />
                <span>{cargo.destination}</span>
              </div>

              <footer className={styles.cardFooter}>
                <div><span>ETA</span><strong>{cargo.eta}</strong></div>
                <button type="button" onClick={(event) => { event.stopPropagation(); openCargoSheet(cargo); }}>Acompanhar <ChevronIcon /></button>
              </footer>
            </button>
          ))}
        </section>

        <nav className={styles.bottomDock} aria-label="Navegacao principal dev v2">
          <button className={styles.navItem} data-active="true" type="button"><NavIcon type="cargo" /><span>Cargas</span></button>
          <button className={styles.navItem} type="button"><NavIcon type="quotes" /><span>Cotacoes</span></button>
          <button className={styles.navItem} type="button"><NavIcon type="vessel" /><span>Embarcacoes</span></button>
          <button className={styles.navItem} type="button"><NavIcon type="alerts" /><span>Alertas</span></button>
          <button className={styles.navItem} type="button"><NavIcon type="profile" /><span>Perfil</span></button>
        </nav>

        {sheetMode ? (
          <div className={styles.sheetOverlay} role="presentation" onPointerDown={closeSheet}>
            <section
              className={styles.bottomSheet}
              role="dialog"
              aria-modal="true"
              aria-label="Detalhes e filtros da lista de cargas"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className={styles.sheetGrabber} aria-hidden="true" />
              <button className={styles.sheetClose} type="button" onClick={closeSheet} aria-label="Fechar sheet">×</button>

              {sheetMode === 'filters' ? (
                <div className={styles.sheetFilters}>
                  <h2>Visualizar filtros</h2>
                  <p className={styles.sheetLead}>Refine a lista por status, origem, destino e operacao.</p>

                  <div className={styles.sheetSectionTitle}>Status</div>
                  <div className={styles.sheetChipGrid}>
                    {statusFilters.map((item) => (
                      <button key={item.id} type="button" data-active={status === item.id} onClick={() => setStatus(item.id)}>{item.label}</button>
                    ))}
                  </div>

                  <div className={styles.sheetSectionTitle}>Operacional</div>
                  <div className={styles.sheetMetricsGrid}>
                    <div><span>Tipo de embarcacao</span><strong>Balsa porta-conteineres</strong></div>
                    <div><span>Cut-off</span><strong>Hoje, 18:00</strong></div>
                    <div><span>Calado max.</span><strong>2.8 m</strong></div>
                    <div><span>Janela</span><strong>Portuaria</strong></div>
                  </div>

                  <div className={styles.sheetFooterActions}>
                    <button type="button" onClick={resetFilters}>Limpar filtros</button>
                    <button type="button" data-primary="true" onClick={closeSheet}>Aplicar</button>
                  </div>
                </div>
              ) : (
                <div className={styles.sheetDetails}>
                  <div className={styles.detailHeader}>
                    <span className={styles.cargoIcon}><CubeIcon /></span>
                    <div>
                      <p>{sheetCargo.id}</p>
                      <span className={styles.statusBadge} data-status={sheetCargo.status}>{sheetCargo.statusLabel}</span>
                    </div>
                  </div>

                  <h2>{sheetCargo.title}</h2>

                  <div className={styles.sheetRouteCard}>
                    <div><span>{sheetCargo.origin}</span><small>{sheetCargo.originTerminal}</small></div>
                    <BoatIcon />
                    <div><span>{sheetCargo.destination}</span><small>{sheetCargo.destinationTerminal}</small></div>
                  </div>

                  <div className={styles.sheetMetricsGrid}>
                    <div><span>ETA</span><strong>{sheetCargo.eta}</strong></div>
                    <div><span>Entrega prevista</span><strong>{sheetCargo.confidence}</strong></div>
                  </div>

                  <button type="button"><span>Visao geral</span><small>Informacoes principais da carga</small><ChevronIcon /></button>
                  <button type="button"><span>Jornada</span><small>Rastreamento e eventos</small><ChevronIcon /></button>
                  <button type="button"><span>Documentos</span><small>Conhecimentos, notas e certificados</small><ChevronIcon /></button>
                  <button type="button"><span>Custos</span><small>Detalhamento e pagamentos</small><ChevronIcon /></button>
                </div>
              )}
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
