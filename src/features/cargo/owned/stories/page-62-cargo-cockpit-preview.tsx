'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Navigation,
  Radio,
  Route,
  ShieldAlert,
} from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useState } from 'react';

import {
  OperationalGaugeChart,
  OperationalTelemetryOverviewChart,
  type OperationalTelemetryMetric,
} from '@/shared/design-system/patterns/operational-chart';
import { ShipmentCard } from '@/features/cargo/components/shipment-card/shipment-card';

import styles from './page-62-cargo-cockpit-preview.module.sass';

type WorkspaceMode = 'cockpit' | 'timeline';

type Page62CargoCockpitPreviewProps = {
  initialMode?: WorkspaceMode;
  onOverview?: () => void;
  onDocuments?: () => void;
};

const telemetryLabels = ['08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];

const telemetryMetrics: OperationalTelemetryMetric[] = [
  { name: 'Velocidade', unit: ' km/h', values: [10.8, 11.4, 11.1, 12.2, 12.6, 12.4, 13.1, 12.9] },
  { name: 'Combustível', unit: '%', values: [78, 76, 75, 73, 72, 69, 67, 65] },
  { name: 'Temperatura', unit: '°C', values: [68, 69, 70, 70, 71, 72, 71, 70] },
];

const cargoes = [
  { code: '#HY-247-819', label: 'Atenção', tone: 'delayed' as const, selected: true },
  { code: '#HY-319-552', label: 'Em trânsito', tone: 'inTransit' as const, selected: false },
  { code: '#HY-411-092', label: 'Entregue', tone: 'completed' as const, selected: false },
];

const timelineEvents = [
  {
    title: 'Saída confirmada',
    meta: 'Manaus · 08:10',
    detail: 'Documentação operacional validada e carga liberada.',
    state: 'done',
  },
  {
    title: 'Posição atual',
    meta: 'Rio Madeira · agora',
    detail: 'Telemetria estável e rota sem bloqueios críticos.',
    state: 'current',
  },
  {
    title: 'Janela de atracação',
    meta: 'Santarém · 18:40',
    detail: 'Aguardando validação do manifesto antes da chegada.',
    state: 'next',
  },
];

const evidence = [
  { label: 'Manifesto', meta: 'Atualizado há 12 min', tone: 'warning' },
  { label: 'CT-e', meta: 'Validado', tone: 'success' },
  { label: 'Seguro', meta: 'Cobertura ativa', tone: 'success' },
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

        <section className={styles.workspace}>
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

          <div className={styles.metricGrid}>
            <motion.article layout className={styles.progressMetric}>
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

            <motion.article layout className={styles.etaMetric}>
              <div className={styles.metricHeading}>
                <Clock3 size={15} />
                <small>ETA</small>
              </div>
              <strong>18:40</strong>
              <span className={styles.etaDelta}>+ 22 min vs. plano</span>
              <small>janela prevista hoje</small>
            </motion.article>

            <motion.article layout className={styles.signalMetric}>
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

            <motion.article layout className={styles.riskMetric}>
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
                  <article className={styles.telemetryCard}>
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
                      ariaLabel="Telemetria da carga com velocidade, combustível e temperatura"
                    />
                  </article>


                </div>

                <div className={styles.cockpitLowerGrid}>
                  <article className={styles.routeContextCompact}>
                    <div>
                      <div className={styles.metricHeading}>
                        <Navigation size={17} />
                        <small>CONTEXTO DE ROTA</small>
                      </div>
                      <strong>Rio Madeira · trecho ativo</strong>
                      <span>Próximo marco: Parintins · 94 km</span>
                    </div>
                    <div className={styles.routeProgressCompact} aria-label="68% da rota concluída">
                      <span><i /></span>
                      <div><small>Manaus</small><strong>68% · posição atual</strong><small>Santarém</small></div>
                    </div>
                  </article>

                  <article className={styles.attention}>
                    <div className={styles.attentionIcon}><AlertTriangle size={18} /></div>
                    <div>
                      <small>ATENÇÃO OPERACIONAL</small>
                      <strong>Manifesto precisa ser validado antes da chegada.</strong>
                      <span>Sem validação, a operação pode perder a janela prevista.</span>
                    </div>
                    <button type="button">Abrir documentos</button>
                  </article>

                  <article className={styles.evidenceCard}>
                    <header>
                      <FileCheck2 size={15} />
                      <div>
                        <small>EVIDÊNCIAS RÁPIDAS</small>
                        <strong>Documentos e sinais</strong>
                      </div>
                    </header>
                    <div className={styles.evidenceList}>
                      {evidence.map((item) => (
                        <div key={item.label} data-tone={item.tone}>
                          <CheckCircle2 size={14} />
                          <span><strong>{item.label}</strong><small>{item.meta}</small></span>
                        </div>
                      ))}
                    </div>
                  </article>
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
                  <article className={styles.timeline}>
                    <header>
                      <div className={styles.metricHeading}>
                        <Activity size={15} />
                        <small>LINHA OPERACIONAL</small>
                      </div>
                      <strong>Eventos, marcos e exceções</strong>
                    </header>
                    <ol>
                      {timelineEvents.map((event) => (
                        <li key={event.title} data-state={event.state}>
                          <i aria-hidden />
                          <div>
                            <strong>{event.title}</strong>
                            <span>{event.meta}</span>
                            <p>{event.detail}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </article>

                  <article className={styles.timelineEvidence}>
                    <small>LEITURA DO MOMENTO</small>
                    <strong>Operação saudável com uma pendência documental.</strong>
                    <p>
                      O atraso estimado ainda é absorvível pela janela atual, mas o manifesto precisa
                      ser validado antes do próximo marco.
                    </p>
                    <div className={styles.timelineDecision}>
                      <span>Próxima decisão</span>
                      <strong>Validar manifesto</strong>
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
