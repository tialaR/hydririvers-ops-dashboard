import type { ReactNode } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-menu.module.scss';

export type LiquidGlassMenuSize = 'sm' | 'md';
export type LiquidGlassMenuTone = 'auto' | 'light' | 'dark';

export type LiquidGlassMenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  subtitle?: string;
  disabled?: boolean;
  destructive?: boolean;
  hasSubmenu?: boolean;
  sectionTitle?: string;
  onSelect?: () => void;
};

export type LiquidGlassMenuProps = {
  items: LiquidGlassMenuItem[];
  tone?: LiquidGlassMenuTone;
  size?: LiquidGlassMenuSize;
  className?: string;
  'aria-label'?: string;
};

function isInteractiveEnabled(item: LiquidGlassMenuItem): boolean {
  return !item.disabled && typeof item.onSelect === 'function';
}

export function LiquidGlassMenu({
  items,
  tone = 'auto',
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'Menu',
}: LiquidGlassMenuProps) {
  const rootClassNames = [
    styles.menuShell,
    styles[`menuShell_${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="menu"
      aria-label={ariaLabel}
      className={rootClassNames}
      data-tone={tone}
      data-size={size}
    >
      {items.map((item) => (
        <div key={item.id} className={styles.menuItemBlock}>
          {item.sectionTitle?.trim() ? (
            <div className={styles.sectionTitle} aria-hidden="true">
              {item.sectionTitle}
            </div>
          ) : null}

          <button
            type="button"
            className={[
              styles.menuItemButton,
              item.disabled ? styles.menuItemDisabled : '',
              item.destructive ? styles.menuItemDestructive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={item.disabled}
            aria-disabled={item.disabled || undefined}
            role="menuitem"
            data-item-id={item.id}
            data-destructive={item.destructive ? 'true' : undefined}
            onClick={() => {
              if (!isInteractiveEnabled(item)) return;
              item.onSelect?.();
            }}
          >
            <span className={styles.itemLeading} aria-hidden="true">
              {item.icon ? (
                <span className={styles.iconSlot}>{item.icon}</span>
              ) : null}
            </span>

            <span className={styles.itemText}>
              <span className={styles.itemLabel}>{item.label}</span>
              {item.subtitle ? (
                <span className={styles.itemSubtitle}>{item.subtitle}</span>
              ) : null}
            </span>

            <span className={styles.itemTrailing} aria-hidden="true">
              {item.shortcut ? (
                <span className={styles.shortcut}>{item.shortcut}</span>
              ) : null}
              {item.hasSubmenu ? (
                <span className={styles.submenuChevron}>›</span>
              ) : null}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}

