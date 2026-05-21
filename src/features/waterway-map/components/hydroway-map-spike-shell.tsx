import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';
import { HydrowayMapSpikeShellClient } from './hydroway-map-spike-shell-client';

type HydrowayMapSpikeShellProps = {
  model: HydrowayMapModel;
};

export function HydrowayMapSpikeShell({ model }: HydrowayMapSpikeShellProps) {
  return <HydrowayMapSpikeShellClient model={model} />;
}
