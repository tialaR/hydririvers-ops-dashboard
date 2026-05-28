import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-button.module.scss';

export type LiquidGlassButtonVariant = 'text' | 'icon';
export type LiquidGlassButtonTone = 'accent' | 'neutral' | 'destructive';
export type LiquidGlassButtonFill = 'filled' | 'tinted' | 'plain' | 'glass';
export type LiquidGlassButtonSize = 'sm' | 'md' | 'lg';
export type LiquidGlassButtonThemeTone = 'auto' | 'light' | 'dark';

export type LiquidGlassButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> & {
  children?: ReactNode;
  icon?: ReactNode;
  label?: string;
  variant?: LiquidGlassButtonVariant;
  tone?: LiquidGlassButtonTone;
  fill?: LiquidGlassButtonFill;
  size?: LiquidGlassButtonSize;
  themeTone?: LiquidGlassButtonThemeTone;
  selected?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

function resolveTextContent(
  variant: LiquidGlassButtonVariant,
  children: ReactNode | undefined,
  label: string | undefined,
): ReactNode {
  if (variant === 'icon') {
    return null;
  }

  if (children != null && children !== '') {
    return children;
  }

  if (label != null && label !== '') {
    return label;
  }

  return null;
}

function assertIconAccessibility(
  variant: LiquidGlassButtonVariant,
  ariaLabel: string | undefined,
): void {
  if (variant !== 'icon' || ariaLabel?.trim()) {
    return;
  }

  const message =
    'LiquidGlassButton: variant="icon" requires a non-empty aria-label prop.';

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(message);
  }

  console.warn(message);
}

export function LiquidGlassButton({
  children,
  icon,
  label,
  variant = 'text',
  tone = 'neutral',
  fill = 'glass',
  size = 'md',
  themeTone = 'auto',
  selected = false,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  'aria-label': ariaLabel,
  ...props
}: LiquidGlassButtonProps) {
  assertIconAccessibility(variant, ariaLabel);

  const textContent = resolveTextContent(variant, children, label);
  const hasTextContent = textContent != null && textContent !== '';
  const hasIconContent = icon != null;

  if (variant === 'text' && !hasTextContent) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        'LiquidGlassButton: variant="text" requires non-empty children or label.',
      );
    }
  }

  if (variant === 'icon' && !hasIconContent) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('LiquidGlassButton: variant="icon" requires an icon prop.');
    }
  }

  const classNames = [
    styles.button,
    styles[`variant_${variant}`],
    styles[`tone_${tone}`],
    styles[`fill_${fill}`],
    styles[`size_${size}`],
    selected ? styles.selected : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      data-variant={variant}
      data-tone={tone}
      data-fill={fill}
      data-size={size}
      data-theme-tone={themeTone}
      data-selected={selected ? 'true' : undefined}
      disabled={disabled}
      aria-label={variant === 'icon' ? ariaLabel : undefined}
      aria-pressed={selected || undefined}
      onClick={onClick}
      {...props}
    >
      <span className={styles.content}>
        {variant === 'icon' ? (
          <span className={styles.iconSlot} aria-hidden>
            {icon}
          </span>
        ) : (
          <span className={styles.label}>{textContent}</span>
        )}
      </span>
    </button>
  );
}
