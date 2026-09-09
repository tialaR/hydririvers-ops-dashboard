import type {
  CargoLifecycleStatus,
  WaterwayOperationalStatus,
} from '../domain/waterway-tracking.types';

const CARGO_STATUS_PROGRESS_FALLBACK: Record<CargoLifecycleStatus, number> = {
  open: 12,
  bidding: 24,
  contracting: 36,
  reserved: 48,
  boarded: 72,
  delivered: 100,
};

const CARGO_STATUS_OPERATIONAL_STATUS: Record<CargoLifecycleStatus, WaterwayOperationalStatus> = {
  open: 'attention',
  bidding: 'attention',
  contracting: 'attention',
  reserved: 'on-time',
  boarded: 'on-time',
  delivered: 'on-time',
};

export function clampWaterwayPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getRemainingWaterwayPercent(progressPercent: number): number {
  return clampWaterwayPercent(100 - progressPercent);
}

export function getDefaultProgressForCargoStatus(status: CargoLifecycleStatus): number {
  return CARGO_STATUS_PROGRESS_FALLBACK[status];
}

export function getDefaultOperationalStatusForCargoStatus(
  status: CargoLifecycleStatus,
): WaterwayOperationalStatus {
  return CARGO_STATUS_OPERATIONAL_STATUS[status];
}
