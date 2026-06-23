export type EmbarcadorCargo = {
  id: string;
  name: string;
  route: string;
  status: string;
  eta: string;
  volume: string;
  progress: number;
  cargo: string;
  corridor: string;
  draft: string;
  riverLevel: string;
  risk: string;
  documents: string;
};

export const embarcadorCargoes: EmbarcadorCargo[] = [
  {
    id: 'tapajos-01',
    name: 'Comboio Tapajos-01',
    route: 'Miritituba -> Barcarena',
    status: 'Em transito',
    eta: '18 Jun 14h30',
    volume: '32.400 t',
    progress: 74,
    cargo: 'Soja a Granel',
    corridor: 'Corredor Tapajos - Arco Norte',
    draft: '2,8 m',
    riverLevel: '5,2 m',
    risk: 'Baixo',
    documents: '3/4 ok',
  },
  {
    id: 'madeira-03',
    name: 'Comboio Madeira-03',
    route: 'Porto Velho -> Itacoatiara',
    status: 'Aguardando janela',
    eta: '19 Jun 09h10',
    volume: '28.100 t',
    progress: 42,
    cargo: 'Milho a Granel',
    corridor: 'Corredor Madeira - Amazonas',
    draft: '2,6 m',
    riverLevel: '4,7 m',
    risk: 'Medio',
    documents: '2/4 ok',
  },
  {
    id: 'solimoes-07',
    name: 'Comboio Solimoes-07',
    route: 'Manaus -> Tabatinga',
    status: 'Atracado',
    eta: '20 Jun 16h00',
    volume: '18.900 t',
    progress: 88,
    cargo: 'Carga Geral',
    corridor: 'Corredor Amazonas-Solimoes',
    draft: '3,1 m',
    riverLevel: '6,0 m',
    risk: 'Controlado',
    documents: '4/4 ok',
  },
  {
    id: 'tocantins-12',
    name: 'Comboio Tocantins-12',
    route: 'Maraba -> Vila do Conde',
    status: 'Alerta operacional',
    eta: '21 Jun 11h45',
    volume: '24.700 t',
    progress: 57,
    cargo: 'Fertilizantes',
    corridor: 'Corredor Tocantins-Araguaia',
    draft: '2,4 m',
    riverLevel: '4,1 m',
    risk: 'Alto',
    documents: '3/4 ok',
  },
];
