'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import {
  BoatIcon,
  CalendarIcon,
  LocationPinIcon,
  PackageIcon,
  ScaleIcon,
} from '@/features/cargo/components/cargo-lab-v2/cargo-lab-v2-icons';
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
import { Button } from '@/shared/components/button';
import { FilterChip } from '@/shared/components/filter-chip';

import styles from './CargoFilterSheetContent.module.scss';

const FILTER_ACTION_DELAY_MS = 160;

export type CargoFilterSheetContentProps = {
  status: CargoStatusFilterValue;
  cargoType: CargoTypeFilterValue;
  origin: CargoOriginFilterValue;
  destination: CargoDestinationFilterValue;
  vesselType: CargoVesselTypeFilterValue;
  cutoff: CargoCutoffFilterValue;
  capacity: CargoCapacityFilterValue;
  onStatusChange: (status: CargoStatusFilterValue) => void;
  onCargoTypeChange: (cargoType: CargoTypeFilterValue) => void;
  onOriginChange: (origin: CargoOriginFilterValue) => void;
  onDestinationChange: (destination: CargoDestinationFilterValue) => void;
  onVesselTypeChange: (vesselType: CargoVesselTypeFilterValue) => void;
  onCutoffChange: (cutoff: CargoCutoffFilterValue) => void;
  onCapacityChange: (capacity: CargoCapacityFilterValue) => void;
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
  className?: string;
  showFooter?: boolean;
};

export function CargoFilterSheetFooter({
  onReset,
  onViewCargoes,
}: {
  onReset: () => void;
  onViewCargoes: () => void;
}) {
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
    }, FILTER_ACTION_DELAY_MS);
  }

  return (
    <div className={styles.actions}>
      <Button
        variant="secondary"
        data-pressing={pressingAction === 'reset' ? 'true' : undefined}
        onPointerDown={() => setPressingAction('reset')}
        onPointerUp={() => setPressingAction(null)}
        onPointerLeave={() => setPressingAction(null)}
        onPointerCancel={() => setPressingAction(null)}
        onClick={() => scheduleAction('reset')}
      >
        Limpar filtros
      </Button>
      <Button
        variant="primary"
        data-pressing={pressingAction === 'view' ? 'true' : undefined}
        onPointerDown={() => setPressingAction('view')}
        onPointerUp={() => setPressingAction(null)}
        onPointerLeave={() => setPressingAction(null)}
        onPointerCancel={() => setPressingAction(null)}
        onClick={() => scheduleAction('view')}
      >
        Ver cargas
      </Button>
    </div>
  );
}

type FilterSectionProps<TValue extends string> = {
  title: string;
  icon?: ReactNode;
  options: readonly { id: string; label: string; value: TValue }[];
  selectedValue: TValue;
  onChange: (value: TValue) => void;
};

function FilterSection<TValue extends string>({
  title,
  icon,
  options,
  selectedValue,
  onChange,
}: FilterSectionProps<TValue>) {
  const titleId = useId();

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h3 id={titleId}>
        {icon}
        {title}
      </h3>
      <div className={styles.chipGrid} role="group" aria-labelledby={titleId}>
        {options.map((item) => {
          const isSelected = item.value === selectedValue;

          return (
            <FilterChip
              key={item.id}
              className={styles.filterChip}
              isSelected={isSelected}
              ariaPressed={isSelected}
              onClick={() => onChange(item.value)}
            >
              {item.label}
            </FilterChip>
          );
        })}
      </div>
    </section>
  );
}

export function CargoFilterSheetContent({
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
  className,
}: CargoFilterSheetContentProps) {
  return (
    <div className={[styles.content, className].filter(Boolean).join(' ')}>
      <FilterSection title="Status" options={cargoStatusFilterOptions} selectedValue={status} onChange={onStatusChange} />
      <FilterSection title="Origem" icon={<LocationPinIcon />} options={cargoOriginFilterOptions} selectedValue={origin} onChange={onOriginChange} />
      <FilterSection title="Destino" icon={<LocationPinIcon />} options={cargoDestinationFilterOptions} selectedValue={destination} onChange={onDestinationChange} />
      <FilterSection title="Tipo de carga" icon={<PackageIcon />} options={cargoTypeFilterOptions} selectedValue={cargoType} onChange={onCargoTypeChange} />
      <FilterSection title="Tipo de embarcação" icon={<BoatIcon />} options={cargoVesselTypeFilterOptions} selectedValue={vesselType} onChange={onVesselTypeChange} />
      <FilterSection title="Disponibilidade / Data de corte" icon={<CalendarIcon />} options={cargoCutoffFilterOptions} selectedValue={cutoff} onChange={onCutoffChange} />
      <FilterSection title="Capacidade / Peso bruto" icon={<ScaleIcon />} options={cargoCapacityFilterOptions} selectedValue={capacity} onChange={onCapacityChange} />
    </div>
  );
}
