export type ImpactEvidenceSourceType = 'government' | 'public-agency' | 'policy' | 'research' | 'mock-estimate';
export type ImpactEvidenceRegionScope = 'Brazil' | 'North Region' | 'Amazon' | 'Pará' | 'Amazonas' | 'general';

export type ImpactEvidence = {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceType: ImpactEvidenceSourceType;
  regionScope: ImpactEvidenceRegionScope;
  year?: number;
  url?: string;
  relatedImpactIds: Array<
    'cost' | 'sustainability' | 'regional' | 'automation' | 'brdomar' | 'compliance' | 'connectivity' | 'government'
  >;
  /** Rótulo legado; a UI prefere `sourceType` + i18n em `pages.impactDetail.evidenceSource.*`. */
  confidenceLabel: string;
  disclaimer?: string;
};

export const impactEvidences: ImpactEvidence[] = [
  {
    id: 'brdomar-law-14301',
    title: 'BR do Mar (Lei 14.301/2022)',
    summary: 'Programa de estimulo ao transporte por cabotagem, instituido pela Lei 14.301/2022. Contexto institucional para cabotagem no Brasil.',
    sourceName: 'Casa Civil / Governo Federal',
    sourceType: 'policy',
    regionScope: 'Brazil',
    year: 2022,
    url: 'https://www.gov.br/casacivil/pt-br/assuntos/noticias/2022/janeiro/lei-que-institui-a-br-do-mar-e-sancionada',
    relatedImpactIds: ['brdomar', 'government'],
    confidenceLabel: 'Policy',
    disclaimer: 'Esta evidencia contextualiza politica publica; nao implica que o produto execute o programa.'
  },
  {
    id: 'mpor-brdomar-page',
    title: 'BR do Mar (pagina institucional)',
    summary: 'Pagina institucional do MPor sobre o BR do Mar, com descricao do objetivo do programa e referencia a Lei 14.301/2022.',
    sourceName: 'Ministerio de Portos e Aeroportos (MPor)',
    sourceType: 'government',
    regionScope: 'Brazil',
    year: 2026,
    url: 'https://www.gov.br/portos-e-aeroportos/pt-br/assuntos/setor-hidroviario/br-do-mar',
    relatedImpactIds: ['brdomar'],
    confidenceLabel: 'Fonte publica',
    disclaimer: 'Conteudo institucional; usar como contexto, nao como comprovacao de desempenho do produto.'
  },
  {
    id: 'mpor-hidrovias-reduzem-emissoes-2025',
    title: 'Hidrovias e eficiencia energetica (Amazônia)',
    summary: 'Material do MPor/SNHN associa vias fluviais da Amazonia a eficiencia energetica e menor impacto ambiental. Contem afirmacao de eficiencia energetica superior das barcacas vs rodoviario (consumo por tonelada transportada).',
    sourceName: 'Ministerio de Portos e Aeroportos (MPor)',
    sourceType: 'government',
    regionScope: 'Amazon',
    year: 2025,
    url: 'https://www.gov.br/portos-e-aeroportos/pt-br/assuntos/noticias/2025/12/hidrovias-reduzem-emissoes-e-se-consolidam-como-modelo-de-logistica-sustentavel/',
    relatedImpactIds: ['sustainability', 'regional'],
    confidenceLabel: 'Evidencia institucional',
    disclaimer: 'A evidencia e institucional e contextual; nao fornece um unico percentual universal de CO2 para todas as rotas.'
  },
  {
    id: 'mt-conceitos-hidroviarios',
    title: 'Conceitos hidroviarios (hidrovia/via navegavel)',
    summary: 'Definicoes oficiais para hidrovia/via navegavel interior e elementos de sinalizacao e balizamento (base conceitual).',
    sourceName: 'Ministerio dos Transportes',
    sourceType: 'government',
    regionScope: 'Brazil',
    year: 2015,
    url: 'https://www.gov.br/transportes/pt-br/assuntos/dados-de-transportes/sistema-de-transportes/conceitos-hidroviarios',
    relatedImpactIds: ['regional', 'government'],
    confidenceLabel: 'Fonte publica'
  },
  {
    id: 'dnit-hidrovia-amazonas',
    title: 'Hidrovia do Amazonas (DNIT)',
    summary: 'Descricao institucional da hidrovia do Amazonas como via relevante para transporte e escoamento de cargas na regiao Norte e sua continuidade com o Solimoes.',
    sourceName: 'DNIT',
    sourceType: 'public-agency',
    regionScope: 'North Region',
    year: 2021,
    url: 'https://www.gov.br/dnit/pt-br/assuntos/aquaviario/antiga-daq/hidrovia-do-amazonas',
    relatedImpactIds: ['regional', 'government'],
    confidenceLabel: 'Fonte publica'
  }
];

export function listImpactEvidencesByImpactId(
  id: 'cost' | 'sustainability' | 'regional' | 'automation' | 'brdomar' | 'compliance' | 'connectivity' | 'government'
) {
  return impactEvidences.filter((e) => e.relatedImpactIds.includes(id));
}

