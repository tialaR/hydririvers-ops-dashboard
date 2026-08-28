export type OperationalChartPoint = {
  label: string;
  value: number;
};

export type OperationalRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type OperationalFreshnessState = 'fresh' | 'stale' | 'offline';

export type OperationalChartSlice = {
  points: OperationalChartPoint[];
  riskLevel: OperationalRiskLevel;
  freshnessMinutes: number;
  freshnessState: OperationalFreshnessState;
};

export type OperationalChartCopy = {
  staleBanner: string;
  empty: string;
  actionLabel: string;
  tablePeriod: string;
  tableValue: string;
  riskLabel?: string;
  freshnessLabel?: string;
};
