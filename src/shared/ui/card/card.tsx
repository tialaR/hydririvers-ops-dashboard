import type { ComponentPropsWithoutRef } from 'react';
import { Card as CoreCard } from '@/shared/design-system/core/card';
import styles from './card.module.scss';

export type CardProps = ComponentPropsWithoutRef<'article'> & { className?: string };

export function Card({ children, className = '', ...props }: CardProps) {
  return <CoreCard className={`${styles.card} ${className}`} {...props}>{children}</CoreCard>;
}
