import { OperationsBoard } from '@/features/dashboard/components/operations-board/operations-board';
import { listCargoes, listNegotiations, listTrackingEvents, listVessels } from '@/features/marketplace/services/marketplace.service';
import { PageShell } from '@/shared/ui/page-shell/page-shell';

export default async function TrackingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [cargoes, negotiations, trackingEvents, vessels] = await Promise.all([
    listCargoes(),
    listNegotiations(),
    listTrackingEvents(),
    listVessels()
  ]);

  return (
    <PageShell>
      <OperationsBoard
        cargoes={cargoes}
        negotiations={negotiations}
        trackingEvents={trackingEvents}
        vessels={vessels}
        locale={locale}
        initialTab="timeline"
      />
    </PageShell>
  );
}
