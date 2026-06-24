export type CargoStatus = 'planning' | 'quote' | 'documents' | 'tracking' | 'payment' | 'issue';

export type Cargo = {
  id: string;
  title: string;
  cargoType: string;
  origin: string;
  destination: string;
  status: string;
  eta: string;
  tonnage: string;
  draft: string;
  riverLevel: string;
  progress: number;
  cost: string;
  delayCost: string;
  risk: 'Baixo' | 'Médio' | 'Alto';
  docs: string;
  convoy: string;
};

export type FlowStep = {
  id: CargoStatus;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
};

export const flowSteps: FlowStep[] = [
  {
    id: 'planning',
    eyebrow: '01',
    title: 'Comparar rotas',
    description: 'Compare prazo, custo, calado e janela operacional antes de criar a carga.',
    cta: 'Comparar',
  },
  {
    id: 'quote',
    eyebrow: '02',
    title: 'Solicitar cotação',
    description: 'Receba propostas de operadores habilitados para a rota selecionada.',
    cta: 'Solicitar',
  },
  {
    id: 'documents',
    eyebrow: '03',
    title: 'Enviar documentos',
    description: 'Anexe licença, documentação da carga e dados regulatórios.',
    cta: 'Enviar docs',
  },
  {
    id: 'tracking',
    eyebrow: '04',
    title: 'Acompanhar ETA',
    description: 'Monitore comboio, porto, clima e desvios em tempo real.',
    cta: 'Acompanhar',
  },
  {
    id: 'payment',
    eyebrow: '05',
    title: 'Pagar frete',
    description: 'Libere pagamento de forma segura na plataforma.',
    cta: 'Pagar agora',
  },
  {
    id: 'issue',
    eyebrow: '06',
    title: 'Reportar ocorrência',
    description: 'Registre atraso, restrição de calado ou qualquer imprevisto.',
    cta: 'Reportar',
  },
];

export const cargos: Cargo[] = [
  {
    id: 'tapajos-01',
    title: 'Comboio Tapajós-01',
    cargoType: 'Soja a granel',
    origin: 'Miritituba',
    destination: 'Barcarena',
    status: 'Em trânsito',
    eta: '18 Jun, 14h30',
    tonnage: '32.400 t',
    draft: '2,8 m',
    riverLevel: '5,2 m',
    progress: 68,
    cost: 'R$ 1.342.800',
    delayCost: 'R$ 57.800',
    risk: 'Baixo',
    docs: '3 / 5',
    convoy: '4 barcaças + 1 empurrador',
  },
  {
    id: 'madeira-03',
    title: 'Comboio Madeira-03',
    cargoType: 'Fertilizantes',
    origin: 'Porto Velho',
    destination: 'Itacoatiara',
    status: 'Aguardando',
    eta: '22 Jun, 09h00',
    tonnage: '18.200 t',
    draft: '3,1 m',
    riverLevel: '4,9 m',
    progress: 42,
    cost: 'R$ 842.600',
    delayCost: 'R$ 18.400',
    risk: 'Médio',
    docs: '4 / 5',
    convoy: '3 barcaças + 1 empurrador',
  },
  {
    id: 'solimoes-07',
    title: 'Comboio Solimões-07',
    cargoType: 'Óleo de soja',
    origin: 'Manaus',
    destination: 'Santarém',
    status: 'Atracado',
    eta: 'Concluído',
    tonnage: '9.800 t',
    draft: '2,1 m',
    riverLevel: '4,8 m',
    progress: 100,
    cost: 'R$ 512.300',
    delayCost: 'R$ 0',
    risk: 'Baixo',
    docs: '5 / 5',
    convoy: '2 barcaças + 1 empurrador',
  },
];
