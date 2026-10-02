import { OperationsBoard } from '@/features/dashboard/components/operations-board/operations-board';
import { listNegotiations, listTrackingEvents, listVessels } from '@/features/marketplace/services/marketplace.service';
import { getPublicCargos } from '@/features/cargo/services/cargo.service';
import { listPublicCargoes } from '@/features/cargo/public/application/list-public-cargoes';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { CargoActionSheetBridge } from '@/features/cargo/components/cargo-action-sheet/cargo-action-sheet-bridge';
import { ScreenTransition } from '@/shared/ui/screen-transition';
import { getSessionUser } from '@/shared/server/auth';

import { AnonymousPublicCargoesExperience } from './anonymous-public-cargoes-experience';

export default async function CargoesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getSessionUser();

  if (!user) {
    const initialCargoes = await listPublicCargoes();

    return (
      <PageShell>
        <ScreenTransition>
          <AnonymousPublicCargoesExperience initialCargoes={initialCargoes} />
        </ScreenTransition>
      </PageShell>
    );
  }

  const [cargoes, negotiations, trackingEvents, vessels] = await Promise.all([
    getPublicCargos(),
    listNegotiations(),
    listTrackingEvents(),
    listVessels()
  ]);

  return (
    <PageShell>
      <ScreenTransition>
        <CargoActionSheetBridge locale={locale}>
          <OperationsBoard
            cargoes={cargoes}
            negotiations={negotiations}
            trackingEvents={trackingEvents}
            vessels={vessels}
            locale={locale}
            mobileExperience="public-cargas"
          />
        </CargoActionSheetBridge>
      </ScreenTransition>
    </PageShell>
  );
}
