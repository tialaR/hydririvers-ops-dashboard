const CANONICAL_CARGO_ID_PATTERN = /^cargo-\d+$/i;
const HYDRI_HYDRO_CARGO_ID_PATTERN = /^hyd-\d{4}-\d+$/i;

export function normalizeCargoId(rawId: string): string {
  const decoded = decodeURIComponent(rawId).trim();

  if (CANONICAL_CARGO_ID_PATTERN.test(decoded)) {
    return decoded.toUpperCase();
  }

  if (HYDRI_HYDRO_CARGO_ID_PATTERN.test(decoded)) {
    return decoded.toUpperCase();
  }

  return decoded;
}

export function normalizeCargoIdForLookup(rawId: string): string {
  return normalizeCargoId(rawId).toLowerCase();
}
