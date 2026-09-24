import styles from './segmented-goal-meter.module.sass';

type SegmentedGoalMeterProps = {
  value: number;
  max?: number;
  segments?: number;
  label: string;
  valueLabel?: string;
  targetLabel?: string;
  tone?: 'neutral' | 'success' | 'warning';
};

export function SegmentedGoalMeter({
  value,
  max = 100,
  segments = 18,
  label,
  valueLabel,
  targetLabel,
  tone = 'neutral',
}: SegmentedGoalMeterProps) {
  const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  const filled = Math.round(ratio * segments);
  const accessibleLabel = label + ': ' + (valueLabel ?? String(value)) + ' de ' + (targetLabel ?? String(max));

  return (
    <div className={styles.root} data-tone={tone} aria-label={accessibleLabel}>
      <div className={styles.header}>
        <span>{label}</span>
        <strong>{valueLabel ?? value}</strong>
      </div>
      <div className={styles.track} aria-hidden>
        {Array.from({ length: segments }, (_, index) => (
          <i key={index} data-filled={index < filled ? 'true' : 'false'} />
        ))}
      </div>
      <div className={styles.footer}>
        <span>{Math.round(ratio * 100)}%</span>
        <span>{targetLabel ?? 'meta ' + max}</span>
      </div>
    </div>
  );
}
