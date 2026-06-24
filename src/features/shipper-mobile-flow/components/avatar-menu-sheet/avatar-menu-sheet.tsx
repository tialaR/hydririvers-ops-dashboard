'use client';

import { ChevronRight, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { BottomSheet } from '@/features/shipper-mobile-flow/components/bottom-sheet/bottom-sheet';
import { useShipperFlow } from '@/features/shipper-mobile-flow/providers/shipper-flow-provider';

import styles from '../bottom-sheet/bottom-sheet.module.sass';

const MENU_KEYS = ['profile', 'company', 'preferences', 'security'] as const;

type AvatarMenuSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function AvatarMenuSheet({ open, onClose }: AvatarMenuSheetProps) {
  const t = useTranslations('shipperMobileFlow.avatarMenu');
  const { currentUser } = useShipperFlow();

  return (
    <BottomSheet open={open} onClose={onClose} title={currentUser.name} ariaLabel={t('label')}>
      <p className={styles.body}>{currentUser.company}</p>
      <div className={styles.actions}>
        {MENU_KEYS.map((key) => (
          <Link key={key} href="/perfil" className={styles.menuItem} onClick={onClose}>
            {t(key)}
            <ChevronRight size={16} aria-hidden />
          </Link>
        ))}
        <Link href="/entrar" className={`${styles.menuItem} ${styles.danger}`} onClick={onClose}>
          <span>{t('logout')}</span>
          <LogOut size={16} aria-hidden />
        </Link>
      </div>
    </BottomSheet>
  );
}
