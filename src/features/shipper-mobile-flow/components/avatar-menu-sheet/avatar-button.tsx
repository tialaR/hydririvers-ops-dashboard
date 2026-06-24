'use client';

import { useTranslations } from 'next-intl';
import { useShipperFlow } from '@/features/shipper-mobile-flow/providers/shipper-flow-provider';

import styles from './avatar-button.module.sass';

type AvatarButtonProps = {
  onClick: () => void;
};

export function AvatarButton({ onClick }: AvatarButtonProps) {
  const t = useTranslations('shipperMobileFlow.header');
  const { currentUser } = useShipperFlow();

  return (
    <button type="button" className={styles.button} onClick={onClick} aria-label={t('avatarMenu')}>
      <span className={styles.avatar} aria-hidden>
        {currentUser.avatarInitials}
      </span>
    </button>
  );
}
