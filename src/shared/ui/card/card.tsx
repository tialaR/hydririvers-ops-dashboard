import type { ComponentPropsWithoutRef } from 'react';
import styles from './card.module.scss';

export type CardProps = ComponentPropsWithoutRef<'article'> & { className?: string };

export function Card({ children, className = '', ...props }: CardProps) {
  return <article className={`${styles.card} ${className}`} {...props}>{children}</article>;
}
