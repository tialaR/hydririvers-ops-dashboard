'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileWarning,
  MapPin,
  Navigation,
  Radio,
  Route,
  Search,
  Waves,
} from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useMemo, useState } from 'react';

import { ShipmentCard } from '@/features/cargo/components/shipment-card/shipment-card';
import { ShipperOperationMapFallback } from '@/features/waterway-map/components/owned-cargo-operation-map/owned-cargo-operation-map-fallback';
import type { ShipperMapRouteData } from '@/features/waterway-map/domain/owned-cargo-operation-route';
import { HydroLevelTrendChart } from '@/shared/design-system/patterns/operational-chart';
import styles from './shipper-journey.module.sass';

type OverviewAttentionTone = 'warning' | 'stable' | 'success';

type OverviewActionFact = {
  label: string;
  value: string;
  detail: string;
};

type OverviewCargo = {
  id: string;
  code: string;
  statusLabel: string;
  statusTone: 'delayed' | 'inTransit' | 'completed';
  cargoValue: string;
  etaValue: string;
  etaSuffix: string;
  etaDelta: string;
  progressMeta: string;
  docsValue: string;
  docsDetail: string;
  hydroValue: string;
  hydroDetail: string;
  freshness: string;
  freshnessDetail: string;
  positionLabel: string;
  nextMilestone: string;
  nextMilestoneMeta: string;
  attention: {
    tone: OverviewAttentionTone;
    eyebrow: string;
    badge: string;
    title: string;
    description: string;
    facts: OverviewActionFact[];
  };
  origin: { stateCode: string; stateLabel: string; city: string };
  destination: { stateCode: string; stateLabel: string; city: string };
  route: ShipperMapRouteData;
};

const cargoes: OverviewCargo[] = [
  {
    id: 'hy-247-819',
    code: '#HY-247-819',
    statusLabel: 'Atenção',
    statusTone: 'delayed',
    cargoValue: 'Equipamentos eletrônicos',
    etaValue: '18:40',
    etaSuffix: 'Hoje',
    etaDelta: '+22 min vs. plano',
    progressMeta: '642 km de 944 km',
    docsValue: '7/8',
    docsDetail: '1 divergência no MDF-e',
    hydroValue: 'Vazante',
    hydroDetail: 'janela sazonal Jul–Out · DNIT',
    freshness: '4 min',
    freshnessDetail: 'GPS + AIS · posição recente',
    positionLabel: 'Próximo de Parintins',
    nextMilestone: 'Óbidos',
    nextMilestoneMeta: 'próximo marco · 94 km',
    attention: {
      tone: 'warning',
      eyebrow: 'ATENÇÃO IMEDIATA',
      badge: 'prazo 16:30',
      title: 'Validar o MDF-e antes da próxima janela operacional',
      description: 'O peso declarado diverge da pesagem vinculada à carga. A correção precisa ser revalidada antes da aproximação de Santarém.',
      facts: [
        { label: 'MDF-e', value: '18,4 t', detail: 'valor enviado' },
        { label: 'Evidência', value: '16,8 t', detail: 'pesagem vinculada' },
        { label: 'Janela', value: '18:40', detail: 'ETA planejado' },
      ],
    },
    origin: { stateCode: 'AM', stateLabel: 'Amazonas', city: 'Manaus' },
    destination: { stateCode: 'PA', stateLabel: 'Pará', city: 'Santarém' },
    route: {
      corridorId: 'amazonas-solimoes',
      routeLabelKey: 'amazonasSolimoes',
      origin: { label: 'Manaus', coordinates: [-60.0253, -3.119] },
      destination: { label: 'Santarém', coordinates: [-54.7009, -2.4385] },
      currentPosition: { coordinates: [-56.735, -2.626] },
      routeCoordinates: [
        [-60.0253, -3.119],
        [-59.36, -2.98],
        [-58.58, -2.92],
        [-57.77, -2.86],
        [-56.735, -2.626],
        [-55.52, -1.9],
        [-54.7009, -2.4385],
      ],
      checkpoints: [
        { id: 'manaus', labelKey: 'manaus', coordinates: [-60.0253, -3.119] },
        { id: 'parintins', labelKey: 'parintins', coordinates: [-56.735, -2.626] },
        { id: 'obidos', labelKey: 'obidos', coordinates: [-55.52, -1.9] },
        { id: 'santarem', labelKey: 'santarem', coordinates: [-54.7009, -2.4385] },
      ],
      riskSegment: {
        coordinates: [
          [-57.77, -2.86],
          [-56.735, -2.626],
          [-55.52, -1.9],
        ],
        level: 'medium',
      },
      progressRatio: 0.68,
    },
  },
  {
    id: 'hy-319-552',
    code: '#HY-319-552',
    statusLabel: 'Em trânsito',
    statusTone: 'inTransit',
    cargoValue: 'Alimentos secos',
    etaValue: '22:10',
    etaSuffix: 'Hoje',
    etaDelta: 'dentro da janela',
    progressMeta: 'rota em andamento',
    docsValue: '8/8',
    docsDetail: 'documentação pronta',
    hydroValue: 'Vazante',
    hydroDetail: 'janela sazonal Jul–Out · DNIT',
    freshness: '8 min',
    freshnessDetail: 'GPS + AIS · posição recente',
    positionLabel: 'Rio Amazonas',
    nextMilestone: 'Óbidos',
    nextMilestoneMeta: 'destino operacional',
    attention: {
      tone: 'stable',
      eyebrow: 'SEM BLOQUEIO CRÍTICO',
      badge: 'acompanhar ETA',
      title: 'Operação dentro da janela prevista',
      description: 'Documentação pronta e nenhum bloqueio crítico aberto neste snapshot. O foco é acompanhar a evolução da rota e a atualização do ETA.',
      facts: [
        { label: 'ETA', value: '22:10', detail: 'hoje' },
        { label: 'Progresso', value: '59%', detail: 'rota concluída' },
        { label: 'Documentos', value: '8/8', detail: 'prontos' },
      ],
    },
    origin: { stateCode: 'AM', stateLabel: 'Amazonas', city: 'Manaus' },
    destination: { stateCode: 'PA', stateLabel: 'Pará', city: 'Óbidos' },
    route: {
      corridorId: 'amazonas-solimoes',
      routeLabelKey: 'amazonasSolimoes',
      origin: { label: 'Manaus', coordinates: [-60.0253, -3.119] },
      destination: { label: 'Óbidos', coordinates: [-55.5167, -1.9011] },
      currentPosition: { coordinates: [-57.72, -2.66] },
      routeCoordinates: [
        [-60.0253, -3.119],
        [-59.05, -3.0],
        [-58.15, -2.82],
        [-57.72, -2.66],
        [-56.7, -2.4],
        [-55.5167, -1.9011],
      ],
      checkpoints: [
        { id: 'manaus', labelKey: 'manaus', coordinates: [-60.0253, -3.119] },
        { id: 'parintins', labelKey: 'parintins', coordinates: [-56.735, -2.626] },
        { id: 'obidos', labelKey: 'obidos', coordinates: [-55.5167, -1.9011] },
      ],
      progressRatio: 0.59,
    },
  },
  {
    id: 'hy-411-092',
    code: '#HY-411-092',
    statusLabel: 'Entregue',
    statusTone: 'completed',
    cargoValue: 'Insumos hospitalares',
    etaValue: '16:20',
    etaSuffix: 'Concluído',
    etaDelta: 'chegada confirmada',
    progressMeta: 'operação concluída',
    docsValue: '8/8',
    docsDetail: 'documentação encerrada',
    hydroValue: 'Histórico',
    hydroDetail: 'contexto preservado para auditoria',
    freshness: 'Encerrado',
    freshnessDetail: 'sem telemetria ativa',
    positionLabel: 'Santarém',
    nextMilestone: 'Santarém',
    nextMilestoneMeta: 'destino concluído',
    attention: {
      tone: 'success',
      eyebrow: 'OPERAÇÃO CONCLUÍDA',
      badge: 'sem ação',
      title: 'Carga entregue e evidências fechadas',
      description: 'A operação foi concluída. O contexto permanece disponível para auditoria, histórico documental e comparação de desempenho.',
      facts: [
        { label: 'Progresso', value: '100%', detail: 'rota concluída' },
        { label: 'Chegada', value: '16:20', detail: 'confirmada' },
        { label: 'Documentos', value: '8/8', detail: 'encerrados' },
      ],
    },
    origin: { stateCode: 'AM', stateLabel: 'Amazonas', city: 'Manaus' },
    destination: { stateCode: 'PA', stateLabel: 'Pará', city: 'Santarém' },
    route: {
      corridorId: 'amazonas-solimoes',
      routeLabelKey: 'amazonasSolimoes',
      origin: { label: 'Manaus', coordinates: [-60.0253, -3.119] },
      destination: { label: 'Santarém', coordinates: [-54.7009, -2.4385] },
      currentPosition: { coordinates: [-54.7009, -2.4385] },
      routeCoordinates: [
        [-60.0253, -3.119],
        [-58.6, -2.92],
        [-56.7, -2.63],
        [-55.52, -1.9],
        [-54.7009, -2.4385],
      ],
      checkpoints: [
        { id: 'manaus', labelKey: 'manaus', coordinates: [-60.0253, -3.119] },
        { id: 'parintins', labelKey: 'parintins', coordinates: [-56.735, -2.626] },
        { id: 'santarem', labelKey: 'santarem', coordinates: [-54.7009, -2.4385] },
      ],
      progressRatio: 1,
    },
  },
];

const filters = ['Todas', 'Atenção', 'Em trânsito', 'Entregues'] as const;

const filterCounts: Record<(typeof filters)[number], number> = {
  Todas: cargoes.length,
  Atenção: cargoes.filter((cargo) => cargo.statusLabel === 'Atenção').length,
  'Em trânsito': cargoes.filter((cargo) => cargo.statusLabel === 'Em trânsito').length,
  Entregues: cargoes.filter((cargo) => cargo.statusLabel === 'Entregue').length,
};

const factIcons = [FileWarning, Activity, Clock3] as const;

export function Page62OverviewSurface({ onOpenCockpit }: { onOpenCockpit?: () => void }) {
  const [selectedId, setSelectedId] = useState(cargoes[0].id);
  const [filter, setFilter] = useState<(typeof filters)[number]>('Todas');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => cargoes.filter((cargo) => {
    const filterMatch =
      filter === 'Todas' ||
      (filter === 'Atenção' && cargo.statusLabel === 'Atenção') ||
      (filter === 'Em trânsito' && cargo.statusLabel === 'Em trânsito') ||
      (filter === 'Entregues' && cargo.statusLabel === 'Entregue');
    const haystack = [cargo.code, cargo.origin.city, cargo.destination.city, cargo.cargoValue].join(' ').toLowerCase();
    return filterMatch && haystack.includes(query.trim().toLowerCase());
  }), [filter, query]);

  const selected = cargoes.find((cargo) => cargo.id === selectedId) ?? cargoes[0];
  const progress = Math.round(selected.route.progressRatio * 100);
  const AttentionIcon = selected.attention.tone === 'warning' ? AlertTriangle : CheckCircle2;

  const metrics = [
    {
      id: 'eta',
      icon: Clock3,
      label: 'ETA',
      value: selected.etaValue,
      meta: selected.etaDelta,
    },
    {
      id: 'progress',
      icon: Navigation,
      label: 'Progresso',
      value: progress + '%',
      meta: selected.progressMeta,
      progress,
    },
    {
      id: 'documents',
      icon: FileCheck2,
      label: 'Documentos',
      value: selected.docsValue,
      meta: selected.docsDetail,
    },
    {
      id: 'hydro',
      icon: Waves,
      label: 'Condição hidroviária',
      value: selected.hydroValue,
      meta: selected.hydroDetail,
    },
    {
      id: 'freshness',
      icon: Radio,
      label: 'Freshness',
      value: selected.freshness,
      meta: selected.freshnessDetail,
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <section className={styles.overviewSurface} data-testid="page62-overview">
        <aside className={styles.overviewMaster}>
          <div className={styles.overviewMasterHeader}>
            <div>
              <p className={styles.eyebrow}>CARTEIRA</p>
              <h2>Minhas Cargas</h2>
            </div>
            <span className={styles.statusBadge}>1 exige atenção</span>
          </div>

          <label className={styles.overviewSearch}>
            <Search size={18} aria-hidden />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar carga, origem ou destino" />
          </label>

          <div className={styles.overviewFilters} role="group" aria-label="Filtros de carteira">
            {filters.map((item) => (
              <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>
                <span>{item}</span>
                <small>{filterCounts[item]}</small>
              </button>
            ))}
          </div>

          <div className={styles.overviewList}>
            {visible.map((cargo) => (
              <ShipmentCard
                key={cargo.id}
                code={cargo.code}
                statusLabel={cargo.statusLabel}
                statusTone={cargo.statusTone}
                origin={cargo.origin}
                destination={cargo.destination}
                cargoLabel="Carga"
                cargoValue={cargo.cargoValue}
                etaValue={cargo.etaValue}
                etaSuffix={cargo.etaSuffix}
                selected={cargo.id === selected.id}
                onSelect={() => setSelectedId(cargo.id)}
              />
            ))}
          </div>
        </aside>

        <div className={styles.overviewWorkspace} data-testid="overview-workspace">
          <header className={styles.overviewHeader}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.id}
                className={styles.overviewSelectedCopy}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                <p className={styles.eyebrow}>OPERAÇÃO SELECIONADA</p>
                <div className={styles.overviewSelectedTitle}>
                  <h2>{selected.code}</h2>
                  <span data-tone={selected.attention.tone}>{selected.statusLabel}</span>
                </div>
                <p>{selected.origin.city} → {selected.destination.city} · corredor Amazonas–Solimões</p>
              </motion.div>
            </AnimatePresence>
            <button type="button" className={styles.primaryAction} onClick={onOpenCockpit}>Abrir cockpit</button>
          </header>

          <div className={styles.overviewMetricStrip} data-testid="overview-kpi-strip">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <motion.article layout key={metric.id} className={styles.overviewMetric}>
                  <span className={styles.overviewMetricIcon}><Icon size={17} /></span>
                  <div>
                    <small>{metric.label}</small>
                    <strong>{metric.value}</strong>
                    <span>{metric.meta}</span>
                    {metric.progress !== undefined ? (
                      <div className={styles.overviewMetricTrack} aria-label={'Progresso da rota ' + metric.progress + '%'}>
                        <i style={{ width: metric.progress + '%' }} />
                      </div>
                    ) : null}
                  </div>
                </motion.article>
              );
            })}
          </div>

          <div className={styles.overviewHeroGrid}>
            <article className={styles.overviewMapPanel} data-testid="overview-map-panel">
              <header className={styles.overviewSectionHeader}>
                <div>
                  <p className={styles.eyebrow}>ROTA OPERACIONAL</p>
                  <h3>Onde a carga está agora</h3>
                  <span>Posição, progresso, trecho de risco e próximo marco em uma única leitura.</span>
                </div>
                <span className={styles.demoBadge}>DEMO · vetor determinístico</span>
              </header>

              <div className={styles.overviewMapViewport} data-testid="overview-map-surface">
                <ShipperOperationMapFallback
                  routeData={selected.route}
                  ariaLabel={'Mapa operacional da carga ' + selected.code}
                  presentation="desktop-foundation"
                />

                <div className={styles.mapOperationalSummary}>
                  <span>
                    <MapPin size={17} />
                    <span><small>POSIÇÃO</small><strong>{selected.positionLabel}</strong></span>
                  </span>
                  <span>
                    <Navigation size={17} />
                    <span><small>ROTA</small><strong>{progress}% concluída</strong></span>
                  </span>
                  <span>
                    <Route size={17} />
                    <span><small>PRÓXIMO MARCO</small><strong>{selected.nextMilestone}</strong><em>{selected.nextMilestoneMeta}</em></span>
                  </span>
                </div>
              </div>
            </article>

            <motion.aside
              layout
              className={styles.overviewActionPanel}
              data-testid="overview-action-panel"
              data-tone={selected.attention.tone}
            >
              <header>
                <span className={styles.overviewActionIcon}><AttentionIcon size={20} /></span>
                <div>
                  <p className={styles.eyebrow}>{selected.attention.eyebrow}</p>
                  <span className={styles.overviewActionBadge}>{selected.attention.badge}</span>
                </div>
              </header>

              <div className={styles.overviewActionHero}>
                <h3>{selected.attention.title}</h3>
                <p>{selected.attention.description}</p>
              </div>

              <div className={styles.overviewActionFacts}>
                {selected.attention.facts.map((fact, index) => {
                  const FactIcon = factIcons[index] ?? Activity;
                  return (
                    <span key={fact.label}>
                      <FactIcon size={16} />
                      <small>{fact.label}</small>
                      <strong>{fact.value}</strong>
                      <em>{fact.detail}</em>
                    </span>
                  );
                })}
              </div>

              <button type="button" className={styles.secondaryAction} onClick={onOpenCockpit}>
                Investigar contexto completo
              </button>
            </motion.aside>
          </div>

          <article className={styles.overviewChartCard} data-testid="overview-hydro-chart-card">
            <header className={styles.overviewChartHeader}>
              <div>
                <p className={styles.eyebrow}>CONTEXTO HIDROVIÁRIO</p>
                <h3>Amazonas–Solimões · cota e tendência</h3>
                <p>Tendência hidrológica para orientar investigação. Cota fluviométrica não é profundidade navegável.</p>
              </div>
              <div className={styles.overviewChartHeadline}>
                <span><small>COTA DEMO ATUAL</small><strong>14,1 m</strong></span>
                <span><small>VARIAÇÃO · 5 DIAS</small><strong>−1,5 m</strong></span>
              </div>
            </header>

            <HydroLevelTrendChart />

            <footer className={styles.overviewSourceStrip}>
              <span><Waves size={15}/><strong>ANA/Hidroweb</strong><small>cota e telemetria · adapter previsto</small></span>
              <span><Navigation size={15}/><strong>DNIT</strong><small>sazonalidade, canal e manutenção</small></span>
              <span><Route size={15}/><strong>CHM</strong><small>avisos e publicações náuticas</small></span>
              <span><Activity size={15}/><strong>ANTAQ</strong><small>contingência e contexto regulatório</small></span>
            </footer>
          </article>
        </div>
      </section>
    </MotionConfig>
  );
}
