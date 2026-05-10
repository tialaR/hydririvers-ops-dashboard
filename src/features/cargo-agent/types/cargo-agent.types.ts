export type CargoAgentIntent =
  | 'explainCargoStatus'
  | 'suggestRoute'
  | 'documentChecklist'
  | 'costSummary'
  | 'timelineHelp'
  | 'newCargoHelp'
  | 'negotiationHelp'
  | 'profileHelp'
  | 'unknown';

export type CargoAgentSeverity = 'info' | 'success' | 'warning' | 'error';

export type CargoAgentSuggestion = {
  label: string;
  action: 'OPEN_DOCUMENTS' | 'OPEN_TIMELINE' | 'OPEN_COST' | 'OPEN_MAP' | 'OPEN_NEGOTIATIONS' | 'DISMISS';
  href?: string;
};

export type CargoAgentInput = {
  userId?: string | null;
  role?: string | null;
  cargoId?: string | null;
  route?: string | null;
  activeTab?: string | null;
  locale?: string;
  theme?: 'light' | 'dark';
  pendingDocuments?: number;
  selectedCargoStatus?: string | null;
  timelineSummary?: string | null;
  costSummary?: string | null;
};

export type CargoAgentResponse = {
  intent: CargoAgentIntent;
  message: string;
  suggestions: CargoAgentSuggestion[];
  severity: CargoAgentSeverity;
  requiresConfirmation: boolean;
  canExecuteAction: boolean;
};

