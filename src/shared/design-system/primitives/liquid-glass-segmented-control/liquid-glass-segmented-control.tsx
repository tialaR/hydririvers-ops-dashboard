import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-segmented-control.module.scss';

export type LiquidGlassSegmentedControlSize = 'sm' | 'md';
export type LiquidGlassSegmentedControlTone = 'auto' | 'light' | 'dark';

export type LiquidGlassSegmentedControlItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

export type LiquidGlassSegmentedControlProps = {
  items: LiquidGlassSegmentedControlItem[];
  value: string;
  onChange?: (id: string) => void;
  size?: LiquidGlassSegmentedControlSize;
  tone?: LiquidGlassSegmentedControlTone;
  fullWidth?: boolean;
  className?: string;
  'aria-label'?: string;
};

const MIN_ITEMS = 2;
const MAX_ITEMS = 5;

function assertItemCount(items: LiquidGlassSegmentedControlItem[]): void {
  if (items.length >= MIN_ITEMS && items.length <= MAX_ITEMS) {
    return;
  }

  const message = `LiquidGlassSegmentedControl: expected between ${MIN_ITEMS} and ${MAX_ITEMS} items, received ${items.length}.`;

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(message);
  }

  console.warn(message);
}

/**
 * Segmented control primitive with Liquid Glass styling (Apple Segmented Control recipe).
 */
export function LiquidGlassSegmentedControl({
  items,
  value,
  onChange,
  size = 'sm',
  tone = 'auto',
  fullWidth = true,
  className = '',
  'aria-label': ariaLabel = 'Controle segmentado',
}: LiquidGlassSegmentedControlProps) {
  assertItemCount(items);

  const rootClassName = [
    styles.root,
    styles[`root_${size}`],
    fullWidth ? styles.rootFullWidth : styles.rootInline,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="radiogroup"
      className={rootClassName}
      aria-label={ariaLabel}
      data-size={size}
      data-tone={tone}
      data-full-width={fullWidth ? 'true' : 'false'}
      data-item-count={items.length}
    >
      {items.map((item) => {
        const isSelected = item.id === value;
        const segmentClassName = [
          styles.segment,
          isSelected ? styles.segmentSelected : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={item.id}
            type="button"
            className={segmentClassName}
            disabled={item.disabled}
            aria-pressed={isSelected}
            aria-disabled={item.disabled || undefined}
            onClick={() => {
              if (item.disabled || isSelected) {
                return;
              }
              onChange?.(item.id);
            }}
          >
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
