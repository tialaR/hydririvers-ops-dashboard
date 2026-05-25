import 'server-only';

import type { HydrowayMapMobileRouteSegmentStatus, HydrowayMapMetadata } from '../domain/hydroway-map-model.types';
import { hydrowayOperationalDatasetMock } from '../mocks/hydroway-operational-layers.mock';
import { resolveCargoOperationalWaterwayContext } from './resolve-cargo-operational-waterway-context';

export type MobileRouteMetadataPatch = Pick<
  HydrowayMapMetadata,
  'nextSegmentLabel' | 'nextSegmentDetail' | 'nextSegmentStatus'
>;

function mapOperationalStatusToSegmentStatus(
  status: string,
): HydrowayMapMobileRouteSegmentStatus {
  if (status === 'attention') return 'attention';
  if (status === 'delayed') return 'delayed';
  return 'onTime';
}

/** Deriva metadados mobile serializáveis a partir do dataset operacional mock (servidor). */
export function resolveMobileRouteMetadataPatch(cargoId: string): MobileRouteMetadataPatch {
  const operationalContext = resolveCargoOperationalWaterwayContext(cargoId);
  if (!operationalContext) {
    return {};
  }

  let nextSegmentLabel: string | undefined;
  if (operationalContext.nextTerminalId) {
    const terminal = hydrowayOperationalDatasetMock.terminals.find(
      (entry) => entry.id === operationalContext.nextTerminalId,
    );
    nextSegmentLabel = terminal?.name ?? operationalContext.nextTerminalId;
  }

  return {
    nextSegmentLabel,
    nextSegmentDetail: operationalContext.businessSummary,
    nextSegmentStatus: mapOperationalStatusToSegmentStatus(operationalContext.operationalStatus),
  };
}
