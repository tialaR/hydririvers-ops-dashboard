import styles from './CargoEtaBlock.module.scss';

export type CargoEtaMetric = {
  label: string;
  value: string;
  tone?: 'success';
};

export type CargoEtaBlockProps = {
  variant?: 'card' | 'sheet';
  label?: string;
  value?: string;
  metrics?: CargoEtaMetric[];
  className?: string;
};

export function CargoEtaBlock({
  variant = 'card',
  label = 'ETA',
  value = '',
  metrics,
  className,
}: CargoEtaBlockProps) {
  if (variant === 'sheet') {
    const items = metrics ?? [
      { label: 'ETA', value },
      { label: 'Entrega prevista', value: '', tone: 'success' as const },
    ];

    return (
      <div className={[styles.sheetStats, className].filter(Boolean).join(' ')}>
        {items.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong data-tone={item.tone}>{item.value}</strong>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
