'use client';

import { OperationalBarChart, OperationalChartCard } from '@/shared/design-system/patterns/operational-chart';
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
];

const cargoes = [
  { code: '#HY-000-000', label: 'Atrasada', tone: 'delayed' as const, selected: true },
  { code: '#HY-000-000', label: 'Em trânsito', tone: 'inTransit' as const, selected: false },
  { code: '#HY-000-000', label: 'Entregue', tone: 'completed' as const, selected: false },
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
          <div>
            <small>CARGA SELECIONADA</small>
            <strong>#HY-000-000</strong>
          </div>
          <nav>
            <span>Visão geral</span>
            <span className={styles.activeTab}>Cockpit</span>
            <span>Timeline</span>
            <span>Documentos</span>
            <span>Atividade</span>
          </nav>
        </header>

        <div className={styles.metricGrid}>
          <article><small>PROGRESSO</small><strong>65%</strong><span>rota concluída</span></article>
          <article><small>ETA</small><strong>18:40</strong><span>hoje</span></article>
          <article><small>SINAL</small><strong>Estável</strong><span>GPS + AIS</span></article>
          <article><small>RISCO</small><strong>Moderado</strong><span>1 atenção ativa</span></article>
        </div>

        <div className={styles.contentGrid}>
          <OperationalChartCard
            title="Telemetria operacional"
            changeInsight="Ritmo estável nas últimas horas."
            actionHint="Acompanhar até a janela de atracação."
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
            <OperationalBarChart points={telemetry} unit="%" ariaLabel="Barras de telemetria operacional" />
          </OperationalChartCard>

          <article className={styles.timeline}>
            <header><small>LINHA OPERACIONAL</small><strong>Próximos marcos</strong></header>
            <ol>
              <li><i/><div><strong>Saída confirmada</strong><span>Manaus · 08:10</span></div></li>
              <li><i/><div><strong>Posição atual</strong><span>Rio Madeira · agora</span></div></li>
              <li><i/><div><strong>Janela de atracação</strong><span>Santarém · 18:40</span></div></li>
            </ol>
          </article>
        </div>

        <article className={styles.attention}>
          <div>
            <small>ATENÇÃO OPERACIONAL</small>
            <strong>Manifesto de carga precisa ser validado antes da chegada.</strong>
            <span>Sem validação, a operação pode perder a janela prevista.</span>
          </div>
          <button type="button">Abrir documentos</button>
        </article>
      </section>
    </div>
  );
}
