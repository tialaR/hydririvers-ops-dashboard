import type { WaterwayCorridor } from '../domain/waterway-tracking.types';

export const WATERWAY_CORRIDORS: WaterwayCorridor[] = [
  {
    id: 'amazonas',
    name: 'Hidrovia do Amazonas',
    region: 'Norte / Amazonia',
    mainRivers: ['Amazonas', 'Solimoes', 'Negro'],
    strategicRole: 'Eixo estrutural de abastecimento, cargas gerais, combustiveis e conexao portuaria amazonica.',
    referenceLabels: ['Rio Amazonas', 'Canal Norte', 'Porto Hidroviario', 'Corredor Norte'],
    concessionStatus: 'planned',
  },
  {
    id: 'tapajos',
    name: 'Corredor Tapajos-Amazonas',
    region: 'Norte / Arco Norte',
    mainRivers: ['Tapajos', 'Amazonas'],
    strategicRole: 'Eixo de escoamento agroindustrial entre Miritituba, Santarem e portos do Arco Norte.',
    referenceLabels: ['Rio Tapajos', 'Miritituba', 'Santarem', 'Itaituba'],
    concessionStatus: 'bidding',
  },
  {
    id: 'madeira',
    name: 'Hidrovia do Madeira',
    region: 'Norte / Rondonia-Amazonas',
    mainRivers: ['Madeira', 'Amazonas'],
    strategicRole: 'Corredor de graos, combustiveis e cargas industriais entre Porto Velho e Manaus/Itacoatiara.',
    referenceLabels: ['Rio Madeira', 'Porto Velho', 'Humaita', 'Itacoatiara'],
    concessionStatus: 'planned',
  },
  {
    id: 'tocantins-araguaia',
    name: 'Hidrovia Tocantins-Araguaia',
    region: 'Norte / Centro-Norte',
    mainRivers: ['Tocantins', 'Araguaia'],
    strategicRole: 'Corredor de cargas gerais, minerais, agroindustria e integracao regional.',
    referenceLabels: ['Rio Tocantins', 'Rio Araguaia', 'Maraba', 'Vila do Conde'],
    concessionStatus: 'unknown',
  },
  {
    id: 'barra-norte',
    name: 'Barra Norte',
    region: 'Foz Amazonica',
    mainRivers: ['Amazonas', 'Canal Norte'],
    strategicRole: 'Trecho critico de acesso maritimo-fluvial, sensivel a manutencao, calado e seguranca da navegacao.',
    referenceLabels: ['Barra Norte', 'Canal Norte', 'Foz Amazonica', 'Macapa'],
    concessionStatus: 'planned',
  },
];
