function normalizeNameParts(fullName: string) {
  return fullName
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean);
}

const IGNORED_PARTICLES = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

function toDisplayCase(value: string) {
  if (!value) return '';
  return value
    .toLowerCase()
    .split(/([-’'])/g)
    .map((segment) => {
      if (segment === '-' || segment === '’' || segment === "'") return segment;
      if (!segment) return segment;
      return segment[0].toUpperCase() + segment.slice(1);
    })
    .join('');
}

export function getCompactUserDisplayName(fullName: string) {
  const parts = normalizeNameParts(fullName);
  if (!parts.length) return '';
  const meaningful = parts.filter((part) => !IGNORED_PARTICLES.has(part.toLowerCase()));
  if (!meaningful.length) return toDisplayCase(parts[0] ?? '');
  if (meaningful.length === 1) return toDisplayCase(meaningful[0]);

  const first = meaningful[0] ?? parts[0] ?? '';
  const last = meaningful[meaningful.length - 1] ?? parts[parts.length - 1] ?? '';

  return [first, last]
    .filter(Boolean)
    .map(toDisplayCase)
    .join(' ');
}

/** Iniciais estáveis para avatar (primeira letra do primeiro nome + primeira do último sobrenome do nome compacto). */
export function getCompactDisplayInitials(fullName: string) {
  const compact = getCompactUserDisplayName(fullName).trim();
  const parts = compact.split(/\s+/).filter(Boolean);
  if (!parts.length) {
    const raw = fullName.trim();
    if (!raw) return 'HR';
    return raw.slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? '';
  return `${first}${last}`.toUpperCase();
}
