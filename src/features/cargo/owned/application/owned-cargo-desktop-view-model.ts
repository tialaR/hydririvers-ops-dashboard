import type {
  CargoCorridorId,
  OwnedCargo,
  OwnedCargoFreshnessState,
  OwnedCargoRiskLevel,
  OwnedCargoStatus,
} from '@/features/cargo/owned/domain/owned-cargo-types';
import { getShipperMapRouteForCargo } from '@/features/waterway-map/domain/owned-cargo-operation-route';

export type OwnedCargoDesktopCopy = {
  status: Record<OwnedCargoStatus, string>;
  corridor: Record<CargoCorridorId, string>;
  risk: Record<OwnedCargoRiskLevel, string>;
  freshness: Record<OwnedCargoFreshnessState, string>;
  cargoLabel: string;
  vesselLabel: string;
  corridorLabel: string;
  attentionEyebrow: string;
  attentionTitle: string;
  attentionBody: string;
  attentionAction: string;
  fitRoute: string;
  liveSignal: string;
  normalRiver: string;
  docs: (count: number) => string;
  eta: (hours: number) => string;
  updated: (minutes: number) => string;
};

export type OwnedCargoDesktopFacts = {
  codeLabel?: string;
  statusLabel?: string;
  originRegion?: string;
  originCity?: string;
  destinationRegion?: string;
  destinationCity?: string;
  cargoType?: string;
  totalWeight?: string;
  vessel?: string;
  carrier?: string;
  carrierReference?: string;
  carrierRole?: string;
  progressLabel?: string;
  signal?: string;
  signalDetail?: string;
  river?: string;
  riverDetail?: string;
  nextMilestone?: string;
  nextMilestoneTime?: string;
  cardEta?: string;
  cardEtaDay?: string;
  attentionEyebrow?: string;
  attentionTitle?: string;
  attentionBody?: string;
  attentionDocument?: string;
  attentionDeadline?: string;
  attentionAction?: string;
  mapOperation?: string;
  mapRisk?: string;
  mapSignal?: string;
  mapSignalDetail?: string;
  mapRiver?: string;
  mapRiverDetail?: string;
  mapFitRoute?: string;
};

export type OwnedCargoDesktopViewModel = {
  cargo: OwnedCargo;
  codeLabel: string;
  statusLabel: string;
  originRegion: string;
  originCity: string;
  destinationRegion: string;
  destinationCity: string;
  cargoType: string;
  totalWeight: string;
  vessel: string;
  carrier: string;
  carrierReference: string;
  carrierRole: string;
  progressLabel: string;
  progressPercent: number;
  signal: string;
  signalDetail: string;
  river: string;
  riverDetail: string;
  nextMilestone: string;
  nextMilestoneTime: string;
  cardEta: string;
  cardEtaDay: string;
  attention: {
    eyebrow: string;
    title: string;
    body: string;
    document: string;
    deadline: string;
    action: string;
  };
  map: {
    operation: string;
    risk: string;
    signal: string;
    signalDetail: string;
    river: string;
    riverDetail: string;
    fitRoute: string;
  };
};

function splitPlace(place: string): { region: string; city: string } {
  const [cityPart, ...regionParts] = place.split(',').map((part) => part.trim()).filter(Boolean);
  if (regionParts.length === 0) {
    return { region: '', city: cityPart ?? place };
  }
  return { region: `${regionParts.join(', ')},`, city: cityPart ?? place };
}

export function buildOwnedCargoDesktopViewModel(
  cargo: OwnedCargo,
  copy: OwnedCargoDesktopCopy,
  facts: OwnedCargoDesktopFacts = {},
): OwnedCargoDesktopViewModel {
  const origin = splitPlace(cargo.origin);
  const destination = splitPlace(cargo.destination);
  const route = getShipperMapRouteForCargo(cargo);
  const progressPercent = Math.round(route.progressRatio * 100);
  const statusLabel = facts.statusLabel ?? copy.status[cargo.status];
  const corridorLabel = copy.corridor[cargo.corridorId];
  const signal = facts.signal ?? copy.freshness[cargo.freshnessState];
  const river = facts.river ?? corridorLabel;

  return {
    cargo,
    codeLabel: facts.codeLabel ?? `#${cargo.code}`,
    statusLabel,
    originRegion: facts.originRegion ?? origin.region,
    originCity: facts.originCity ?? origin.city,
    destinationRegion: facts.destinationRegion ?? destination.region,
    destinationCity: facts.destinationCity ?? destination.city,
    cargoType: facts.cargoType ?? copy.cargoLabel,
    totalWeight: facts.totalWeight ?? '—',
    vessel: facts.vessel ?? copy.vesselLabel,
    carrier: facts.carrier ?? corridorLabel,
    carrierReference: facts.carrierReference ?? cargo.code,
    carrierRole: facts.carrierRole ?? copy.corridorLabel,
    progressLabel: facts.progressLabel ?? `${progressPercent}%`,
    progressPercent,
    signal,
    signalDetail: facts.signalDetail ?? copy.updated(cargo.freshnessMinutes),
    river,
    riverDetail: facts.riverDetail ?? copy.risk[cargo.riskLevel],
    nextMilestone: facts.nextMilestone ?? cargo.destination,
    nextMilestoneTime: facts.nextMilestoneTime ?? copy.eta(cargo.etaHours),
    cardEta: facts.cardEta ?? copy.eta(cargo.etaHours),
    cardEtaDay: facts.cardEtaDay ?? '',
    attention: {
      eyebrow: facts.attentionEyebrow ?? copy.attentionEyebrow,
      title: facts.attentionTitle ?? copy.attentionTitle,
      body: facts.attentionBody ?? copy.attentionBody,
      document: facts.attentionDocument ?? copy.docs(cargo.pendingDocsCount),
      deadline: facts.attentionDeadline ?? copy.eta(cargo.etaHours),
      action: facts.attentionAction ?? copy.attentionAction,
    },
    map: {
      operation: facts.mapOperation ?? `${cargo.code} · ${statusLabel}`,
      risk: facts.mapRisk ?? copy.risk[cargo.riskLevel],
      signal: facts.mapSignal ?? copy.liveSignal,
      signalDetail: facts.mapSignalDetail ?? `${signal} · ${copy.updated(cargo.freshnessMinutes)}`,
      river: facts.mapRiver ?? river,
      riverDetail: facts.mapRiverDetail ?? copy.normalRiver,
      fitRoute: facts.mapFitRoute ?? copy.fitRoute,
    },
  };
}
