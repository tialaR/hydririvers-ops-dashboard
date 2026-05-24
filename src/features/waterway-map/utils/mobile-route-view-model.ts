import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import type { CargoWaterwayTrackingCompat } from '@/features/waterway-tracking/waterway-compat';

import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';
import { resolveCargoOperationalWaterwayContext } from '../data/resolve-cargo-operational-waterway-context';
import { hydrowayOperationalDatasetMock } from '../mocks/hydroway-operational-layers.mock';

export type MobileSyncStatus = 'online' | 'offline' | 'syncing' | 'pending';

export type MobileSyncDetailKey =
  | 'mobileSyncOnlineDetail'
  | 'mobileSyncSyncingDetail'
  | 'mobileSyncPendingDetail'
  | 'mobileSyncOfflineDetail';

export type MobileRouteTimelineStepState = 'done' | 'current' | 'upcoming';

export type MobileRouteTimelineStep = {
  id: string;
  labelKey: string;
  state: MobileRouteTimelineStepState;
};

export type MobileRouteDockViewModel = {
  cargoId: string;
  cargoStatus: CargoStatus;
  originLabel: string;
  destinationLabel: string;
  currentSegmentLabel: string;
  etaLabel?: string;
  progressPercent: number;
  syncStatus: MobileSyncStatus;
};

export type MobileRouteSheetViewModel = MobileRouteDockViewModel & {
  routeName: string;
  vesselName?: string;
  syncDetailKey: MobileSyncDetailKey;
  nextSegmentLabel: string;
  nextSegmentDetail?: string;
  alertSummary?: string;
  timelineSteps: MobileRouteTimelineStep[];
};

export function resolveMobileSyncStatus(
  cargo: Cargo,
  tracking?: CargoWaterwayTrackingCompat | null,
): MobileSyncStatus {
  if (cargo.connectivity === 'online') return 'online';
  if (cargo.connectivity === 'delayedSync') return 'syncing';
  if (cargo.connectivity === 'lowSignal') return 'offline';

  if (tracking && typeof tracking.signalPercent === 'number') {
    if (tracking.signalPercent >= 85) return 'online';
    if (tracking.signalPercent >= 55) return 'syncing';
    if (tracking.signalPercent >= 30) return 'pending';
    return 'offline';
  }

  switch (cargo.status) {
    case 'boarded':
    case 'delivered':
      return 'online';
    case 'bidding':
      return 'syncing';
    case 'contracting':
    case 'reserved':
      return 'pending';
    default:
      return 'offline';
  }
}

export function resolveMobileSyncDetailKey(status: MobileSyncStatus): MobileSyncDetailKey {
  switch (status) {
    case 'online':
      return 'mobileSyncOnlineDetail';
    case 'syncing':
      return 'mobileSyncSyncingDetail';
    case 'pending':
      return 'mobileSyncPendingDetail';
    default:
      return 'mobileSyncOfflineDetail';
  }
}

function buildTimelineSteps(progressPercent: number): MobileRouteTimelineStep[] {
  const progress = Math.max(0, Math.min(100, progressPercent));

  const resolveState = (start: number, end: number): MobileRouteTimelineStepState => {
    if (progress >= end) return 'done';
    if (progress >= start) return 'current';
    return 'upcoming';
  };

  return [
    {
      id: 'origin',
      labelKey: 'mobileRouteTimelineOrigin',
      state: resolveState(0, 20),
    },
    {
      id: 'corridor',
      labelKey: 'mobileRouteTimelineMidCorridor',
      state: resolveState(20, 55),
    },
    {
      id: 'approach',
      labelKey: 'mobileRouteTimelineApproach',
      state: resolveState(55, 85),
    },
    {
      id: 'destination',
      labelKey: 'mobileRouteTimelineDestination',
      state: resolveState(85, 100),
    },
  ];
}

function resolveNextSegment(
  cargoId: string,
  model: HydrowayMapModel,
): { label: string; detail?: string } {
  const operationalContext = resolveCargoOperationalWaterwayContext(cargoId);
  if (operationalContext?.nextTerminalId) {
    const terminal = hydrowayOperationalDatasetMock.terminals.find(
      (entry) => entry.id === operationalContext.nextTerminalId,
    );
    return {
      label: terminal?.name ?? operationalContext.nextTerminalId,
      detail: operationalContext.businessSummary,
    };
  }

  const label =
    model.metadata.segmentId ||
    model.metadata.operationalStatus ||
    model.metadata.routeName;

  return {
    label,
    detail: model.metadata.operationalStatus,
  };
}

export function buildMobileRouteDockViewModel(
  cargo: Cargo,
  model: HydrowayMapModel,
  progressPercent: number,
  tracking?: CargoWaterwayTrackingCompat | null,
): MobileRouteDockViewModel {
  const originLabel = model.metadata.originLabel || cargo.origin;
  const destinationLabel = model.metadata.destinationLabel || cargo.destination;
  const currentSegmentLabel =
    model.metadata.operationalStatus ||
    model.metadata.segmentId ||
    model.metadata.routeName;

  return {
    cargoId: cargo.id,
    cargoStatus: cargo.status,
    originLabel,
    destinationLabel,
    currentSegmentLabel,
    etaLabel: model.metadata.eta ?? tracking?.eta,
    progressPercent,
    syncStatus: resolveMobileSyncStatus(cargo, tracking),
  };
}

export function buildMobileRouteSheetViewModel(
  cargo: Cargo,
  model: HydrowayMapModel,
  progressPercent: number,
  tracking?: CargoWaterwayTrackingCompat | null,
): MobileRouteSheetViewModel {
  const dock = buildMobileRouteDockViewModel(cargo, model, progressPercent, tracking);
  const nextSegment = resolveNextSegment(cargo.id, model);

  return {
    ...dock,
    routeName: model.metadata.routeName,
    vesselName: model.metadata.vesselName ?? tracking?.vesselName,
    syncDetailKey: resolveMobileSyncDetailKey(dock.syncStatus),
    nextSegmentLabel: nextSegment.label,
    nextSegmentDetail: nextSegment.detail,
    alertSummary: tracking?.constraints[0]?.title,
    timelineSteps: buildTimelineSteps(progressPercent),
  };
}
