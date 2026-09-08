import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type {
  CargoCapacityFilterValue,
  CargoCutoffFilterValue,
  CargoDestinationFilterValue,
  CargoOriginFilterValue,
  CargoStatusFilterValue,
  CargoTypeFilterValue,
  CargoVesselTypeFilterValue,
} from '@/features/cargo/mocks/cargo-filter-options.mock';

import { CargoFilterSheetContent, type CargoFilterSheetContentProps } from './cargo-filter-sheet-content';

const defaultArgs: CargoFilterSheetContentProps = {
  status: 'todos',
  cargoType: 'todos',
  origin: 'todos',
  destination: 'todos',
  vesselType: 'todos',
  cutoff: 'todos',
  capacity: 'todos',
  onStatusChange: () => undefined,
  onCargoTypeChange: () => undefined,
  onOriginChange: () => undefined,
  onDestinationChange: () => undefined,
  onVesselTypeChange: () => undefined,
  onCutoffChange: () => undefined,
  onCapacityChange: () => undefined,
};

const meta = {
  title: 'Operational/CargoFilterSheetContent',
  component: CargoFilterSheetContent,
  args: defaultArgs,
  decorators: [(Story) => <div style={{ width: 'min(100%, 430px)', padding: '16px' }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component: 'Operational cargo filters with accessible groups, explicit selection state and resilient long labels.',
      },
    },
  },
} satisfies Meta<typeof CargoFilterSheetContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultSelection: Story = {};

export const OperationalSelection: Story = {
  args: {
    status: 'transito',
    cargoType: 'conteiner',
    origin: 'Porto de Miritituba',
    destination: 'Terminal Fluvial de Santarém',
    vesselType: 'comboio',
    cutoff: 'janela-atracacao-critica',
    capacity: 'alto-volume-comboio',
  },
};

function InteractiveFilterSheetStory() {
  const [status, setStatus] = useState<CargoStatusFilterValue>('todos');
  const [cargoType, setCargoType] = useState<CargoTypeFilterValue>('todos');
  const [origin, setOrigin] = useState<CargoOriginFilterValue>('todos');
  const [destination, setDestination] = useState<CargoDestinationFilterValue>('todos');
  const [vesselType, setVesselType] = useState<CargoVesselTypeFilterValue>('todos');
  const [cutoff, setCutoff] = useState<CargoCutoffFilterValue>('todos');
  const [capacity, setCapacity] = useState<CargoCapacityFilterValue>('todos');

  return (
    <CargoFilterSheetContent
      status={status}
      cargoType={cargoType}
      origin={origin}
      destination={destination}
      vesselType={vesselType}
      cutoff={cutoff}
      capacity={capacity}
      onStatusChange={setStatus}
      onCargoTypeChange={setCargoType}
      onOriginChange={setOrigin}
      onDestinationChange={setDestination}
      onVesselTypeChange={setVesselType}
      onCutoffChange={setCutoff}
      onCapacityChange={setCapacity}
    />
  );
}

export const Interactive: Story = {
  render: () => <InteractiveFilterSheetStory />,
};
