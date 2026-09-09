import type {
  CargoWaterwayTrackingScenario,
  WaterwayRiskLevel,
  WaterwayOperationalStatus,
} from '../domain/waterway-tracking.types';

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getRemainingProgressLabel(
  scenario: CargoWaterwayTrackingScenario,
): string {
  return `${scenario.metrics.remainingPercent}% para destino`;
}

export function getOperationalStatusLabel(status?: WaterwayOperationalStatus | string): string {
  const labels: Record<WaterwayOperationalStatus, string> = {
    'on-time': 'Dentro do prazo',
    attention: 'Atencao',
    delayed: 'Atrasado',
    restricted: 'Restrito',
    contingency: 'Contingencia',
  };

  if (!status) {
    return 'Operacao monitorada';
  }

  return labels[status as WaterwayOperationalStatus] ?? status;
}

export function getRiskLabel(riskLevel: WaterwayRiskLevel): string {
  const labels: Record<WaterwayRiskLevel, string> = {
    low: 'Baixo',
    medium: 'Medio',
    high: 'Alto',
    critical: 'Critico',
  };

  return labels[riskLevel];
}
