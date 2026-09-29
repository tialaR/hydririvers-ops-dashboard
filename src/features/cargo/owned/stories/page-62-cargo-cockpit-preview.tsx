'use client';

import {
  Activity,
  Anchor,
  Clock3,
  Construction,
  Folder,
  Info,
  MapPin,
  Navigation,
  Waves,
  Radio,
  Route,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useState } from 'react';

import {
  HydroLevelTrendChart,
  OperationalGaugeChart,
  OperationalTelemetryOverviewChart,
  type OperationalTelemetryMetric,
} from '@/shared/design-system/patterns/operational-chart';
import { ShipmentCard } from '@/features/cargo/components/shipment-card/shipment-card';
import { OperationalAlert } from '@/shared/design-system/components/operational-alert';

import styles from './page-62-cargo-cockpit-preview.module.sass';

type WorkspaceMode = 'cockpit' | 'timeline';

type Page62CargoCockpitPreviewProps = {
  initialMode?: WorkspaceMode;
  onOverview?: () => void;
  onDocuments?: () => void;
};

const telemetryLabels = [
  '08h', '08:30', '09h', '09:30', '10h', '10:30', '11h', '11:30',
  '12h', '12:30', '13h', '13:30', '14h', '14:30', '15h', '15:30',
  '16h', '16:30', '17h', '17:30', '18h', '18:30', '19h', '19:30',
  '20h', '20:30', '21h', '21:30', '22h',
];

const telemetryMetrics: OperationalTelemetryMetric[] = [
  {
    name: 'Velocidade',
    unit: ' km/h',
    values: [
      10.8, 11.1, 11.6, 11.9, 11.7, 11.4, 11.2, 11.0, 11.1, 11.5,
      12.0, 12.3, 12.5, 12.7, 12.6, 12.3, 12.0, 11.8, 12.0, 12.6,
      12.9, 13.0, 12.8, 12.7, 12.9, 13.2, 13.1, 13.0, 12.9,
    ],
  },
  {
    name: 'Combustível',
    unit: '%',
    values: [
      78, 78, 77, 77, 76, 76, 75, 75, 74, 74,
      73, 73, 72, 72, 72, 71, 71, 70, 70, 69,
      69, 68, 68, 67, 67, 66, 66, 65, 65,
    ],
  },
  {
    name: 'Temperatura',
    unit: '°C',
    values: [
      68, 68, 69, 69, 69, 70, 70, 70, 70, 70,
      71, 71, 71, 71, 71, 71, 71, 72, 72, 72,
      72, 72, 72, 71, 71, 71, 70, 70, 70,
    ],
  },
];

const hydroGaugeLevelsM = [
  7.42, 7.40, 7.38, 7.36, 7.34, 7.31, 7.29, 7.27, 7.25, 7.23,
  7.22, 7.20, 7.18, 7.17, 7.16, 7.15, 7.13, 7.12, 7.10, 7.08,
  7.06, 7.04, 7.03, 7.01, 7.00, 6.98, 6.96, 6.95, 6.94,
];

const hydroContext = {
  riverGaugeLevelsM: hydroGaugeLevelsM,
  operatingDraftM: 2.80,
  requiredDepthM: 3.90,
  sourceLabel: 'Fonte prevista: ANA/Hidroweb',
  dataAgeMin: 18,
  demo: true,
};

const cargoes = [
  { code: '#HY-247-819', label: 'Atenção', tone: 'delayed' as const, selected: true },
  { code: '#HY-319-552', label: 'Em trânsito', tone: 'inTransit' as const, selected: false },
  { code: '#HY-411-092', label: 'Entregue', tone: 'completed' as const, selected: false },
];

type TimelineEventKind =
  | 'departure'
  | 'hydro'
  | 'restriction'
  | 'dredging'
  | 'position'
  | 'arrival';

type TimelineEventTone = 'success' | 'monitor' | 'warning' | 'info' | 'current' | 'future';
type TimelineEventPhase = 'past' | 'current' | 'future';

const timelineEventIcons: Record<TimelineEventKind, LucideIcon> = {
  departure: Route,
  hydro: Waves,
  restriction: ShieldAlert,
  dredging: Construction,
  position: Navigation,
  arrival: Anchor,
};

const timelineEvents: Array<{
  month: string;
  day: string;
  title: string;
  place: string;
  time: string;
  detail: string;
  status: string;
  tone: TimelineEventTone;
  phase: TimelineEventPhase;
  kind: TimelineEventKind;
  source?: string;
  context?: string;
}> = [
  {
    month: 'SET',
    day: '22',
    title: 'Saída confirmada',
    place: 'Manaus',
    time: '08:10',
    detail: 'Documentação operacional validada e carga liberada para o corredor hidroviário.',
    status: 'Concluído',
    tone: 'success',
    phase: 'past',
    kind: 'departure',
    source: 'MDF-e + CT-e · validados',
  },
  {
    month: 'SET',
    day: '23',
    title: 'Vazante em acompanhamento',
    place: 'Amazonas–Solimões',
    time: '06:20',
    detail: 'A cota apresenta tendência de queda; o efeito operacional segue dentro da margem planejada.',
    status: 'Monitorar',
    tone: 'monitor',
    phase: 'past',
    kind: 'hydro',
    source: 'DEMO · fonte prevista: ANA/Hidroweb · 18 min',
    context: 'Cota −1,5 m em 5 dias',
  },
  {
    month: 'SET',
    day: '24',
    title: 'Restrição temporária no trecho',
    place: 'Próximo a Parintins',
    time: '11:40',
    detail: 'Trecho requer atenção adicional ao calado e à sinalização antes da passagem.',
    status: 'Atenção',
    tone: 'warning',
    phase: 'past',
    kind: 'restriction',
    source: 'DEMO · aviso operacional simulado',
    context: 'Calado operacional 2,80 m',
  },
  {
    month: 'SET',
    day: '25',
    title: 'Dragagem programada',
    place: 'Trecho crítico monitorado',
    time: '07:30',
    detail: 'Janela de manutenção prevista no corredor; sem bloqueio projetado para a viagem atual.',
    status: 'Informativo',
    tone: 'info',
    phase: 'past',
    kind: 'dredging',
    source: 'DEMO · referência operacional DNIT',
  },
  {
    month: 'SET',
    day: '27',
    title: 'Posição atual',
    place: 'Amazonas–Solimões',
    time: 'agora',
    detail: 'Telemetria estável, rota ativa e nenhum bloqueio crítico confirmado no trecho atual.',
    status: 'Agora',
    tone: 'current',
    phase: 'current',
    kind: 'position',
    source: 'GPS + AIS · 4 min',
    context: '68% da rota concluída',
  },
  {
    month: 'SET',
    day: '29',
    title: 'Janela de atracação',
    place: 'Santarém',
    time: '18:40',
    detail: 'Chegada permanece dentro da janela prevista, condicionada à validação final do manifesto.',
    status: 'Próximo',
    tone: 'future',
    phase: 'future',
    kind: 'arrival',
    source: 'Planejamento da viagem · DEMO',
  },
];

const evidence = [
  {
    label: 'Manifesto',
    count: '4 arquivos',
    meta: 'Atualizado há 12 min',
    status: 'Atenção',
    tone: 'warning',
  },
  {
    label: 'CT-e',
    count: '2 arquivos',
    meta: 'Atualizado há 26 min',
    status: 'Validado',
    tone: 'success',
  },
  {
    label: 'Seguro',
    count: '3 arquivos',
    meta: 'Atualizado hoje',
    status: 'Ativo',
    tone: 'success',
  },
];

const tabs: Array<{ id: WorkspaceMode | 'overview' | 'documents' | 'activity'; label: string }> = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'cockpit', label: 'Cockpit' },
  { id: 'timeline', label: 'Linha operacional' },
  { id: 'documents', label: 'Documentos' },
  { id: 'activity', label: 'Atividade' },
];

export function Page62CargoCockpitPreview({
  initialMode = 'cockpit',
  onOverview,
  onDocuments,
}: Page62CargoCockpitPreviewProps) {
  const [mode, setMode] = useState<WorkspaceMode>(initialMode);

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className={styles.root} data-testid="page62-cargo-cockpit">
        <aside className={styles.master}>
          <div className={styles.masterHeader}>
            <div>
              <small>CARTEIRA</small>
              <h2>Minhas Cargas</h2>
            </div>
            <span>3 exigem atenção</span>
          </div>

          <div className={styles.cardList}>
            {cargoes.map((cargo) => (
              <ShipmentCard
                key={cargo.code}
                code={cargo.code}
                statusLabel={cargo.label}
                statusTone={cargo.tone}
                origin={{ stateCode: 'AM', stateLabel: 'Amazonas', city: 'Manaus' }}
                destination={{ stateCode: 'PA', stateLabel: 'Pará', city: 'Santarém' }}
                cargoLabel="Carga"
                cargoValue="Equipamentos eletrônicos"
                etaValue="08:45"
                etaSuffix="Hoje"
                selected={cargo.selected}
              />
            ))}
          </div>
        </aside>

        <section className={styles.workspace} data-testid="cockpit-workspace">
          <header className={styles.workspaceHeader}>
            <div className={styles.selectedCargo}>
              <small>CARGA SELECIONADA</small>
              <strong>#HY-247-819</strong>
              <span>Manaus → Santarém</span>
            </div>

            <nav aria-label="Navegação da carga">
              {tabs.map((tab) => {
                const interactive =
                  tab.id === 'cockpit' ||
                  tab.id === 'timeline' ||
                  (tab.id === 'overview' && Boolean(onOverview)) ||
                  (tab.id === 'documents' && Boolean(onDocuments));
                const active = tab.id === mode;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={active ? styles.activeTab : ''}
                    disabled={!interactive}
                    onClick={() => {
                      if (tab.id === 'overview') {
                        onOverview?.();
                        return;
                      }
                      if (tab.id === 'documents') {
                        onDocuments?.();
                        return;
                      }
                      if (tab.id === 'cockpit' || tab.id === 'timeline') setMode(tab.id);
                    }}
                  >
                    {tab.label}
                    {active ? <motion.i layoutId="page62-active-tab" /> : null}
                  </button>
                );
              })}
            </nav>
          </header>

          {mode === 'cockpit' ? (
            <div className={styles.metricGrid} data-testid="cockpit-kpi-grid">
              <motion.article layout className={styles.progressMetric} data-testid="cockpit-kpi-progress">
                <div className={styles.metricHeading}>
                  <Route size={15} />
                  <small>PROGRESSO</small>
                </div>
                <div className={styles.progressBody}>
                  <OperationalGaugeChart
                    value={68}
                    label="Rota"
                    ariaLabel="68% da rota concluída"
                  />
                  <div>
                    <strong>642 km</strong>
                    <span>de 944 km percorridos</span>
                    <small>ritmo dentro da janela</small>
                  </div>
                </div>
              </motion.article>
  
              <motion.article layout className={styles.etaMetric} data-testid="cockpit-kpi-eta">
                <div className={styles.metricHeading}>
                  <Clock3 size={15} />
                  <small>ETA</small>
                </div>
                <strong>18:40</strong>
                <span className={styles.etaDelta}>+ 22 min vs. plano</span>
                <small>janela prevista hoje</small>
              </motion.article>
  
              <motion.article layout className={styles.signalMetric} data-testid="cockpit-kpi-signal">
                <div className={styles.metricHeading}>
                  <Radio size={15} />
                  <small>SINAL</small>
                </div>
                <div className={styles.signalLine}>
                  <i aria-hidden />
                  <strong>Estável</strong>
                </div>
                <span>GPS + AIS · 4 min</span>
                <small>telemetria recente</small>
              </motion.article>
  
              <motion.article layout className={styles.riskMetric} data-testid="cockpit-kpi-risk">
                <div className={styles.metricHeading}>
                  <ShieldAlert size={15} />
                  <small>RISCO</small>
                </div>
                <div className={styles.riskScale} aria-label="Risco moderado">
                  <span />
                  <span />
                  <span className={styles.riskScaleActive} />
                  <span />
                </div>
                <strong>Moderado</strong>
                <span>1 atenção ativa</span>
              </motion.article>
            </div>
  
            ) : null}

          <AnimatePresence mode="wait" initial={false}>
            {mode === 'cockpit' ? (
              <motion.div
                key="cockpit"
                className={styles.modeSurface}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <div className={styles.cockpitGrid}>
                  <article className={styles.telemetryCard} data-testid="cockpit-telemetry-card">
                    <header>
                      <div>
                        <small>TELEMETRIA OPERACIONAL</small>
                        <strong>Ritmo e condição da viagem</strong>
                        <span>Velocidade, combustível e temperatura nas últimas 14 horas</span>
                      </div>
                      <span className={styles.liveBadge}><i /> AO VIVO</span>
                    </header>

                    <OperationalTelemetryOverviewChart
                      labels={telemetryLabels}
                      metrics={telemetryMetrics}
                      ariaLabel="Telemetria da carga com velocidade, combustível, temperatura e contexto hidroviário"
                      hydroContext={hydroContext}
                    />
                  </article>


                </div>

                <div className={styles.cockpitLowerGrid}>
                  <article className={styles.hydroDecisionCard} data-testid="cockpit-route-context">
                    <header className={styles.hydroDecisionHeader}>
                      <div className={styles.hydroDecisionTitle}>
                        <span className={styles.hydroDecisionIcon}><Waves size={19} /></span>
                        <div>
                          <small>CONTEXTO HIDROVIÁRIO · DEMO</small>
                          <strong>Amazonas–Solimões · leitura operacional</strong>
                          <span>Condição do corredor para orientar risco, janela e decisão da embarcadora.</span>
                        </div>
                      </div>
                      <span className={styles.hydroStateBadge}>Vazante · atenção</span>
                    </header>

                    <div className={styles.hydroDecisionMetrics}>
                      <div>
                        <small>COTA FLUVIOMÉTRICA</small>
                        <strong>14,1 m</strong>
                        <span>−1,5 m em 5 dias</span>
                      </div>
                      <div>
                        <small>CALADO OPERACIONAL</small>
                        <strong>2,80 m</strong>
                        <span>snapshot da embarcação</span>
                      </div>
                      <div>
                        <small>PROFUNDIDADE REQUERIDA</small>
                        <strong>3,90 m</strong>
                        <span>margem operacional +1,10 m</span>
                      </div>
                      <div>
                        <small>FONTE / FRESHNESS</small>
                        <strong>ANA/Hidroweb</strong>
                        <span>adapter previsto · 18 min</span>
                      </div>
                    </div>

                    <div className={styles.hydroChartBlock} data-testid="cockpit-hydro-chart">
                      <HydroLevelTrendChart />
                    </div>

                    <footer className={styles.hydroInsightFooter} data-testid="cockpit-hydro-insight">
                      <Waves size={17} aria-hidden />
                      <div>
                        <strong>Queda contínua da cota</strong>
                        <span>Cota fluviométrica não é profundidade navegável; combine tendência, calado, avisos e condições locais antes de decidir.</span>
                      </div>
                    </footer>
                  </article>

                  <article className={styles.evidenceCard} data-testid="cockpit-evidence">
                    <header>
                      <div>
                        <small>EVIDÊNCIAS RÁPIDAS</small>
                        <strong>Documentos e sinais recentes</strong>
                      </div>
                    </header>

                    <div className={styles.evidenceFolderGrid}>
                      {evidence.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className={styles.evidenceFolder}
                          data-tone={item.tone}
                          onClick={onDocuments}
                        >
                          <span className={styles.evidenceFolderIcon}><Folder size={19} /></span>
                          <span className={styles.evidenceFolderCopy}>
                            <strong>{item.label}</strong>
                            <small>{item.count}</small>
                          </span>
                          <span className={styles.evidenceStatus} data-tone={item.tone}>
                            {item.status}
                          </span>
                          <em><Clock3 size={13} /> {item.meta}</em>
                        </button>
                      ))}
                    </div>

                    <button type="button" className={styles.evidenceAction} onClick={onDocuments}>
                      Ver todas as evidências
                    </button>
                  </article>

                  <div className={styles.cockpitAlertRow}>
                    <OperationalAlert
                      tone="warning"
                      eyebrow="FOCO AGORA"
                      badge="prazo 16:30"
                      title="Validar manifesto antes da próxima janela operacional"
                      description="O peso declarado ainda precisa ser revalidado para evitar impacto na janela prevista de chegada."
                      actionLabel="Abrir documentos"
                      onAction={onDocuments}
                      testId="cockpit-attention"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="timeline"
                className={styles.modeSurface}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <div className={styles.timelineLayout}>
                  <article className={styles.timeline} data-testid="page62-d05-timeline">
                    <header>
                      <div className={styles.metricHeading}>
                        <Activity size={17} />
                        <small>LINHA OPERACIONAL</small>
                      </div>
                      <strong>Eventos, marcos e condições da viagem</strong>
                      <span>Acompanhe o que aconteceu, o que está acontecendo e o que pode mudar a operação.</span>
                    </header>

                    <ol>
                      {timelineEvents.map((event) => {
                        const EventIcon = timelineEventIcons[event.kind];

                        return (
                          <li
                            key={event.title}
                            data-tone={event.tone}
                            data-phase={event.phase}
                            aria-current={event.phase === 'current' ? 'step' : undefined}
                          >
                            <div className={styles.timelineAxis}>
                              <div className={styles.timelineDate} aria-label={`${event.day} de setembro`}>
                                <span>{event.month}</span>
                                <strong>{event.day}</strong>
                              </div>
                            </div>

                            <div className={styles.timelineEvent}>
                              <div className={styles.timelineEventTopline}>
                                <div className={styles.timelineEventTitle}>
                                  <span className={styles.timelineEventIcon} aria-hidden>
                                    <EventIcon size={17} />
                                  </span>
                                  <strong>{event.title}</strong>
                                </div>
                                <span className={styles.timelineStatus} data-tone={event.tone}>
                                  {event.status}
                                </span>
                              </div>

                              <div className={styles.timelineMeta}>
                                <span><MapPin size={13} /> {event.place}</span>
                                <span><Clock3 size={13} /> {event.time}</span>
                              </div>

                              <p>{event.detail}</p>

                              {(event.source || event.context) ? (
                                <footer>
                                  {event.source ? <span>{event.source}</span> : null}
                                  {event.context ? <strong>{event.context}</strong> : null}
                                </footer>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </article>

                  <article className={styles.timelineInsight} data-testid="page62-timeline-insight">
                    <span className={styles.timelineInsightIcon} aria-hidden>
                      <Info size={22} />
                    </span>
                    <div className={styles.timelineInsightCopy}>
                      <small>LEITURA DO MOMENTO</small>
                      <strong>Operação segue dentro da janela, com uma decisão documental pendente.</strong>
                      <p>
                        A vazante e as condições do corredor seguem monitoradas; nenhum bloqueio crítico foi
                        confirmado para o trecho atual.
                      </p>
                    </div>
                    <div className={styles.timelineInsightDecision}>
                      <small>PRÓXIMA DECISÃO</small>
                      <strong>Validar manifesto até 16:30</strong>
                    </div>
                  </article>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </MotionConfig>
  );
}
