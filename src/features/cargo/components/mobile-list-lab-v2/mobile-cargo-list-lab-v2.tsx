'use client';

import { type CSSProperties, type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import {
  cargoCapacityFilterOptions,
  cargoCutoffFilterOptions,
  cargoDestinationFilterOptions,
  cargoOriginFilterOptions,
  cargoStatusFilterOptions,
  cargoTypeFilterOptions,
  cargoVesselTypeFilterOptions,
  type CargoCapacityFilterValue,
  type CargoCutoffFilterValue,
  type CargoDestinationFilterValue,
  type CargoOriginFilterValue,
  type CargoStatusFilterValue,
  type CargoTypeFilterValue,
  type CargoVesselTypeFilterValue,
} from '@/features/cargo/mocks/cargo-filter-options.mock';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import { IconButton } from '@/shared/components/icon-button';
import { FilterChip } from '@/shared/components/filter-chip';
import { StatusBadge, type StatusBadgeStatus } from '@/shared/components/status-badge';

import styles from './mobile-cargo-list-lab-v2.module.scss';

type ThemeMode = 'dark' | 'light';
type CargoStatus = 'transito' | 'agendado' | 'cotacao' | 'atencao';
type SheetMode = 'filters' | 'cargo' | null;
type StatusFilter = CargoStatusFilterValue;
type CargoTypeFilter = CargoTypeFilterValue;
type VesselTypeFilter = CargoVesselTypeFilterValue;
type CutoffFilter = CargoCutoffFilterValue;
type CapacityFilter = CargoCapacityFilterValue;
type OriginFilter = CargoOriginFilterValue;
type DestinationFilter = CargoDestinationFilterValue;

type Cargo = {
  id: string;
  title: string;
  subtitle: string;
  status: CargoStatus;
  statusLabel: string;
  origin: string;
  originTerminal: string;
  destination: string;
  destinationTerminal: string;
  eta: string;
  delivery: string;
  volume: string;
  vessel: string;
  cargoType: string;
};

const CARGOES: Cargo[] = [
  {
    id: 'CRG-7845',
    title: 'Eletrônicos e componentes',
    subtitle: 'cabos, placas e sensores',
    status: 'transito',
    statusLabel: 'Em trânsito',
    origin: 'São Paulo, SP',
    originTerminal: 'Terminal Barra Funda',
    destination: 'Manaus, AM',
    destinationTerminal: 'Porto Chibatão',
    eta: '24 Mai, 14:00',
    delivery: 'Em 2 dias',
    volume: '18 t',
    vessel: 'Balsa porta-contêineres',
    cargoType: 'Contêiner',
  },
  {
    id: 'CRG-3921',
    title: 'Máquinas industriais',
    subtitle: 'carga projeto',
    status: 'agendado',
    statusLabel: 'Agendado',
    origin: 'Curitiba, PR',
    originTerminal: 'Terminal CIC',
    destination: 'Salvador, BA',
    destinationTerminal: 'Terminal Aratu',
    eta: '28 Mai, 09:30',
    delivery: 'Em 5 dias',
    volume: '32 t',
    vessel: 'Comboio empurrado',
    cargoType: 'Projeto',
  },
  {
    id: 'CRG-7012',
    title: 'Insumos refrigerados',
    subtitle: 'cadeia fria',
    status: 'transito',
    statusLabel: 'Em trânsito',
    origin: 'Belém, PA',
    originTerminal: 'Porto de Belém',
    destination: 'Santarém, PA',
    destinationTerminal: 'Terminal Fluvial de Santarém',
    eta: '2-4 dias',
    delivery: 'Janela confirmada',
    volume: '24 t',
    vessel: 'Balsa refrigerada',
    cargoType: 'Refrigerada',
  },
  {
    id: 'CRG-4510',
    title: 'Grãos de milho',
    subtitle: 'granel sólido · lote 21',
    status: 'cotacao',
    statusLabel: 'Em cotação',
    origin: 'Miritituba, PA',
    originTerminal: 'Porto de Miritituba',
    destination: 'Santarém, PA',
    destinationTerminal: 'Terminal Fluvial de Santarém',
    eta: '4-6 dias',
    delivery: 'Confiança média',
    volume: '28 t',
    vessel: 'Balsa graneleira',
    cargoType: 'Granel sólido',
  },
];

const CARGO_TYPE_MATCHES: Record<Exclude<CargoTypeFilter, 'todos'>, string[]> = {
  'granel-solido': ['granel solido', 'granel sólido'],
  'granel-liquido': ['granel liquido', 'granel líquido'],
  'carga-geral': ['projeto', 'fracionada', 'refrigerada', 'carga geral'],
  conteiner: ['conteiner', 'contêiner'],
};

const VESSEL_TYPE_MATCHES: Record<Exclude<VesselTypeFilter, 'todos'>, string[]> = {
  empurrador: ['empurrador'],
  barcaca: ['balsa', 'barcaça', 'barcaca'],
  comboio: ['comboio', 'convoio'],
  'balsa-graneleira': ['balsa graneleira'],
  'balsa-porta-conteineres': ['balsa porta-conteineres', 'balsa porta-contêineres'],
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

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

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6.5 10.5V20h11v-9.5" />
      <path d="M9.5 20v-5h5v5" />
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

function ContainerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 9h18v11H3z" />
      <path d="M5 9V7h14v2" />
      <path d="M8 9v11M12 9v11M16 9v11" />
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

function RouteBoatIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M5 17.5h21.5l-3.4 5.2H9.1L5 17.5Z" />
      <path d="M9.5 17.5v-5.8H18v5.8M12.5 11.7V7.5h4.8v4.2" />
      <path d="M7.8 24.7c1.7 1 3.3 1 5 0s3.3-1 5 0 3.3 1 5 0" />
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

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2ZM10 21h4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
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

function SunMoonIcon({ theme }: { theme: ThemeMode }) {
  if (theme === 'dark') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15.4A8.4 8.4 0 0 1 8.6 4 7 7 0 1 0 20 15.4Z" />
    </svg>
  );
}

function NavIcon({ type }: { type: 'vision' | 'dashboard' | 'cargo' | 'vessels' | 'profile' }) {
  if (type === 'vision') return <EyeIcon />;
  if (type === 'dashboard') return <DashboardIcon />;
  if (type === 'cargo') return <CubeIcon />;
  if (type === 'vessels') return <BoatIcon />;
  return <UserIcon />;
}

function mapCargoStatusToBadgeStatus(status: CargoStatus): StatusBadgeStatus {
  if (status === 'agendado') return 'scheduled';
  if (status === 'cotacao') return 'quotation';
  if (status === 'atencao') return 'delayed';
  return 'inTransit';
}

function CargoStatusBadge({ cargo, showDot = true, size = 'md' }: { cargo: Cargo; showDot?: boolean; size?: 'sm' | 'md' }) {
  return (
    <StatusBadge
      className={styles.statusBadge}
      status={mapCargoStatusToBadgeStatus(cargo.status)}
      showDot={showDot}
      size={size}
    >
      {cargo.statusLabel}
    </StatusBadge>
  );
}

function matchesStatusFilter(cargo: Cargo, status: StatusFilter) {
  if (status === 'todos') return true;
  if (status === 'spot') return cargo.status === 'cotacao' || cargo.status === 'agendado';
  if (status === 'atracada') return cargo.status === 'agendado';
  if (status === 'concluida') return cargo.statusLabel.toLowerCase().includes('conclu');
  if (status === 'atrasada') return cargo.status === 'atencao' || cargo.delivery.toLowerCase().includes('atras');
  return cargo.status === status;
}

function getCargoWeight(cargo: Cargo) {
  return Number.parseFloat(cargo.volume.replace(',', '.'));
}

function matchesCutoffFilter(cargo: Cargo, cutoff: CutoffFilter) {
  if (cutoff === 'todos') return true;
  const operationalWindow = `${cargo.eta} ${cargo.delivery}`.toLowerCase();

  if (cutoff === 'hoje') return operationalWindow.includes('hoje') || operationalWindow.includes('24h');
  if (cutoff === '2-4-dias') return operationalWindow.includes('2 dias') || operationalWindow.includes('2-4');
  if (cutoff === '5-dias') return operationalWindow.includes('5 dias') || operationalWindow.includes('4-6');
  if (cutoff === 'navegacao-noturna-restrita') return operationalWindow.includes('noturna');
  return operationalWindow.includes('atraca') || operationalWindow.includes('janela');
}

function matchesCapacityFilter(cargo: Cargo, capacity: CapacityFilter) {
  if (capacity === 'todos') return true;
  const weight = getCargoWeight(cargo);

  if (capacity === 'ate-20t') return weight <= 20;
  if (capacity === '20-30t') return weight > 20 && weight <= 30;
  if (capacity === 'acima-30t') return weight > 30;
  if (capacity === 'canal-raso-restricao-sazonal') return cargo.delivery.toLowerCase().includes('sazonal');
  return weight > 30 || cargo.vessel.toLowerCase().includes('comboio');
}

function CargoCard({ cargo, index, onOpen }: { cargo: Cargo; index: number; onOpen: (cargo: Cargo) => void }) {
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    onOpen(cargo);
  }

  return (
    <article
      className={styles.cargoCard}
      style={{ '--card-index': index } as CSSProperties}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(cargo)}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cargoIcon}>
          {cargo.cargoType === 'Projeto' ? <ContainerIcon /> : <CubeIcon />}
        </span>
        <span className={styles.cargoId}>{cargo.id}</span>
        <CargoStatusBadge cargo={cargo} showDot={false} size="sm" />
      </div>

      <h2>{cargo.title}</h2>

      <div className={styles.routeLine}>
        <div className={styles.routeEndpoint}>
          <span className={styles.routeDot} data-tone="origin" aria-hidden="true" />
          <span className={styles.routeCity}>{cargo.origin}</span>
        </div>
        <span className={styles.dashedRoute} aria-hidden="true"><RouteBoatIcon /></span>
        <div className={styles.routeEndpoint}>
          <span className={styles.routeDot} data-tone="destination" aria-hidden="true" />
          <span className={styles.routeCity}>{cargo.destination}</span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div>
          <span>ETA</span>
          <strong>{cargo.eta}</strong>
        </div>
        <span className={styles.cardAction} aria-hidden="true">
          {cargo.status === 'agendado' ? 'Ver detalhes' : 'Acompanhar'} <ChevronIcon />
        </span>
      </div>
    </article>
  );
}

function BottomNav() {
  return (
    <nav className={styles.bottomNav} aria-label="Navegacao principal dev v2">
      <button className={styles.navItem} data-active="false" type="button">
        <span className={styles.navIcon}>
          <NavIcon type="vision" />
        </span>
        <span className={styles.navLabel}>Visão</span>
      </button>
      <button className={styles.navItem} data-active="false" type="button">
        <span className={styles.navIcon}>
          <NavIcon type="dashboard" />
        </span>
        <span className={styles.navLabel}>Dashboard</span>
      </button>
      <button className={`${styles.navItem} ${styles.navItemActive}`} data-active="true" type="button">
        <span className={styles.activeNavBubble}>
          <span className={styles.activeNavIcon}>
            <NavIcon type="cargo" />
          </span>
          <span className={styles.activeNavLabel}>Cargas</span>
        </span>
      </button>
      <button className={styles.navItem} data-active="false" type="button">
        <span className={styles.navIcon}>
          <NavIcon type="vessels" />
        </span>
        <span className={styles.navLabel}>Embarcações</span>
      </button>
      <button className={styles.navItem} data-active="false" type="button">
        <span className={styles.navIcon}>
          <NavIcon type="profile" />
        </span>
        <span className={styles.navLabel}>Perfil</span>
      </button>
    </nav>
  );
}

function LocationPinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v4M17 3v4M4.5 9h15" />
      <path d="M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v16M5 7h14M7 7l-3 6h6L7 7ZM17 7l-3 6h6l-3-6Z" />
      <path d="M9 20h6" />
    </svg>
  );
}

function FiltersSheet({
  status,
  cargoType,
  origin,
  destination,
  vesselType,
  cutoff,
  capacity,
  onStatusChange,
  onCargoTypeChange,
  onOriginChange,
  onDestinationChange,
  onVesselTypeChange,
  onCutoffChange,
  onCapacityChange,
}: {
  status: StatusFilter;
  cargoType: CargoTypeFilter;
  origin: OriginFilter;
  destination: DestinationFilter;
  vesselType: VesselTypeFilter;
  cutoff: CutoffFilter;
  capacity: CapacityFilter;
  onStatusChange: (status: StatusFilter) => void;
  onCargoTypeChange: (cargoType: CargoTypeFilter) => void;
  onOriginChange: (origin: OriginFilter) => void;
  onDestinationChange: (destination: DestinationFilter) => void;
  onVesselTypeChange: (vesselType: VesselTypeFilter) => void;
  onCutoffChange: (cutoff: CutoffFilter) => void;
  onCapacityChange: (capacity: CapacityFilter) => void;
}) {
  return (
    <div className={styles.filterSheetContent}>
      <section className={styles.filterSheetSection}>
        <h3>Status</h3>
        <div className={styles.filterChipGrid}>
          {cargoStatusFilterOptions.map((item) => (
            <FilterChip
              key={item.id}
              className={styles.filterChip}
              isSelected={item.value === status}
              onClick={() => onStatusChange(item.value)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className={styles.filterSheetSection}>
        <h3>
          <LocationPinIcon />
          Origem
        </h3>
        <div className={styles.filterChipGrid} aria-label="Selecionar origem">
          {cargoOriginFilterOptions.map((item) => (
            <FilterChip
              key={item.id}
              className={styles.filterChip}
              isSelected={item.value === origin}
              onClick={() => onOriginChange(item.value)}
              ariaPressed={item.value === origin}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className={styles.filterSheetSection}>
        <h3>
          <LocationPinIcon />
          Destino
        </h3>
        <div className={styles.filterChipGrid} aria-label="Selecionar destino">
          {cargoDestinationFilterOptions.map((item) => (
            <FilterChip
              key={item.id}
              className={styles.filterChip}
              isSelected={item.value === destination}
              onClick={() => onDestinationChange(item.value)}
              ariaPressed={item.value === destination}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className={styles.filterSheetSection}>
        <h3>
          <PackageIcon />
          Tipo de carga
        </h3>
        <div className={styles.filterChipGrid}>
          {cargoTypeFilterOptions.map((item) => (
            <FilterChip
              key={item.id}
              className={styles.filterChip}
              isSelected={item.value === cargoType}
              onClick={() => onCargoTypeChange(item.value)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className={styles.filterSheetSection}>
        <h3>
          <BoatIcon />
          Tipo de embarcação
        </h3>
        <div className={styles.filterChipGrid}>
          {cargoVesselTypeFilterOptions.map((item) => (
            <FilterChip
              key={item.id}
              className={styles.filterChip}
              isSelected={item.value === vesselType}
              onClick={() => onVesselTypeChange(item.value)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className={styles.filterSheetSection}>
        <h3>
          <CalendarIcon />
          Disponibilidade / Data de corte
        </h3>
        <div className={styles.filterChipGrid}>
          {cargoCutoffFilterOptions.map((item) => (
            <FilterChip
              key={item.id}
              className={styles.filterChip}
              isSelected={item.value === cutoff}
              onClick={() => onCutoffChange(item.value)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className={styles.filterSheetSection}>
        <h3>
          <ScaleIcon />
          Capacidade / Peso bruto
        </h3>
        <div className={styles.filterChipGrid}>
          {cargoCapacityFilterOptions.map((item) => (
            <FilterChip
              key={item.id}
              className={styles.filterChip}
              isSelected={item.value === capacity}
              onClick={() => onCapacityChange(item.value)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
      </section>
    </div>
  );
}

function FilterSheetActions({ onReset, onViewCargoes }: { onReset: () => void; onViewCargoes: () => void }) {
  const [pressingAction, setPressingAction] = useState<'reset' | 'view' | null>(null);
  const closeDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeDelayTimeoutRef.current) {
        clearTimeout(closeDelayTimeoutRef.current);
      }
    };
  }, []);

  function scheduleAction(action: 'reset' | 'view') {
    if (closeDelayTimeoutRef.current) {
      clearTimeout(closeDelayTimeoutRef.current);
      closeDelayTimeoutRef.current = null;
    }

    setPressingAction(action);

    closeDelayTimeoutRef.current = setTimeout(() => {
      if (action === 'reset') {
        onReset();
      } else {
        onViewCargoes();
      }
      setPressingAction(null);
      closeDelayTimeoutRef.current = null;
    }, 160);
  }

  return (
    <div className={styles.filterSheetActions}>
      <button
        type="button"
        data-pressing={pressingAction === 'reset' ? 'true' : undefined}
        onPointerDown={() => setPressingAction('reset')}
        onPointerUp={() => setPressingAction(null)}
        onPointerLeave={() => setPressingAction(null)}
        onPointerCancel={() => setPressingAction(null)}
        onClick={() => scheduleAction('reset')}
      >
        Limpar filtros
      </button>
      <button
        type="button"
        data-primary="true"
        data-pressing={pressingAction === 'view' ? 'true' : undefined}
        onPointerDown={() => setPressingAction('view')}
        onPointerUp={() => setPressingAction(null)}
        onPointerLeave={() => setPressingAction(null)}
        onPointerCancel={() => setPressingAction(null)}
        onClick={() => scheduleAction('view')}
      >
        Ver cargas
      </button>
    </div>
  );
}

function CargoSheet({ cargo }: { cargo: Cargo }) {
  const actions = [
    { label: 'Visão geral', description: 'Informações principais da carga', icon: <CubeIcon /> },
    { label: 'Jornada', description: 'Rastreamento e eventos', icon: <BoatIcon /> },
    { label: 'Documentos', description: 'Conhecimentos, notas e certificados', icon: <TagIcon /> },
    { label: 'Custos', description: 'Detalhamento e pagamentos', icon: <BellIcon /> },
  ];

  return (
    <div className={styles.cargoSheetContent}>
      <div className={styles.cargoSheetHeader}>
        <span className={styles.cargoSheetIcon}>
          <CubeIcon />
        </span>
        <div>
          <span className={styles.cargoSheetId}>{cargo.id}</span>
          <CargoStatusBadge cargo={cargo} />
        </div>
      </div>

      <h2 className={styles.cargoSheetTitle}>{cargo.title}</h2>

      <div className={styles.sheetRouteBox}>
        <div>
          <strong>{cargo.origin}</strong>
          <span>{cargo.originTerminal}</span>
        </div>
        <span aria-hidden="true"><BoatIcon /></span>
        <div>
          <strong>{cargo.destination}</strong>
          <span>{cargo.destinationTerminal}</span>
        </div>
      </div>

      <div className={styles.sheetStats}>
        <div>
          <span>ETA</span>
          <strong>{cargo.eta}</strong>
        </div>
        <div>
          <span>Entrega prevista</span>
          <strong data-tone="success">{cargo.delivery}</strong>
        </div>
      </div>

      <div className={styles.sheetActionList}>
        {actions.map((item) => (
          <button key={item.label} type="button">
            <span>{item.icon}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
            <ChevronIcon />
          </button>
        ))}
      </div>

      <button type="button" className={styles.moreCargoActions}>
        Ações da carga <span>•••</span>
      </button>
    </div>
  );
}

export function MobileCargoListLabV2() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('todos');
  const [cargoType, setCargoType] = useState<CargoTypeFilter>('todos');
  const [origin, setOrigin] = useState<OriginFilter>('todos');
  const [destination, setDestination] = useState<DestinationFilter>('todos');
  const [vesselType, setVesselType] = useState<VesselTypeFilter>('todos');
  const [cutoff, setCutoff] = useState<CutoffFilter>('todos');
  const [capacity, setCapacity] = useState<CapacityFilter>('todos');
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);

  const filteredCargoes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return CARGOES.filter((cargo) => {
      const matchesStatus = matchesStatusFilter(cargo, status);
      const normalizedCargoType = cargo.cargoType.trim().toLowerCase();
      const matchesCargoType = cargoType === 'todos' || CARGO_TYPE_MATCHES[cargoType].some((type) => normalizedCargoType === type);
      const normalizedVessel = cargo.vessel.trim().toLowerCase();
      const matchesOrigin = origin === 'todos' || cargo.originTerminal === origin;
      const matchesDestination = destination === 'todos' || cargo.destinationTerminal === destination;
      const matchesVesselType =
        vesselType === 'todos' || VESSEL_TYPE_MATCHES[vesselType].some((type) => normalizedVessel.includes(type));
      const matchesCutoff = matchesCutoffFilter(cargo, cutoff);
      const matchesCapacity = matchesCapacityFilter(cargo, capacity);
      const matchesQuery =
        normalizedQuery.length < 2 ||
        `${cargo.id} ${cargo.title} ${cargo.subtitle} ${cargo.origin} ${cargo.destination} ${cargo.vessel} ${cargo.cargoType}`
          .toLowerCase()
          .includes(normalizedQuery);

      return (
        matchesStatus &&
        matchesCargoType &&
        matchesOrigin &&
        matchesDestination &&
        matchesVesselType &&
        matchesCutoff &&
        matchesCapacity &&
        matchesQuery
      );
    });
  }, [capacity, cargoType, cutoff, destination, origin, query, status, vesselType]);

  const activeFilterCount =
    (status !== 'todos' ? 1 : 0) +
    (cargoType !== 'todos' ? 1 : 0) +
    (origin !== 'todos' ? 1 : 0) +
    (destination !== 'todos' ? 1 : 0) +
    (vesselType !== 'todos' ? 1 : 0) +
    (cutoff !== 'todos' ? 1 : 0) +
    (capacity !== 'todos' ? 1 : 0) +
    (query.trim().length >= 2 ? 1 : 0);
  const cargoForSheet = selectedCargo ?? filteredCargoes[0] ?? CARGOES[0];
  const isSheetOpen = sheetMode !== null;

  function resetFilters() {
    setQuery('');
    setStatus('todos');
    setCargoType('todos');
    setOrigin('todos');
    setDestination('todos');
    setVesselType('todos');
    setCutoff('todos');
    setCapacity('todos');
  }

  function clearFiltersAndClose() {
    resetFilters();
    closeSheet();
  }

  function openCargoSheet(cargo: Cargo) {
    setSelectedCargo(cargo);
    setSheetMode('cargo');
  }

  function closeSheet() {
    setSheetMode(null);
  }

  return (
    <main className={styles.root} data-theme={theme}>
      <section className={styles.phoneShell} aria-label="Experiencia visual dev v2 da lista de cargas">
        <header className={styles.header}>
          <div>
            <h1>Cargas</h1>
            <p>{filteredCargoes.length} de {CARGOES.length} cargas</p>
          </div>
          <div className={styles.headerActions}>
            <IconButton
              className={styles.headerButton}
              variant="default"
              ariaLabel="Abrir filtros"
              icon={<FilterIcon />}
              badgeCount={activeFilterCount > 0 ? activeFilterCount : undefined}
              onClick={() => setSheetMode('filters')}
            />
            <IconButton
              className={styles.headerButton}
              variant="theme"
              ariaLabel="Alternar modo claro e escuro"
              icon={<SunMoonIcon theme={theme} />}
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            />
          </div>
        </header>

        <div className={styles.searchRow}>
          <label className={styles.searchField}>
            <SearchIcon />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cargas..." />
          </label>
          <IconButton
            className={styles.filterSquare}
            variant="filter"
            ariaLabel="Visualizar filtros"
            icon={<FilterIcon />}
            onClick={() => setSheetMode('filters')}
          />
        </div>

        <section className={styles.cargoList} aria-label="Lista de cargas dev v2">
          {filteredCargoes.map((cargo, index) => (
            <CargoCard key={cargo.id} cargo={cargo} index={index} onOpen={openCargoSheet} />
          ))}
        </section>

        {!isSheetOpen ? <BottomNav /> : null}

        <BottomSheet
          open={sheetMode === 'filters'}
          onOpenChange={(open) => {
            if (!open) closeSheet();
          }}
          title="Filtros"
          closeAriaLabel="Fechar filtros"
          dragHandleAriaLabel="Expandir ou recolher filtros"
          snapHeights={{
            collapsed: '40dvh',
            expanded: '98dvh',
          }}
          snapOrder={['collapsed', 'expanded']}
          initialSnap="collapsed"
          viewportAnchor="flush"
          enableDrag
          closeOnOverlayClick
          variant="strong"
          overlayVariant="strong"
          className={styles.filterBottomSheet}
          bodyClassName={styles.filterBottomSheetBody}
          footer={<FilterSheetActions onReset={clearFiltersAndClose} onViewCargoes={closeSheet} />}
        >
          <FiltersSheet
            status={status}
            cargoType={cargoType}
            origin={origin}
            destination={destination}
            vesselType={vesselType}
            cutoff={cutoff}
            capacity={capacity}
            onStatusChange={setStatus}
            onCargoTypeChange={setCargoType}
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
            onVesselTypeChange={setVesselType}
            onCutoffChange={setCutoff}
            onCapacityChange={setCapacity}
          />
        </BottomSheet>

        <BottomSheet
          open={sheetMode === 'cargo'}
          onOpenChange={(open) => {
            if (!open) closeSheet();
          }}
          title={cargoForSheet.title}
          closeAriaLabel="Fechar detalhes"
          dragHandleAriaLabel="Expandir ou recolher detalhes da carga"
          snapHeights={{
            expanded: '90dvh',
          }}
          snapOrder={['expanded']}
          initialSnap="expanded"
          viewportAnchor="flush"
          enableDrag
          closeOnOverlayClick
          variant="strong"
          overlayVariant="strong"
          className={styles.cargoBottomSheet}
          bodyClassName={styles.cargoBottomSheetBody}
        >
          <CargoSheet cargo={cargoForSheet} />
        </BottomSheet>
      </section>
    </main>
  );
}
