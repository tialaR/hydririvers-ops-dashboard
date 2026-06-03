/** Classe global exigida pelos seletores `:global(.root[data-theme='light'])` do DS v2 mobile. */
export const CARGO_DS_V2_THEME_ROOT_CLASS = 'root';

export function cargoDsV2ThemeRootClassName(moduleRootClass: string): string {
  return `${moduleRootClass} ${CARGO_DS_V2_THEME_ROOT_CLASS}`;
}
