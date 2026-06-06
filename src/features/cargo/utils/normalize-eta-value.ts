/** Remove prefixo "ETA" duplicado ou solto do valor exibido ao lado do rótulo ETA. */
export function stripEtaPrefix(value: string): string {
  let trimmed = value.trim();

  while (/^eta\s+/i.test(trimmed)) {
    trimmed = trimmed.replace(/^eta\s+/i, '').trim();
  }

  return trimmed || value.trim();
}

export function normalizeEtaValue(value: string | undefined): string {
  if (!value?.trim()) {
    return '';
  }

  return stripEtaPrefix(value);
}
