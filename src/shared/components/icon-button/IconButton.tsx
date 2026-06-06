'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import {
  renderIconButtonIcon,
  type IconButtonIconName,
} from './icon-button-icons';
import styles from './IconButton.module.scss';

export type IconButtonSize = 'sm' | 'md' | 'lg';

/** Semantic placement only — does not change the visual shell. */
export type IconButtonRole = 'header' | 'page' | 'field' | 'sheet';

/**
 * @deprecated Use default (v2) shell + `iconButtonRole` instead. Kept as alias for role mapping only.
 */
export type IconButtonSemanticVariant = 'chrome' | 'pageAction' | 'fieldAction' | 'sheetClose';

/** Legacy variants for desktop/admin dark surfaces only. */
export type IconButtonLegacyVariant =
  | 'default'
  | 'light'
  | 'filter'
  | 'theme'
  | 'close'
  | 'map'
  | 'alert';

export type IconButtonVariant = 'v2' | IconButtonSemanticVariant | IconButtonLegacyVariant;

const LEGACY_VISUAL_VARIANTS = new Set<IconButtonLegacyVariant>([
  'default',
  'light',
  'filter',
  'theme',
  'close',
  'map',
  'alert',
]);

const SEMANTIC_ROLE_BY_VARIANT: Record<IconButtonSemanticVariant, IconButtonRole> = {
  chrome: 'header',
  pageAction: 'page',
  fieldAction: 'field',
  sheetClose: 'sheet',
};

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  ariaLabel: string;
  /** Custom icon node; ignored when `iconName` is set (except `language`, which uses `icon` as abbrev). */
  icon?: ReactNode;
  iconName?: IconButtonIconName;
  /**
   * @deprecated Prefer `iconButtonRole`. Visual variants no longer change the shell.
   */
  variant?: IconButtonVariant;
  iconButtonRole?: IconButtonRole;
  size?: IconButtonSize;
  /** @deprecated Use `active`. */
  isActive?: boolean;
  active?: boolean;
  /** @deprecated Use `badgeContent`. */
  badgeCount?: number;
  badgeContent?: number | string;
  loading?: boolean;
};

function resolveIconButtonRole(
  variant: IconButtonVariant,
  iconButtonRole?: IconButtonRole,
): IconButtonRole | undefined {
  if (iconButtonRole) {
    return iconButtonRole;
  }

  if (variant in SEMANTIC_ROLE_BY_VARIANT) {
    return SEMANTIC_ROLE_BY_VARIANT[variant as IconButtonSemanticVariant];
  }

  if (variant === 'light' || variant === 'filter') {
    return variant === 'light' ? 'header' : 'field';
  }

  if (variant === 'close') {
    return 'sheet';
  }

  if (variant === 'default') {
    return 'page';
  }

  return undefined;
}

function resolveVisualVariant(variant: IconButtonVariant): IconButtonVariant {
  if (LEGACY_VISUAL_VARIANTS.has(variant as IconButtonLegacyVariant)) {
    return variant;
  }

  return 'v2';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    ariaLabel,
    icon,
    iconName,
    variant = 'v2',
    iconButtonRole,
    size = 'md',
    isActive = false,
    active,
    badgeCount,
    badgeContent,
    loading = false,
    className = '',
    disabled = false,
    type = 'button',
    ...props
  },
  ref,
) {
  const resolvedActive = active ?? isActive;
  const resolvedBadge = badgeContent ?? badgeCount;
  const showBadge =
    resolvedBadge !== undefined &&
    resolvedBadge !== '' &&
    (typeof resolvedBadge === 'number' ? resolvedBadge > 0 : true);

  const visualVariant = resolveVisualVariant(variant);
  const role = resolveIconButtonRole(variant, iconButtonRole);
  const resolvedIcon =
    icon ??
    (iconName != null
      ? renderIconButtonIcon(iconName, iconName === 'language' ? icon : undefined)
      : null);

  return (
    <button
      ref={ref}
      type={type}
      className={[
        styles.button,
        styles[`variant_${visualVariant}`],
        visualVariant === 'v2' ? styles.shell : '',
        styles[`size_${size}`],
        resolvedActive ? styles.isActive : '',
        loading ? styles.isLoading : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-icon-button-global={visualVariant === 'v2' ? 'true' : undefined}
      data-icon-button-role={role}
      aria-label={ariaLabel}
      aria-pressed={props['aria-pressed'] ?? (resolvedActive ? true : undefined)}
      aria-busy={loading ? true : undefined}
      data-active={resolvedActive ? 'true' : undefined}
      data-loading={loading ? 'true' : undefined}
      disabled={disabled || loading}
      {...props}
    >
      <span className={styles.icon} aria-hidden>
        {resolvedIcon}
      </span>
      {showBadge ? <span className={styles.badge}>{resolvedBadge}</span> : null}
    </button>
  );
});
