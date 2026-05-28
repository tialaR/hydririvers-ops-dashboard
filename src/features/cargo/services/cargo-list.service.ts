import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { StatusBadgeTone } from '@/shared/design-system/components/status-badge';

import type {
  MobileCargoListFilters,
  MobileCargoListItem,
  MobileCargoListViewModel,
} from '../domain/cargo-list.types';
import type { CargoListRepository } from '../repositories/cargo-list.repository';
import { mockCargoListRepository } from '../repositories/mock-cargo-list.repository';

const MAX_TITLE_LENGTH = 56;
const MAX_OPERATION_LENGTH = 40;
const MAX_ALERT_LENGTH = 72;

const LAB_UI_MARKER_PATTERN = /\s*\((mock|dev|fixture)\)\s*/gi;

/** Evita prefixo duplicado quando o mock já traz "ETA …". */
export function normalizeMobileCargoEtaLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const withoutDuplicatePrefix = trimmed.replace(/^ETA\s+ETA\s+/i, 'ETA ');
  if (/^eta\b/i.test(withoutDuplicatePrefix)) {
    return withoutDuplicatePrefix;
  }

  return `ETA ${withoutDuplicatePrefix}`;
}

/** Remove marcadores técnicos de fixtures sem alterar IDs ou mocks de origem. */
export function sanitizeMobileCargoLabDisplayText(value: string): string {
  return value.replace(LAB_UI_MARKER_PATTERN, ' ').replace(/\s{2,}/g, ' ').trim();
}

function truncate(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function mapStatusToBadgeTone(status: Cargo['status']): StatusBadgeTone {
  switch (status) {
    case 'delivered':
      return 'neutral';
    case 'boarded':
      return 'success';
    case 'reserved':
    case 'contracting':
      return 'warning';
    case 'bidding':
    case 'open':
      return 'info';
    default:
      return 'neutral';
  }
}

function resolveEtaLabel(cargo: Cargo): string {
  const raw = cargo.etaConfidence?.trim() ? cargo.etaConfidence : cargo.window;
  return truncate(normalizeMobileCargoEtaLabel(raw), 48);
}

function resolveOperationLabel(cargo: Cargo): string | undefined {
  const candidate = cargo.corridor ?? cargo.riverRoute ?? cargo.cargoType;
  if (!candidate?.trim()) {
    return undefined;
  }
  return truncate(candidate, MAX_OPERATION_LENGTH);
}

function resolveAlertLabel(cargo: Cargo): string | undefined {
  const risk = cargo.operationalRisks?.find((item) => item.trim().length > 0);
  if (risk) {
    return truncate(risk, MAX_ALERT_LENGTH);
  }

  const pendingDocument = cargo.requiredDocuments?.find(
    (document) => document.status === 'required' || document.status === 'conditional',
  );

  if (pendingDocument?.name) {
    return truncate(pendingDocument.name, MAX_ALERT_LENGTH);
  }

  if (cargo.predictability === 'seasonal') {
    return undefined;
  }

  return undefined;
}

function cargoNeedsAttention(cargo: Cargo): boolean {
  if (cargo.operationalRisks?.length) {
    return true;
  }

  if (cargo.requiredDocuments?.some((document) => document.status === 'required')) {
    return true;
  }

  return cargo.status === 'contracting' || cargo.status === 'reserved';
}

export function mapCargoToMobileListItem(cargo: Cargo): MobileCargoListItem {
  const alertLabel = resolveAlertLabel(cargo);

  return {
    id: cargo.id,
    displayId: cargo.id.toUpperCase(),
    title: truncate(sanitizeMobileCargoLabDisplayText(cargo.title), MAX_TITLE_LENGTH),
    origin: truncate(cargo.origin, 32),
    destination: truncate(cargo.destination, 32),
    status: cargo.status,
    statusBadgeTone: mapStatusToBadgeTone(cargo.status),
    etaLabel: resolveEtaLabel(cargo),
    operationLabel: resolveOperationLabel(cargo),
    alertLabel,
    needsAttention: cargoNeedsAttention(cargo) || Boolean(alertLabel),
  };
}

export class CargoListService {
  constructor(private readonly repository: CargoListRepository) {}

  async listMobileCargoes(): Promise<MobileCargoListItem[]> {
    const cargoes = await this.repository.listMobileCargoes();
    return cargoes.map(mapCargoToMobileListItem);
  }

  async getCargoListFilters(): Promise<MobileCargoListFilters> {
    return this.repository.getCargoListFilters();
  }

  async getCargoById(id: string): Promise<MobileCargoListItem | undefined> {
    const cargo = await this.repository.getCargoById(id);
    return cargo ? mapCargoToMobileListItem(cargo) : undefined;
  }

  async getMobileCargoListViewModel(): Promise<MobileCargoListViewModel> {
    const [items, filters] = await Promise.all([
      this.listMobileCargoes(),
      this.getCargoListFilters(),
    ]);

    return {
      items,
      filters,
      totalCount: items.length,
    };
  }
}

export const cargoListService = new CargoListService(mockCargoListRepository);
