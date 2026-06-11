import { intlAppPaths } from '@/shared/routing/app-routes';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';

export type PublicCargoActionRouteId =
  | 'detail'
  | 'route'
  | 'documents'
  | 'costs'
  | 'priority'
  | 'negotiations';

export type PublicCargoActionRoute = {
  id: PublicCargoActionRouteId;
  label: string;
  description: string;
  href: string;
};

export type PublicCargoActionRouteLabels = Record<
  PublicCargoActionRouteId,
  { label: string; description: string }
>;

/**
 * Ações públicas mobile com href relativo ao segmento `[locale]`.
 * Use com `Link` / `router` do next-intl (prefixo de locale automático).
 */
export function getPublicCargoActionRoutes(
  cargoId: string,
  labels: PublicCargoActionRouteLabels,
): PublicCargoActionRoute[] {
  const normalizedCargoId = normalizeCargoId(cargoId);

  return [
    {
      id: 'detail',
      label: labels.detail.label,
      description: labels.detail.description,
      href: intlAppPaths.cargos.cargoDetail(normalizedCargoId),
    },
    {
      id: 'route',
      label: labels.route.label,
      description: labels.route.description,
      href: intlAppPaths.cargos.cargoMap(normalizedCargoId),
    },
    {
      id: 'documents',
      label: labels.documents.label,
      description: labels.documents.description,
      href: intlAppPaths.cargos.cargoView(normalizedCargoId, 'documentos'),
    },
    {
      id: 'costs',
      label: labels.costs.label,
      description: labels.costs.description,
      href: intlAppPaths.cargos.cargoView(normalizedCargoId, 'custos'),
    },
    {
      id: 'priority',
      label: labels.priority.label,
      description: labels.priority.description,
      href: intlAppPaths.cargos.cargoView(normalizedCargoId, 'prioridade'),
    },
    {
      id: 'negotiations',
      label: labels.negotiations.label,
      description: labels.negotiations.description,
      href: intlAppPaths.negotiations.home,
    },
  ];
}
