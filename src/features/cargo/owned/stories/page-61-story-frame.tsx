import type { CSSProperties, ReactNode } from 'react';

import styles from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass';

type Page61StoryFrameProps = {
  children: ReactNode;
  width?: number | string;
  minHeight?: number | string;
};

export function Page61StoryFrame({
  children,
  width = 386,
  minHeight = 0,
}: Page61StoryFrameProps) {
  const style: CSSProperties = {
    position: 'relative',
    width,
    minWidth: 0,
    height: 'auto',
    minHeight,
    overflow: 'visible',
    background: 'var(--hy-m01-bg)',
  };

  return (
    <div className={`${styles.root} ${styles.canonicalRoot}`} style={style}>
      {children}
    </div>
  );
}
