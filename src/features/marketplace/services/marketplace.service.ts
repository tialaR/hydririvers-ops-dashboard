import { readMock } from '@/shared/server/mock-db';
import type { Cargo, Negotiation } from '../domain/marketplace.types';

export async function listCargoes() { return readMock('cargoes'); }
export async function listVessels() { return readMock('vessels'); }
export async function listNegotiations() { return readMock('negotiations'); }
export async function getCargoById(id: string) { return readMock('cargoes').find((cargo) => cargo.id === id); }
export async function getVesselById(id: string) { return readMock('vessels').find((vessel) => vessel.id === id); }
export async function getNegotiationById(id: string) { return readMock('negotiations').find((negotiation) => negotiation.id === id); }
export async function listTrackingEvents() { return readMock('trackingEvents'); }

export async function getMarketplaceSummary() {
  const cargoes = readMock('cargoes');
  const vessels = readMock('vessels');
  const negotiations = readMock('negotiations');
  return {
    openCargoes: cargoes.length,
    availableVessels: vessels.filter((vessel) => vessel.status === 'available').length,
    activeNegotiations: negotiations.length,
    averageSaving: '38%'
  };
}

export type OperationalDashboardAttentionItem = {
  id: string;
  title: string;
  origin: string;
  destination: string;
  documentReadiness: number;
  status: Cargo['status'];
  corridor?: string;
  risk?: string;
};

export type OperationalDashboardCorridorItem = {
  corridor: string;
  count: number;
};

export type OperationalDashboardSummary = {
  activeCargoes: number;
  pendingDocuments: number;
  activeNegotiations: number;
  availableVessels: number;
  averageSaving: string;
  attentionCargoes: OperationalDashboardAttentionItem[];
  busiestCorridors: OperationalDashboardCorridorItem[];
  recentNegotiations: Negotiation[];
};

export async function getOperationalDashboardSummary(): Promise<OperationalDashboardSummary> {
  const cargoes = readMock('cargoes') as Cargo[];
  const vessels = readMock('vessels');
  const negotiations = readMock('negotiations') as Negotiation[];

  const attentionCargoes = cargoes
    .filter((cargo) => {
      const readiness = typeof cargo.documentReadiness === 'number' ? cargo.documentReadiness : 100;
      return readiness < 80 || Boolean(cargo.operationalRisks?.length) || cargo.status !== 'delivered';
    })
    .sort((a, b) => {
      const aReadiness = typeof a.documentReadiness === 'number' ? a.documentReadiness : 100;
      const bReadiness = typeof b.documentReadiness === 'number' ? b.documentReadiness : 100;
      return aReadiness - bReadiness;
    })
    .slice(0, 5)
    .map((cargo) => ({
      id: cargo.id,
      title: cargo.title,
      origin: cargo.origin,
      destination: cargo.destination,
      documentReadiness: typeof cargo.documentReadiness === 'number' ? cargo.documentReadiness : 100,
      status: cargo.status,
      corridor: cargo.corridor,
      risk: cargo.operationalRisks?.[0]
    }));

  const corridorCounts = new Map<string, number>();
  for (const cargo of cargoes) {
    const corridor = cargo.corridor?.trim();
    if (!corridor) continue;
    corridorCounts.set(corridor, (corridorCounts.get(corridor) ?? 0) + 1);
  }

  const busiestCorridors = Array.from(corridorCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([corridor, count]) => ({ corridor, count }));

  return {
    activeCargoes: cargoes.filter((cargo) => cargo.status !== 'delivered').length,
    pendingDocuments: cargoes.filter((cargo) => (typeof cargo.documentReadiness === 'number' ? cargo.documentReadiness : 100) < 80).length,
    activeNegotiations: negotiations.length,
    availableVessels: vessels.filter((vessel) => vessel.status === 'available').length,
    averageSaving: '38%',
    attentionCargoes,
    busiestCorridors,
    recentNegotiations: negotiations.slice(0, 6)
  };
}
