import styles from './cargo-glass-card.module.sass';

export type CargoGlassCardPalette =
  | 'orange'
  | 'purple'
  | 'cyan'
  | 'graySoft'
  | 'dark'
  | 'red';

export type CargoGlassCardLegacyVariant =
  | 'inTransit'
  | 'waiting'
  | 'completed'
  | 'risk'
  | 'neutral';

export type CargoGlassCardVariant = CargoGlassCardPalette | CargoGlassCardLegacyVariant;

export const CARGO_GLASS_CARD_VARIANTS: CargoGlassCardPalette[] = [
  'orange',
  'purple',
  'cyan',
  'graySoft',
  'dark',
  'red',
];

type CargoGlassCardProps = {
  title: string;
  route: string;
  dateTime: string;
  tonnage: string;
  cargoType: string;
  statusLabel: string;
  variant?: CargoGlassCardVariant;
  onClick?: () => void;
  className?: string;
};

const variantClassName: Record<CargoGlassCardVariant, string> = {
  orange: styles.orange,
  purple: styles.purple,
  cyan: styles.cyan,
  graySoft: styles.graySoft,
  dark: styles.dark,
  red: styles.red,

  // Backward-compatible aliases used by previous lab integration.
  inTransit: styles.orange,
  waiting: styles.purple,
  completed: styles.cyan,
  risk: styles.red,
  neutral: styles.graySoft,
};

function cx(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function ClockIcon() {
  return (
    <svg className={styles.clock} viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="26" cy="26" r="21" stroke="currentColor" strokeWidth="4.2" />
      <path
        d="M26 13.5V26.8L34.5 32.1"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CargoGlassCard({
  title,
  route,
  dateTime,
  tonnage,
  cargoType,
  statusLabel,
  variant = 'orange',
  onClick,
  className,
}: CargoGlassCardProps) {
  const rootClassName = cx(
    styles.cardShell,
    variantClassName[variant],
    onClick ? styles.clickable : undefined,
    className,
  );

  const cardContent = (
    <>
      <span className={styles.accentBackPrimary} aria-hidden="true" />
      <span className={styles.accentBackSecondary} aria-hidden="true" />

      <span className={styles.mainCard}>
        <span className={styles.content}>
          <span className={styles.header}>
            <span className={styles.title}>{title}</span>
            <span className={styles.badge}>{statusLabel}</span>
          </span>

          <span className={styles.route}>{route}</span>

          <span className={styles.details}>
            <ClockIcon />
            <span>{dateTime}</span>
            <span className={styles.dot}>·</span>
            <span>{tonnage}</span>
            <span className={styles.dot}>·</span>
            <span className={styles.cargoType}>{cargoType}</span>
          </span>
        </span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={rootClassName}
        onClick={onClick}
        aria-label={`${title}. ${route}. ${statusLabel}.`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <article className={rootClassName} aria-label={`${title}. ${route}. ${statusLabel}.`}>
      {cardContent}
    </article>
  );
}
