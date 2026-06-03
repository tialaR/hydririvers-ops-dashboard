export type CargoLabV2Status = 'transito' | 'agendado' | 'cotacao' | 'atencao';

export type CargoLabV2 = {
  id: string;
  title: string;
  subtitle: string;
  status: CargoLabV2Status;
  statusLabel: string;
  origin: string;
  originTerminal: string;
  destination: string;
  destinationTerminal: string;
  eta: string;
  delivery: string;
  volume: string;
  vessel: string;
  cargoType: string;
};
