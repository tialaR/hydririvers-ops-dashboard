'use client';

import { useEffect, useRef, useState } from 'react';

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
    }, 160);
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
      <section className={styles.section}>
        <h3>Status</h3>
        <div className={styles.chipGrid}>
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

      <section className={styles.section}>
        <h3>
          <LocationPinIcon />
          Origem
        </h3>
        <div className={styles.chipGrid} aria-label="Selecionar origem">
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

      <section className={styles.section}>
        <h3>
          <LocationPinIcon />
          Destino
        </h3>
        <div className={styles.chipGrid} aria-label="Selecionar destino">
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

      <section className={styles.section}>
        <h3>
          <PackageIcon />
          Tipo de carga
        </h3>
        <div className={styles.chipGrid}>
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

      <section className={styles.section}>
        <h3>
          <BoatIcon />
          Tipo de embarcação
        </h3>
        <div className={styles.chipGrid}>
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

      <section className={styles.section}>
        <h3>
          <CalendarIcon />
          Disponibilidade / Data de corte
        </h3>
        <div className={styles.chipGrid}>
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

      <section className={styles.section}>
        <h3>
          <ScaleIcon />
          Capacidade / Peso bruto
        </h3>
        <div className={styles.chipGrid}>
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
