import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getCargoById } from '@/features/cargo/services/cargo.service';
import { CargoMapViewportRouter } from '@/features/waterway-map/components/cargo-map-viewport-router';
import { resolveCargoHydrowayMapModel } from '@/features/waterway-map/data/resolve-cargo-hydroway-model';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';

type CargoMapPageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function CargoMapPage({ params }: CargoMapPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const normalizedCargoId = normalizeCargoId(id);
  const cargo = await getCargoById(normalizedCargoId);

  if (!cargo) {
    notFound();
  }

  const model = resolveCargoHydrowayMapModel(cargo);

  if (!model) {
    const tMap = await getTranslations('operationsBoard.map');

    return (
      <div data-testid="hydroway-map-product-page">
        <div data-testid="hydroway-map-unavailable" role="status" aria-live="polite">
          {tMap('mapUnavailable')}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="hydroway-map-product-page">
      <CargoMapViewportRouter cargo={cargo} model={model} />
    </div>
  );
}
