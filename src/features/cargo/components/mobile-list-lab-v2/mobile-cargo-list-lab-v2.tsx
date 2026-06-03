'use client';

import { useMemo, useState } from 'react';

import { CargoCard } from '@/features/cargo/components/cargo-card';
import { CargoDetailSheetContent } from '@/features/cargo/components/cargo-detail-sheet-content';
import {
  CargoFilterSheetContent,
  CargoFilterSheetFooter,
} from '@/features/cargo/components/cargo-filter-sheet-content';
import { CARGO_LAB_V2_MOCKS } from '@/features/cargo/data/cargo-lab-v2.mock';
import {
  type CargoCapacityFilterValue,
  type CargoCutoffFilterValue,
  type CargoDestinationFilterValue,
  type CargoOriginFilterValue,
  type CargoStatusFilterValue,
  type CargoTypeFilterValue,
  type CargoVesselTypeFilterValue,
} from '@/features/cargo/mocks/cargo-filter-options.mock';
import type { CargoLabV2 } from '@/features/cargo/types/cargo-lab-v2.types';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import { BottomNav } from '@/shared/components/bottom-nav';
import { IconButton } from '@/shared/components/icon-button';
import { SearchField } from '@/shared/components/search-field';

import styles from './mobile-cargo-list-lab-v2.module.scss';

type ThemeMode = 'dark' | 'light';
type SheetMode = 'filters' | 'cargo' | null;
type StatusFilter = CargoStatusFilterValue;
type CargoTypeFilter = CargoTypeFilterValue;
type VesselTypeFilter = CargoVesselTypeFilterValue;
type CutoffFilter = CargoCutoffFilterValue;
type CapacityFilter = CargoCapacityFilterValue;
type OriginFilter = CargoOriginFilterValue;
type DestinationFilter = CargoDestinationFilterValue;

const CARGOES = CARGO_LAB_V2_MOCKS;

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

function BoatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 17h14l-2 3H7l-2-3Z" />
      <path d="M7 17V9h10v8M10 9V5h4v4" />
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

function matchesStatusFilter(cargo: CargoLabV2, status: StatusFilter) {
  if (status === 'todos') return true;
  if (status === 'spot') return cargo.status === 'cotacao' || cargo.status === 'agendado';
  if (status === 'atracada') return cargo.status === 'agendado';
  if (status === 'concluida') return cargo.statusLabel.toLowerCase().includes('conclu');
  if (status === 'atrasada') return cargo.status === 'atencao' || cargo.delivery.toLowerCase().includes('atras');
  return cargo.status === status;
}

function getCargoWeight(cargo: CargoLabV2) {
  return Number.parseFloat(cargo.volume.replace(',', '.'));
}

function matchesCutoffFilter(cargo: CargoLabV2, cutoff: CutoffFilter) {
  if (cutoff === 'todos') return true;
  const operationalWindow = `${cargo.eta} ${cargo.delivery}`.toLowerCase();

  if (cutoff === 'hoje') return operationalWindow.includes('hoje') || operationalWindow.includes('24h');
  if (cutoff === '2-4-dias') return operationalWindow.includes('2 dias') || operationalWindow.includes('2-4');
  if (cutoff === '5-dias') return operationalWindow.includes('5 dias') || operationalWindow.includes('4-6');
  if (cutoff === 'navegacao-noturna-restrita') return operationalWindow.includes('noturna');
  return operationalWindow.includes('atraca') || operationalWindow.includes('janela');
}

function matchesCapacityFilter(cargo: CargoLabV2, capacity: CapacityFilter) {
  if (capacity === 'todos') return true;
  const weight = getCargoWeight(cargo);

  if (capacity === 'ate-20t') return weight <= 20;
  if (capacity === '20-30t') return weight > 20 && weight <= 30;
  if (capacity === 'acima-30t') return weight > 30;
  if (capacity === 'canal-raso-restricao-sazonal') return cargo.delivery.toLowerCase().includes('sazonal');
  return weight > 30 || cargo.vessel.toLowerCase().includes('comboio');
}

const DEV_V2_BOTTOM_NAV_ITEMS = [
  { id: 'vision', label: 'Visão', icon: <NavIcon type="vision" /> },
  { id: 'dashboard', label: 'Dashboard', icon: <NavIcon type="dashboard" /> },
  { id: 'cargo', label: 'Cargas', icon: <NavIcon type="cargo" /> },
  { id: 'vessels', label: 'Embarcações', icon: <NavIcon type="vessels" /> },
  { id: 'profile', label: 'Perfil', icon: <NavIcon type="profile" /> },
] as const;

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
  const [selectedCargo, setSelectedCargo] = useState<CargoLabV2 | null>(null);

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

  function openCargoSheet(cargo: CargoLabV2) {
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
            <p>
              {filteredCargoes.length} de {CARGOES.length} cargas
            </p>
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
          <SearchField
            className={styles.searchField}
            value={query}
            onChange={setQuery}
            placeholder="Buscar cargas..."
            ariaLabel="Buscar cargas"
            icon={<SearchIcon />}
          />
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
            <CargoCard key={cargo.id} cargo={cargo} index={index} onClick={openCargoSheet} />
          ))}
        </section>

        {!isSheetOpen ? (
          <BottomNav
            className={styles.bottomNav}
            ariaLabel="Navegacao principal dev v2"
            items={[...DEV_V2_BOTTOM_NAV_ITEMS]}
            activeId="cargo"
            classNames={{
              item: styles.navItem,
              itemActive: styles.navItemActive,
              icon: styles.navIcon,
              label: styles.navLabel,
              activeBubble: styles.activeNavBubble,
              activeIcon: styles.activeNavIcon,
              activeLabel: styles.activeNavLabel,
            }}
          />
        ) : null}

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
          footer={<CargoFilterSheetFooter onReset={clearFiltersAndClose} onViewCargoes={closeSheet} />}
        >
          <CargoFilterSheetContent
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
          <CargoDetailSheetContent cargo={cargoForSheet} />
        </BottomSheet>
      </section>
    </main>
  );
}
