'use client';

import type { ReactNode } from 'react';

import styles from './Surface.module.scss';

export type SurfaceTone = 'default' | 'glass' | 'elevated';

export type SurfaceProps = {
  children: ReactNode;
  tone?: SurfaceTone;
  className?: string;
  as?: 'div' | 'section' | 'article';
};

export function Surface({ children, tone = 'glass', className = '', as: Tag = 'div' }: SurfaceProps) {
  return (
    <Tag className={[styles.surface, styles[`tone_${tone}`], className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}
