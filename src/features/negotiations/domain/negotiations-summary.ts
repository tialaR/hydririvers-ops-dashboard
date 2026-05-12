import type { DealStage, Negotiation } from '@/features/marketplace/domain/marketplace.types';

export type NegotiationsSummary = {
  /** Todas as negociações retornadas (inclui entregues). */
  total: number;
  /** Em andamento comercial (exclui entregues). */
  active: number;
  byStage: Record<DealStage, number>;
  needsResponse: number;
  /** Contrato assinado ou em preparação de embarque. */
  contractsInProgress: number;
  amountTotal: string;
};

function parseAmountToNumber(value: string): number {
  const match = value.match(/(\d[\d.,]*)/);
  if (!match) return 0;
  const numeric = Number(match[1].replace(/\./g, '').replace(',', '.'));
  if (Number.isNaN(numeric)) return 0;
  return numeric;
}

export function getNegotiationsSummary(negotiations: Negotiation[]): NegotiationsSummary {
  const byStage: Record<DealStage, number> = {
    quote: 0,
    counteroffer: 0,
    contract: 0,
    boarding: 0,
    delivered: 0
  };

  let amountTotalNumber = 0;
  for (const n of negotiations) {
    byStage[n.stage] += 1;
    amountTotalNumber += parseAmountToNumber(String(n.amount ?? ''));
  }

  const active = negotiations.filter((n) => n.stage !== 'delivered').length;
  const contractsInProgress = byStage.contract + byStage.boarding;

  return {
    total: negotiations.length,
    active,
    byStage,
    needsResponse: byStage.counteroffer,
    contractsInProgress,
    amountTotal: String(Math.round(amountTotalNumber))
  };
}

