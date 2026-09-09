import type { ChangeEvent } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-switch.module.scss';

export type LiquidGlassSwitchTone = 'auto' | 'light' | 'dark';

export type LiquidGlassSwitchProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  tone?: LiquidGlassSwitchTone;
  label?: string;
  'aria-label'?: string;
  className?: string;
};

function assertAccessibility(label: string | undefined, ariaLabel: string | undefined): void {
  const hasLabel = Boolean(label?.trim());
  const hasAriaLabel = Boolean(ariaLabel?.trim());

  if (hasLabel || hasAriaLabel) {
    return;
  }

  const message =
    'LiquidGlassSwitch: provide a non-empty label or aria-label prop.';

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(message);
  }

  console.warn(message);
}

/**
 * Toggle switch primitive with Liquid Glass styling (Apple Toggle / Switch recipe).
 */
export function LiquidGlassSwitch({
  checked,
  onChange,
  disabled = false,
  tone = 'auto',
  label,
  className = '',
  'aria-label': ariaLabel,
}: LiquidGlassSwitchProps) {
  assertAccessibility(label, ariaLabel);

  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  const switchControl = (
    <span className={styles.switchControl}>
      <input
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        aria-label={label ? undefined : ariaLabel}
        onChange={handleChange}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
    </span>
  );

  if (label) {
    return (
      <label
        className={rootClassName}
        data-tone={tone}
        data-checked={checked ? 'true' : 'false'}
      >
        <span className={styles.labelText}>{label}</span>
        {switchControl}
      </label>
    );
  }

  return (
    <span
      className={rootClassName}
      data-tone={tone}
      data-checked={checked ? 'true' : 'false'}
    >
      {switchControl}
    </span>
  );
}
