import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-menu.module.scss';

export type LiquidGlassEditMenuTone = 'auto' | 'light' | 'dark';

export type LiquidGlassEditMenuItem = {
  id: string;
  label: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

export type LiquidGlassEditMenuProps = {
  items: LiquidGlassEditMenuItem[];
  tone?: LiquidGlassEditMenuTone;
  className?: string;
  'aria-label'?: string;
};

function isInteractiveEnabled(item: LiquidGlassEditMenuItem): boolean {
  return !item.disabled && typeof item.onSelect === 'function';
}

export function LiquidGlassEditMenu({
  items,
  tone = 'auto',
  className = '',
  'aria-label': ariaLabel = 'Edit menu',
}: LiquidGlassEditMenuProps) {
  const rootClassNames = [styles.editMenuShell, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="menu"
      aria-label={ariaLabel}
      className={rootClassNames}
      data-tone={tone}
    >
      {items.map((item, index) => {
        const showSeparator = index < items.length - 1;

        return (
          <div key={item.id} className={styles.editMenuItemBlock}>
            {showSeparator ? <span className={styles.editMenuSeparator} aria-hidden /> : null}

            <button
              type="button"
              role="menuitem"
              className={[
                styles.editMenuItemButton,
                item.destructive ? styles.menuItemDestructive : '',
                item.disabled ? styles.menuItemDisabled : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={item.disabled}
              aria-disabled={item.disabled || undefined}
              data-item-id={item.id}
              onClick={() => {
                if (!isInteractiveEnabled(item)) return;
                item.onSelect?.();
              }}
            >
              <span className={styles.editMenuItemLabel}>{item.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

