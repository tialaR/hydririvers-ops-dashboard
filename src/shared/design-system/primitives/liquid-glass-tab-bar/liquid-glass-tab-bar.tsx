import type { ReactNode } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-tab-bar.module.scss';

export type LiquidGlassTabBarVariant = 'expanded' | 'minimized';
export type LiquidGlassTabBarTone = 'auto' | 'light' | 'dark';

export type LiquidGlassTabBarItem = {
  id: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  badge?: string | number;
};

export type LiquidGlassTabBarProps = {
  items: LiquidGlassTabBarItem[];
  activeId: string;
  onChange?: (id: string) => void;
  variant?: LiquidGlassTabBarVariant;
  tone?: LiquidGlassTabBarTone;
  showLabels?: boolean;
  separateSearch?: boolean;
  searchLabel?: string;
  onSearch?: () => void;
  className?: string;
  'aria-label'?: string;
};

const MIN_ITEMS = 2;
const MAX_ITEMS = 5;

function assertItemCount(items: LiquidGlassTabBarItem[]): void {
  if (items.length >= MIN_ITEMS && items.length <= MAX_ITEMS) {
    return;
  }

  const message = `LiquidGlassTabBar: expected between ${MIN_ITEMS} and ${MAX_ITEMS} items, received ${items.length}.`;

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(message);
  }

  console.warn(message);
}

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12.5 11h-.79l-.28-.27A5.5 5.5 0 1 0 11 12.5l.27.28v.79l4.25 4.25 1.27-1.27L12.5 11Zm-5 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Tab bar navigation primitive with Liquid Glass styling.
 *
 * Active tab uses `aria-current="page"` (navigation semantics).
 */
export function LiquidGlassTabBar({
  items,
  activeId,
  onChange,
  variant = 'expanded',
  tone = 'auto',
  showLabels = true,
  separateSearch = false,
  searchLabel = 'Buscar',
  onSearch,
  className = '',
  'aria-label': ariaLabel = 'Navegação principal',
}: LiquidGlassTabBarProps) {
  assertItemCount(items);

  const showTabLabels = showLabels && variant === 'expanded';
  const spreadLayout = separateSearch && items.length <= 3;

  const rootClassName = [
    styles.root,
    styles[`root_${variant}`],
    separateSearch ? styles.rootSeparateSearch : '',
    spreadLayout ? styles.rootSpread : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav
      className={rootClassName}
      aria-label={ariaLabel}
      data-variant={variant}
      data-tone={tone}
      data-separate-search={separateSearch ? 'true' : undefined}
      data-item-count={items.length}
    >
      <div
        className={styles.group}
        data-variant={variant}
        data-tone={tone}
        data-item-count={items.length}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          const tabClassName = [styles.tab, isActive ? styles.tabActive : '']
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={item.id}
              type="button"
              className={tabClassName}
              disabled={item.disabled}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={item.disabled || undefined}
              onClick={() => {
                if (item.disabled) {
                  return;
                }
                onChange?.(item.id);
              }}
            >
              <span className={styles.selection} aria-hidden />
              <span className={styles.icon} aria-hidden>
                {item.icon}
              </span>
              {showTabLabels ? (
                <span className={styles.label}>{item.label}</span>
              ) : null}
              {item.badge != null ? (
                <span
                  className={styles.badge}
                  aria-label={`${item.label}: ${item.badge}`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {separateSearch ? (
        <button
          type="button"
          className={styles.searchButton}
          data-variant={variant}
          data-tone={tone}
          aria-label={searchLabel}
          onClick={onSearch}
        >
          <SearchIcon />
        </button>
      ) : null}
    </nav>
  );
}
