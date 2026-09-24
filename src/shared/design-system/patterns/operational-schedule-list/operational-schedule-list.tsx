import { CalendarDays, CheckCircle2, Clock3, Radio } from 'lucide-react';

import styles from './operational-schedule-list.module.sass';

export type OperationalScheduleItem = {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  status: string;
  tone: 'neutral' | 'success' | 'warning' | 'info';
  icon?: 'calendar' | 'check' | 'radio' | 'clock';
};

const iconByKind = {
  calendar: CalendarDays,
  check: CheckCircle2,
  radio: Radio,
  clock: Clock3,
} as const;

export function OperationalScheduleList({
  title,
  items,
}: {
  title?: string;
  items: OperationalScheduleItem[];
}) {
  return (
    <div className={styles.root}>
      {title ? <h4>{title}</h4> : null}
      <div className={styles.list}>
        {items.map((item) => {
          const Icon = iconByKind[item.icon ?? 'calendar'];
          return (
            <article className={styles.item} data-tone={item.tone} key={item.id}>
              <span className={styles.icon}><Icon size={19} aria-hidden /></span>
              <span className={styles.time}>{item.time}</span>
              <span className={styles.copy}>
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </span>
              <span className={styles.status}>{item.status}</span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
