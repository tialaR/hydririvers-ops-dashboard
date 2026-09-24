'use client';

import {
  Activity,
  AlertTriangle,
  Clock3,
  Navigation,
  Radio,
  Route,
  ShieldAlert,
} from 'lucide-react';

import {
  OperationalChartCard,
  OperationalLineChart,
} from '@/shared/design-system/patterns/operational-chart';
import { ShipmentCard } from '@/features/cargo/components/shipment-card/shipment-card';

import styles from './page-62-cargo-cockpit-preview.module.sass';

const copy = {
  staleBanner: 'Dados desatualizados',
  empty: 'Sem dados',
  actionLabel: 'Ação',
  tablePeriod: 'Período',
  tableValue: 'Valor',
  riskLabel: 'Risco médio',
  freshnessLabel: 'Atualizado há 4 min',
};

const telemetry = [
  { label: '08:00', value: 62 },
  { label: '10:00', value: 68 },
  { label: '12:00', value: 65 },
  { label: '14:00', value: 73 },
  { label: '16:00', value: 70 },
  { label: '18:00', value: 76 },
];

const cargoes = [
  { code: '#HY-000-000', label: 'Atenção', tone: 'delayed' as const, selected: true },
  { code: '#HY-000-000', label: 'Em trânsito', tone: 'inTransit' as const, selected: false },
  { code: '#HY-000-000', label: 'Entregue', tone: 'completed' as const, selected: false },
];

const milestones = [
  { label: 'Saída confirmada', meta: 'Manaus · 08:10', state: 'done' },
  { label: 'Posição atual', meta: 'Rio Madeira · agora', state: 'current' },
  { label: 'Janela de atracação', meta: 'Santarém · 18:40', state: 'next' },
];

export function Page62CargoCockpitPreview() {
  return (
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
              key={`${cargo.code}-${cargo.label}`}
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
            <strong>#HY-000-000</strong>
            <span>Manaus → Santarém</span>
          </div>
          <nav aria-label="Navegação da carga">
            <span>Visão geral</span>
            <span className={styles.activeTab}>Cockpit</span>
            <span>Timeline</span>
            <span>Documentos</span>
            <span>Atividade</span>
          </nav>
        </header>

        <div className={styles.metricGrid}>
          <article className={styles.progressMetric}>
            <div className={styles.metricHeading}>
              <Route size={15} />
              <small>PROGRESSO</small>
            </div>
            <div className={styles.progressBody}>
              <div className={styles.progressRing} aria-label="65% da rota concluída">
                <strong>65%</strong>
              </div>
              <div>
                <strong>642 km</strong>
                <span>de 988 km percorridos</span>
              </div>
            </div>
          </article>

          <article className={styles.etaMetric}>
            <div className={styles.metricHeading}>
              <Clock3 size={15} />
              <small>ETA</small>
            </div>
            <strong>18:40</strong>
            <span className={styles.etaDelta}>+ 22 min vs. plano</span>
            <small>janela prevista hoje</small>
          </article>

          <article className={styles.signalMetric}>
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
          </article>

          <article className={styles.riskMetric}>
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
          </article>
        </div>

        <div className={styles.contentGrid}>
          <OperationalChartCard
            title="Telemetria operacional"
            changeInsight="Ritmo estável, com recuperação no trecho mais recente."
            actionHint="Acompanhar a tendência até a janela de atracação."
            legendLabel="Índice operacional"
            unit="%"
            points={telemetry}
            riskLevel="medium"
            freshnessMinutes={4}
            freshnessState="fresh"
            ariaLabel="Telemetria operacional da carga"
            size="main"
            copy={copy}
          >
            <OperationalLineChart
              points={telemetry}
              unit="%"
              ariaLabel="Série temporal da telemetria operacional"
            />
          </OperationalChartCard>

          <article className={styles.routeContext}>
            <header>
              <div className={styles.metricHeading}>
                <Navigation size={15} />
                <small>CONTEXTO DE ROTA</small>
              </div>
              <strong>Rio Madeira · trecho ativo</strong>
            </header>
            <div className={styles.routeTrack} aria-label="Posição atual na rota">
              <span className={styles.routeTrackDone} />
              <i aria-hidden />
            </div>
            <div className={styles.routeLabels}>
              <span>Manaus</span>
              <strong>Posição atual</strong>
              <span>Santarém</span>
            </div>
            <div className={styles.routeFacts}>
              <div><small>PRÓXIMO MARCO</small><strong>Parintins</strong><span>94 km</span></div>
              <div><small>CONDIÇÃO</small><strong>Operacional</strong><span>sem restrição crítica</span></div>
            </div>
          </article>
        </div>

        <div className={styles.lowerGrid}>
          <article className={styles.timeline}>
            <header>
              <div className={styles.metricHeading}>
                <Activity size={15} />
                <small>LINHA OPERACIONAL</small>
              </div>
              <strong>Próximos marcos</strong>
            </header>
            <ol>
              {milestones.map((milestone) => (
                <li key={milestone.label} data-state={milestone.state}>
                  <i aria-hidden />
                  <div>
                    <strong>{milestone.label}</strong>
                    <span>{milestone.meta}</span>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          <article className={styles.attention}>
            <div className={styles.attentionIcon}><AlertTriangle size={18} /></div>
            <div>
              <small>ATENÇÃO OPERACIONAL</small>
              <strong>Manifesto de carga precisa ser validado antes da chegada.</strong>
              <span>Sem validação, a operação pode perder a janela prevista.</span>
            </div>
            <button type="button">Abrir documentos</button>
          </article>
        </div>
      </section>
    </div>
  );
}
