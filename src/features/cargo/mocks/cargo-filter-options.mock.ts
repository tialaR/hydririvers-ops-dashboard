export type CargoFilterOptionGroup =
  | 'port'
  | 'terminal'
  | 'ip4'
  | 'waterway'
  | 'corridor'
  | 'status'
  | 'cargo-type'
  | 'vessel-type'
  | 'cutoff'
  | 'capacity';

export type CargoFilterOption = {
  id: string;
  label: string;
  value: string;
  group?: CargoFilterOptionGroup;
  metadata?: {
    city?: string;
    state?: string;
    waterway?: string;
    terminalType?: string;
    description?: string;
  };
};

export const cargoStatusFilterOptions = [
  { id: 'status-all', label: 'Todos', value: 'todos', group: 'status' },
  { id: 'status-spot', label: 'Disponível / Spot', value: 'spot', group: 'status' },
  { id: 'status-transito', label: 'Em trânsito', value: 'transito', group: 'status' },
  { id: 'status-atracada', label: 'Atracada', value: 'atracada', group: 'status' },
  { id: 'status-concluida', label: 'Concluída', value: 'concluida', group: 'status' },
  { id: 'status-atrasada', label: 'Atrasada', value: 'atrasada', group: 'status' },
] as const satisfies readonly CargoFilterOption[];

export const cargoOriginFilterOptions = [
  { id: 'origin-all', label: 'Todos', value: 'todos', group: 'terminal' },
  {
    id: 'origin-terminal-barra-funda',
    label: 'Terminal Barra Funda · São Paulo, SP',
    value: 'Terminal Barra Funda',
    group: 'terminal',
    metadata: {
      city: 'São Paulo',
      state: 'SP',
      terminalType: 'terminal fluvial',
      description: 'Terminal urbano usado como origem de carga geral e contêineres.',
    },
  },
  {
    id: 'origin-terminal-cic',
    label: 'Terminal CIC · Curitiba, PR',
    value: 'Terminal CIC',
    group: 'terminal',
    metadata: {
      city: 'Curitiba',
      state: 'PR',
      terminalType: 'terminal intermodal',
      description: 'Ponto de consolidação para carga geral e projeto industrial.',
    },
  },
  {
    id: 'origin-porto-belem',
    label: 'Porto de Belém · Belém, PA',
    value: 'Porto de Belém',
    group: 'port',
    metadata: {
      city: 'Belém',
      state: 'PA',
      waterway: 'Amazonas-Solimões',
      terminalType: 'porto',
      description: 'Origem portuária do eixo Belém-Santarém no corredor Amazonas.',
    },
  },
  {
    id: 'origin-porto-miritituba',
    label: 'Porto de Miritituba · Miritituba, PA',
    value: 'Porto de Miritituba',
    group: 'port',
    metadata: {
      city: 'Miritituba',
      state: 'PA',
      waterway: 'Tapajós',
      terminalType: 'porto fluvial',
      description: 'Origem graneleira do trecho Miritituba-Santarém.',
    },
  },
] as const satisfies readonly CargoFilterOption[];

export const cargoDestinationFilterOptions = [
  { id: 'destination-all', label: 'Todos', value: 'todos', group: 'terminal' },
  {
    id: 'destination-porto-chibatao',
    label: 'Porto Chibatão · Manaus, AM',
    value: 'Porto Chibatão',
    group: 'port',
    metadata: {
      city: 'Manaus',
      state: 'AM',
      waterway: 'Amazonas-Solimões',
      terminalType: 'porto',
      description: 'Destino portuário para cargas de abastecimento e contêineres em Manaus.',
    },
  },
  {
    id: 'destination-terminal-aratu',
    label: 'Terminal Aratu · Salvador, BA',
    value: 'Terminal Aratu',
    group: 'terminal',
    metadata: {
      city: 'Salvador',
      state: 'BA',
      terminalType: 'terminal portuário',
      description: 'Destino de conexão para carga geral e projeto.',
    },
  },
  {
    id: 'destination-terminal-santarem',
    label: 'Terminal Fluvial de Santarém · Santarém, PA',
    value: 'Terminal Fluvial de Santarém',
    group: 'terminal',
    metadata: {
      city: 'Santarém',
      state: 'PA',
      waterway: 'Amazonas-Solimões',
      terminalType: 'terminal fluvial',
      description: 'Destino fluvial nos corredores Amazonas e Tapajós.',
    },
  },
] as const satisfies readonly CargoFilterOption[];

export const cargoTypeFilterOptions = [
  { id: 'cargo-type-all', label: 'Todos', value: 'todos', group: 'cargo-type' },
  { id: 'cargo-type-granel-solido', label: 'Granel sólido', value: 'granel-solido', group: 'cargo-type' },
  { id: 'cargo-type-granel-liquido', label: 'Granel líquido', value: 'granel-liquido', group: 'cargo-type' },
  { id: 'cargo-type-carga-geral', label: 'Carga geral', value: 'carga-geral', group: 'cargo-type' },
  { id: 'cargo-type-conteiner', label: 'Contêiner', value: 'conteiner', group: 'cargo-type' },
] as const satisfies readonly CargoFilterOption[];

export const cargoVesselTypeFilterOptions = [
  { id: 'vessel-type-all', label: 'Todos', value: 'todos', group: 'vessel-type' },
  { id: 'vessel-type-empurrador', label: 'Empurrador', value: 'empurrador', group: 'vessel-type' },
  { id: 'vessel-type-barcaca', label: 'Barcaça', value: 'barcaca', group: 'vessel-type' },
  { id: 'vessel-type-comboio', label: 'Comboio', value: 'comboio', group: 'vessel-type' },
  { id: 'vessel-type-balsa-graneleira', label: 'Balsa graneleira', value: 'balsa-graneleira', group: 'vessel-type' },
  {
    id: 'vessel-type-balsa-porta-conteineres',
    label: 'Balsa porta-contêineres',
    value: 'balsa-porta-conteineres',
    group: 'vessel-type',
  },
] as const satisfies readonly CargoFilterOption[];

export const cargoCutoffFilterOptions = [
  { id: 'cutoff-all', label: 'Todos', value: 'todos', group: 'cutoff' },
  { id: 'cutoff-hoje', label: 'Cut-off hoje', value: 'hoje', group: 'cutoff' },
  { id: 'cutoff-2-4-dias', label: 'Janela 2-4 dias', value: '2-4-dias', group: 'cutoff' },
  { id: 'cutoff-5-dias', label: '5+ dias', value: '5-dias', group: 'cutoff' },
  {
    id: 'cutoff-navegacao-noturna-restrita',
    label: 'Navegação noturna restrita',
    value: 'navegacao-noturna-restrita',
    group: 'cutoff',
  },
  {
    id: 'cutoff-janela-atracacao-critica',
    label: 'Janela de atracação crítica',
    value: 'janela-atracacao-critica',
    group: 'cutoff',
  },
] as const satisfies readonly CargoFilterOption[];

export const cargoCapacityFilterOptions = [
  { id: 'capacity-all', label: 'Todos', value: 'todos', group: 'capacity' },
  { id: 'capacity-ate-20t', label: 'Até 20 t', value: 'ate-20t', group: 'capacity' },
  { id: 'capacity-20-30t', label: '20-30 t', value: '20-30t', group: 'capacity' },
  { id: 'capacity-acima-30t', label: 'Acima de 30 t', value: 'acima-30t', group: 'capacity' },
  {
    id: 'capacity-canal-raso-restricao-sazonal',
    label: 'Canal raso / restrição sazonal',
    value: 'canal-raso-restricao-sazonal',
    group: 'capacity',
  },
  {
    id: 'capacity-alto-volume-comboio',
    label: 'Alto volume / comboio recomendado',
    value: 'alto-volume-comboio',
    group: 'capacity',
  },
] as const satisfies readonly CargoFilterOption[];

export const cargoFilterOptions = {
  status: cargoStatusFilterOptions,
  origins: cargoOriginFilterOptions,
  destinations: cargoDestinationFilterOptions,
  cargoTypes: cargoTypeFilterOptions,
  vesselTypes: cargoVesselTypeFilterOptions,
  cutoff: cargoCutoffFilterOptions,
  capacity: cargoCapacityFilterOptions,
} as const;

export type CargoStatusFilterValue = (typeof cargoStatusFilterOptions)[number]['value'];
export type CargoOriginFilterValue = (typeof cargoOriginFilterOptions)[number]['value'];
export type CargoDestinationFilterValue = (typeof cargoDestinationFilterOptions)[number]['value'];
export type CargoTypeFilterValue = (typeof cargoTypeFilterOptions)[number]['value'];
export type CargoVesselTypeFilterValue = (typeof cargoVesselTypeFilterOptions)[number]['value'];
export type CargoCutoffFilterValue = (typeof cargoCutoffFilterOptions)[number]['value'];
export type CargoCapacityFilterValue = (typeof cargoCapacityFilterOptions)[number]['value'];
