'use client';

import type { ReactNode } from 'react';

import { Link } from '@/core/i18n/navigation';

import styles from './BottomNav.module.scss';

export type BottomNavItem = {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  disabled?: boolean;
};

export type BottomNavClassNames = {
  item: string;
  itemActive?: string;
  icon: string;
  label: string;
  activeBubble: string;
  activeIcon: string;
  activeLabel: string;
};

export type BottomNavProps = {
  items: BottomNavItem[];
  activeId: string;
  onItemSelect?: (id: string) => void;
  className?: string;
  ariaLabel?: string;
  classNames: BottomNavClassNames;
};

export function BottomNav({
  items,
  activeId,
  onItemSelect,
  className = '',
  ariaLabel,
  classNames,
}: BottomNavProps) {
  return (
    <nav className={[styles.nav, className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const itemClassName = [
          styles.item,
          classNames.item,
          isActive ? classNames.itemActive ?? '' : '',
        ]
          .filter(Boolean)
          .join(' ');

        const content = isActive ? (
          <span className={classNames.activeBubble}>
            <span className={classNames.activeIcon}>{item.icon}</span>
            <span className={classNames.activeLabel}>{item.label}</span>
          </span>
        ) : (
          <>
            <span className={classNames.icon}>{item.icon}</span>
            <span className={classNames.label}>{item.label}</span>
          </>
        );

        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              className={itemClassName}
              data-active={isActive ? 'true' : 'false'}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={item.disabled ? true : undefined}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            className={itemClassName}
            data-active={isActive ? 'true' : 'false'}
            disabled={item.disabled}
            onClick={() => onItemSelect?.(item.id)}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
