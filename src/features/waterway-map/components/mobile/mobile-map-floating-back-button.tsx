'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { useRouter } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';

import styles from './mobile-hydroway-map.module.scss';

type MobileMapFloatingBackButtonProps = {
  cargoId: string;
};

export function MobileMapFloatingBackButton({ cargoId }: MobileMapFloatingBackButtonProps) {
  const tMap = useTranslations('operationsBoard.map');
  const router = useRouter();
  const fallbackHref = intlAppPaths.cargos.cargoDetail(cargoId);

  const handleClose = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }, [fallbackHref, router]);

  return (
    <button
      type="button"
      className={styles.floatingBackButton}
      onClick={handleClose}
      aria-label={tMap('mapClose')}
      data-testid="hydroway-map-mobile-back"
    >
      <X size={18} strokeWidth={2.2} aria-hidden />
    </button>
  );
}
