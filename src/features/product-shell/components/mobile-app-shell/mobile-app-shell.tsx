'use client';

import type { ReactNode } from 'react';
import { usePathname } from '@/core/i18n/navigation';
import { useTheme } from '@/shared/providers/theme-provider';
import { ProductShellFrame } from '@/shared/layout/product-shell-frame/product-shell-frame';
import { resolveShellConfig } from '@/features/product-shell/domain/product-shell-navigation';
import { AppHeader } from '@/features/product-shell/components/app-header/app-header';
import { BottomNav } from '@/features/product-shell/components/bottom-nav/bottom-nav';
import { ConfirmationSheet } from '@/features/product-shell/components/confirmation-sheet/confirmation-sheet';
import { AvatarMenuSheet } from '@/features/product-shell/components/avatar-menu-sheet/avatar-menu-sheet';
import { useProductShell } from '@/features/product-shell/providers/product-shell-provider';

import styles from './mobile-app-shell.module.sass';

type MobileAppShellProps = {
  children: ReactNode;
  title?: string;
  backHref?: string;
  forceHideBottomNav?: boolean;
  fullBleedContent?: boolean;
};

export function MobileAppShell({ children, title, backHref, forceHideBottomNav, fullBleedContent }: MobileAppShellProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const shell = resolveShellConfig(pathname);
  const { confirmation, closeConfirmation, avatarSheetOpen, setAvatarSheetOpen } = useProductShell();
  const showBottomNav = !forceHideBottomNav && shell.showBottomNav;

  const header = shell.showHeader ? (
    <AppHeader title={title} mode={shell.headerMode} backHref={backHref} onAvatarClick={() => setAvatarSheetOpen(true)} />
  ) : null;

  const navigation = showBottomNav ? <BottomNav /> : null;

  const overlays = (
    <>
      <AvatarMenuSheet open={avatarSheetOpen} onClose={() => setAvatarSheetOpen(false)} />
      {confirmation ? (
        <ConfirmationSheet
          open
          title={confirmation.title}
          description={confirmation.description}
          confirmLabel={confirmation.confirmLabel}
          cancelLabel={confirmation.cancelLabel}
          onConfirm={() => {
            confirmation.onConfirm();
            closeConfirmation();
          }}
          onCancel={closeConfirmation}
        />
      ) : null}
    </>
  );

  return (
    <ProductShellFrame
      rootClassName={styles.root}
      mainClassName={showBottomNav ? styles.main : styles.mainNoNav}
      contentClassName={`${styles.content} ${fullBleedContent ? styles.contentBleed : ''}`}
      rootAttributes={{ 'data-theme': theme, 'data-shipper-shell': '' }}
      header={header}
      navigation={navigation}
      overlays={overlays}
    >
      {children}
    </ProductShellFrame>
  );
}
