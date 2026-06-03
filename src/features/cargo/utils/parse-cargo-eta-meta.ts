type BoardTranslator = (key: string, values?: Record<string, string | number | Date>) => string;
type CommonTranslator = (key: string) => string;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function formatEtaLabel(value: string | undefined, tBoard: BoardTranslator) {
  if (!value) return tBoard('misc.etaMissing');
  const trimmed = value.trim();
  return trimmed.toLowerCase().startsWith('eta') ? trimmed : `ETA ${trimmed}`;
}

function translateEtaConfidence(value: string, tCommon: CommonTranslator) {
  const normalized = normalize(value);
  if (normalized.includes('alta')) return tCommon('predictability.high');
  if (normalized.includes('sazonal') || normalized.includes('seasonal')) {
    return tCommon('predictability.seasonal');
  }
  if (normalized.includes('media') || normalized.includes('medium')) {
    return tCommon('predictability.medium');
  }
  return value;
}

export function parseCargoEtaMeta(
  value: string | undefined,
  tBoard: BoardTranslator,
  tCommon: CommonTranslator,
) {
  if (!value) {
    return {
      etaLabel: formatEtaLabel(undefined, tBoard),
      confidenceLabel: '',
    };
  }

  const [etaPartRaw, ...rest] = value.split('•');
  const etaPart = etaPartRaw?.trim() ?? '';
  const confidencePart = rest.join('•').trim();

  return {
    etaLabel: formatEtaLabel(etaPart || value, tBoard),
    confidenceLabel: confidencePart ? translateEtaConfidence(confidencePart, tCommon) : '',
  };
}
