import { OperationsBoard } from '@/features/dashboard/components/operations-board/operations-board';
import { listNegotiations, listTrackingEvents, listVessels } from '@/features/marketplace/services/marketplace.service';
import { getPublicCargos } from '@/features/cargo/services/cargo.service';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { getTranslations } from 'next-intl/server';
import { CargoActionSheetBridge } from '@/features/cargo/components/cargo-action-sheet/cargo-action-sheet-bridge';
import { ScreenTransition } from '@/shared/ui/screen-transition';

export default async function CargoesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.cargoes' });
  const [cargoes, negotiations, trackingEvents, vessels] = await Promise.all([
    getPublicCargos(),
    listNegotiations(),
    listTrackingEvents(),
    listVessels()
  ]);

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <ScreenTransition>
        <CargoActionSheetBridge locale={locale}>
          <OperationsBoard
            cargoes={cargoes}
            negotiations={negotiations}
            trackingEvents={trackingEvents}
            vessels={vessels}
            locale={locale}
          />
        </CargoActionSheetBridge>
      </ScreenTransition>
    </PageShell>
  );
}
