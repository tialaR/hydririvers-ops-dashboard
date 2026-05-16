const CANONICAL_CARGO_ID_PATTERN = /^cargo-\d+$/i;

export function normalizeCargoId(rawId: string): string {
  const decoded = decodeURIComponent(rawId).trim();

  if (CANONICAL_CARGO_ID_PATTERN.test(decoded)) {
    return decoded.toUpperCase();
  }

  return decoded;
}

export function normalizeCargoIdForLookup(rawId: string): string {
  return normalizeCargoId(rawId).toLowerCase();
}
