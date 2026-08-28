'use client';
import { useTranslations } from 'next-intl';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { ErrorState, SuccessReceipt } from '@/features/product-shell/components/product-state/product-state';
export function OfflineScreen() { const t = useTranslations('shipperMobileFlow.states.offline'); return <MobileAppShell forceHideBottomNav><ErrorState title={t('title')} description={t('body')} actionLabel={t('action')} actionHref="/cockpit" /></MobileAppShell>; }
export function ServiceErrorScreen() { const t = useTranslations('shipperMobileFlow.states.serviceError'); return <MobileAppShell forceHideBottomNav><ErrorState title={t('title')} description={t('body')} actionLabel={t('action')} actionHref="/cockpit" /></MobileAppShell>; }
export function OperationalSuccessScreen() { const t = useTranslations('shipperMobileFlow.states.success'); return <MobileAppShell forceHideBottomNav><SuccessReceipt title={t('title')} description={t('body')} actionLabel={t('action')} actionHref="/cockpit" /></MobileAppShell>; }
