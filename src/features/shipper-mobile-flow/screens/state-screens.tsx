'use client';

import { useTranslations } from 'next-intl';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { ErrorState } from '@/features/shipper-mobile-flow/components/error-state/error-state';
import { SuccessReceipt } from '@/features/shipper-mobile-flow/components/error-state/error-state';

export function OfflineScreen() {
  const t = useTranslations('shipperMobileFlow.states.offline');

  return (
    <MobileAppShell forceHideBottomNav>
      <ErrorState title={t('title')} description={t('body')} actionLabel={t('action')} actionHref="/cockpit" />
    </MobileAppShell>
  );
}

export function ServiceErrorScreen() {
  const t = useTranslations('shipperMobileFlow.states.serviceError');

  return (
    <MobileAppShell forceHideBottomNav>
      <ErrorState title={t('title')} description={t('body')} actionLabel={t('action')} actionHref="/cockpit" />
    </MobileAppShell>
  );
}

export function OperationalSuccessScreen() {
  const t = useTranslations('shipperMobileFlow.states.success');

  return (
    <MobileAppShell forceHideBottomNav>
      <SuccessReceipt title={t('title')} description={t('body')} actionLabel={t('action')} actionHref="/cockpit" />
    </MobileAppShell>
  );
}
