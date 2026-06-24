'use client';

import type { ReactNode } from 'react';
import { usePathname } from '@/core/i18n/navigation';
import { useTheme } from '@/shared/providers/theme-provider';
import { resolveShellConfig } from '@/features/shipper-mobile-flow/domain/shipper-nav-domain';
import { AppHeader } from '@/features/shipper-mobile-flow/components/app-header/app-header';
import { BottomNav } from '@/features/shipper-mobile-flow/components/bottom-nav/bottom-nav';
import { ConfirmationSheet } from '@/features/shipper-mobile-flow/components/confirmation-sheet/confirmation-sheet';
import { AvatarMenuSheet } from '@/features/shipper-mobile-flow/components/avatar-menu-sheet/avatar-menu-sheet';
import { useShipperFlow } from '@/features/shipper-mobile-flow/providers/shipper-flow-provider';

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
  const { confirmation, closeConfirmation, avatarSheetOpen, setAvatarSheetOpen } = useShipperFlow();
  const showBottomNav = !forceHideBottomNav && shell.showBottomNav;

  return (
    <div className={styles.root} data-theme={theme} data-shipper-shell>
      {shell.showHeader ? (
        <AppHeader title={title} mode={shell.headerMode} backHref={backHref} onAvatarClick={() => setAvatarSheetOpen(true)} />
      ) : null}
      <div className={showBottomNav ? styles.main : styles.mainNoNav}>
        <div className={`${styles.content} ${fullBleedContent ? styles.contentBleed : ''}`}>{children}</div>
      </div>
      {showBottomNav ? <BottomNav /> : null}
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
    </div>
  );
}
