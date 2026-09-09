export type NextSegmentOperationalBrief = {
  context?: string;
  situation?: string;
  impact?: string;
};

function normalizeFragment(value: string) {
  return value.replace(/[.!?]+$/u, '').trim();
}

function capitalizeSentence(value: string) {
  const normalized = normalizeFragment(value);
  if (!normalized) return normalized;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * Converte resumos operacionais longos (ex.: businessSummary) em leitura modular.
 * Formato esperado: "Contexto: situação; impacto" ou "Contexto: situação — impacto".
 */
export function parseNextSegmentOperationalBrief(detail?: string): NextSegmentOperationalBrief | undefined {
  const trimmed = detail?.trim();
  if (!trimmed) return undefined;

  const colonIndex = trimmed.indexOf(':');
  if (colonIndex === -1) {
    return { situation: capitalizeSentence(trimmed) };
  }

  const context = trimmed.slice(0, colonIndex).trim();
  const remainder = trimmed.slice(colonIndex + 1).trim();
  const separator = remainder.match(/\s*(?:;|—)\s*/);

  if (!separator || separator.index === undefined) {
    return {
      context: capitalizeSentence(context),
      situation: capitalizeSentence(remainder),
    };
  }

  const splitIndex = separator.index;
  const situation = remainder.slice(0, splitIndex).trim();
  const impact = remainder.slice(splitIndex + separator[0].length).trim();

  return {
    context: capitalizeSentence(context),
    situation: capitalizeSentence(situation),
    impact: capitalizeSentence(impact),
  };
}
