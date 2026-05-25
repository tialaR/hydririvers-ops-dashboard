import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import type { CargoWaterwayTrackingCompat } from '@/features/waterway-tracking/waterway-compat';

import type {
  HydrowayMapMetadata,
  HydrowayMapMobileRouteSegmentStatus,
  HydrowayMapModel,
} from '../domain/hydroway-map-model.types';
import {
  parseNextSegmentOperationalBrief,
  type NextSegmentOperationalBrief,
} from './parse-next-segment-operational-brief';

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

export type MobileRouteNextSegmentStatusKey =
  | 'mobileRouteNextStatusOnTime'
  | 'mobileRouteNextStatusAttention'
  | 'mobileRouteNextStatusDelayed';

export type MobileRouteSheetViewModel = MobileRouteDockViewModel & {
  routeName: string;
  routeTechnicalRef: string;
  vesselName?: string;
  syncDetailKey: MobileSyncDetailKey;
  nextSegmentLabel: string;
  nextSegmentDetail?: string;
  nextSegmentBrief?: NextSegmentOperationalBrief;
  nextSegmentStatusKey: MobileRouteNextSegmentStatusKey;
  alertSummary?: string;
  timelineSteps: MobileRouteTimelineStep[];
};

const NEXT_SEGMENT_STATUS_KEYS: Record<
  HydrowayMapMobileRouteSegmentStatus,
  MobileRouteNextSegmentStatusKey
> = {
  onTime: 'mobileRouteNextStatusOnTime',
  attention: 'mobileRouteNextStatusAttention',
  delayed: 'mobileRouteNextStatusDelayed',
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

function mapTrackingOperationalStatus(
  status: CargoWaterwayTrackingCompat['operationalStatus'] | undefined,
): HydrowayMapMobileRouteSegmentStatus | undefined {
  if (status === 'attention') return 'attention';
  if (status === 'delayed') return 'delayed';
  if (status === 'on-time') return 'onTime';
  return undefined;
}

export function resolveNextSegmentStatusKey(
  metadata: HydrowayMapMetadata,
  tracking?: CargoWaterwayTrackingCompat | null,
): MobileRouteNextSegmentStatusKey {
  const segmentStatus =
    metadata.nextSegmentStatus ?? mapTrackingOperationalStatus(tracking?.operationalStatus);

  if (segmentStatus) {
    return NEXT_SEGMENT_STATUS_KEYS[segmentStatus];
  }

  return 'mobileRouteNextStatusOnTime';
}

function resolveNextSegment(metadata: HydrowayMapMetadata): { label: string; detail?: string } {
  if (metadata.nextSegmentLabel) {
    return {
      label: metadata.nextSegmentLabel,
      detail: metadata.nextSegmentDetail,
    };
  }

  const label =
    metadata.segmentId || metadata.operationalStatus || metadata.routeName;

  return {
    label,
    detail: metadata.operationalStatus,
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
  const nextSegment = resolveNextSegment(model.metadata);

  return {
    ...dock,
    routeName: model.metadata.routeName,
    routeTechnicalRef: model.metadata.routeTechnicalRef,
    vesselName: model.metadata.vesselName ?? tracking?.vesselName,
    syncDetailKey: resolveMobileSyncDetailKey(dock.syncStatus),
    nextSegmentLabel: nextSegment.label,
    nextSegmentDetail: nextSegment.detail,
    nextSegmentBrief: parseNextSegmentOperationalBrief(nextSegment.detail),
    nextSegmentStatusKey: resolveNextSegmentStatusKey(model.metadata, tracking),
    alertSummary: tracking?.constraints[0]?.title,
    timelineSteps: buildTimelineSteps(progressPercent),
  };
}
