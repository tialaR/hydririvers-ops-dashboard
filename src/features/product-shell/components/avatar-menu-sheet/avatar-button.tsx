'use client';

import { useTranslations } from 'next-intl';
import { useProductShell } from '@/features/product-shell/providers/product-shell-provider';

import styles from './avatar-button.module.sass';

type AvatarButtonProps = {
  onClick: () => void;
};

export function AvatarButton({ onClick }: AvatarButtonProps) {
  const t = useTranslations('shipperMobileFlow.header');
  const { currentUser } = useProductShell();

  return (
    <button type="button" className={styles.button} onClick={onClick} aria-label={t('avatarMenu')}>
      <span className={styles.avatar} aria-hidden>
        {currentUser.avatarInitials}
      </span>
    </button>
  );
}
