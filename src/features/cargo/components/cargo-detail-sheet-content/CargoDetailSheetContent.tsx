'use client';

import { CargoLabV2StatusBadge } from '@/features/cargo/components/cargo-lab-v2/cargo-lab-v2-status-badge';
import {
  BellIcon,
  BoatIcon,
  ChevronIcon,
  CubeIcon,
  TagIcon,
} from '@/features/cargo/components/cargo-lab-v2/cargo-lab-v2-icons';
import { CargoEtaBlock } from '@/features/cargo/components/cargo-eta-block';
import { CargoRouteLine } from '@/features/cargo/components/cargo-route-line';
import type { CargoLabV2 } from '@/features/cargo/types/cargo-lab-v2.types';

import styles from './CargoDetailSheetContent.module.scss';

const DEFAULT_SECTIONS = [
  { id: 'overview', label: 'Visão geral', description: 'Informações principais da carga', icon: <CubeIcon /> },
  { id: 'journey', label: 'Jornada', description: 'Rastreamento e eventos', icon: <BoatIcon /> },
  { id: 'documents', label: 'Documentos', description: 'Conhecimentos, notas e certificados', icon: <TagIcon /> },
  { id: 'costs', label: 'Custos', description: 'Detalhamento e pagamentos', icon: <BellIcon /> },
] as const;

export type CargoDetailSectionId = (typeof DEFAULT_SECTIONS)[number]['id'];

export type CargoDetailSheetContentProps = {
  cargo: CargoLabV2;
  selectedSection?: CargoDetailSectionId;
  onSelectSection?: (sectionId: CargoDetailSectionId) => void;
  onAction?: () => void;
  className?: string;
};

export function CargoDetailSheetContent({
  cargo,
  selectedSection,
  onSelectSection,
  onAction,
  className,
}: CargoDetailSheetContentProps) {
  return (
    <div className={[styles.content, className].filter(Boolean).join(' ')}>
      <div className={styles.header}>
        <span className={styles.icon}>
          <CubeIcon />
        </span>
        <div>
          <span className={styles.cargoId}>{cargo.id}</span>
          <CargoLabV2StatusBadge cargo={cargo} variant="sheet" />
        </div>
      </div>

      <h2 className={styles.title}>{cargo.title}</h2>

      <CargoRouteLine
        variant="sheet"
        originLabel={cargo.origin}
        destinationLabel={cargo.destination}
        originMeta={cargo.originTerminal}
        destinationMeta={cargo.destinationTerminal}
      />

      <CargoEtaBlock
        variant="sheet"
        metrics={[
          { label: 'ETA', value: cargo.eta },
          { label: 'Entrega prevista', value: cargo.delivery, tone: 'success' },
        ]}
      />

      <div className={styles.actionList}>
        {DEFAULT_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selectedSection === item.id}
            onClick={() => onSelectSection?.(item.id)}
          >
            <span>{item.icon}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
            <ChevronIcon />
          </button>
        ))}
      </div>

      <button type="button" className={styles.moreActions} onClick={onAction}>
        Ações da carga <span>•••</span>
      </button>
    </div>
  );
}
