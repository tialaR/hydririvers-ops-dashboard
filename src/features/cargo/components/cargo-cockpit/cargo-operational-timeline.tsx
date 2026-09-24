import styles from './cargo-cockpit-panels.module.sass';

export type CargoTimelineEvent = {
  time: string;
  title: string;
  detail: string;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'next';
};

export const cargoTimelineEvents: CargoTimelineEvent[] = [
  { time: '13:20', title: 'Coleta concluída', detail: 'Evidência validada', tone: 'success' },
  { time: '14:05', title: 'Saída de Manaus', detail: 'AIS recebido', tone: 'info' },
  { time: '15:10', title: 'Ocorrência climática', detail: 'ETA recalculado', tone: 'warning' },
  { time: '16:30', title: 'Manifesto pendente', detail: 'ação necessária', tone: 'danger' },
  { time: '18:40', title: 'Próximo marco', detail: 'Chegada estimada', tone: 'next' },
];

export function CargoOperationalTimeline({
  events = cargoTimelineEvents,
}: {
  events?: CargoTimelineEvent[];
}) {
  return (
    <article className={styles.timelinePanel} data-testid="page62-d05-operational-timeline">
      <h3 className={styles.panelTitle}>Linha operacional</h3>
      <ol className={styles.timeline}>
        {events.map((event) => (
          <li className={styles.timelineItem} key={`${event.time}-${event.title}`}>
            <i className={styles.dot} data-tone={event.tone} aria-hidden />
            <span className={styles.time}>{event.time}</span>
            <span className={styles.event}>
              <strong>{event.title}</strong>
              <span>{event.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </article>
  );
}
