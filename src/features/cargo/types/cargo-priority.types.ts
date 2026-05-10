export type PriorityLevel = 'monitoring' | 'medium' | 'high';
export type PrioritySeverity = 'low' | 'medium' | 'high';
export type PriorityStatus = 'pending' | 'monitoring' | 'inProgress' | 'done';
export type CargoPriorityActionStatus = 'monitoring' | 'inReview' | 'pending' | 'stable';

export type CargoPrioritySummaryItem = {
  id: string;
  titleKey: string;
  valueKey: string;
  descriptionKey: string;
  icon: string;
};

export type CargoPriorityAction = {
  id: string;
  categoryKey: string;
  titleKey: string;
  descriptionKey: string;
  severity: PrioritySeverity;
  status: CargoPriorityActionStatus;
  recommendationKey: string;
  icon: string;
};

export type CargoPriorityChecklistItem = {
  id: string;
  labelKey: string;
  status: PriorityStatus;
};

export type CargoPriority = {
  score: number;
  level: PriorityLevel;
  badgeLabelKey: string;
  statusLabelKey: string;
  summary: CargoPrioritySummaryItem[];
  actions: CargoPriorityAction[];
  checklist: CargoPriorityChecklistItem[];
  impacts: string[];
  scoreNoteKey: string;
  emptyTitleKey: string;
  emptyDescriptionKey: string;
  emptyCtaLabelKey: string;
};
