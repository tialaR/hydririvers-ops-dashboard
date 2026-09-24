'use client';

import {
  AlertTriangle,
  CloudRain,
  FileWarning,
  MapPin,
  Navigation,
  Search,
  Waves,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { ShipmentCard } from '@/features/cargo/components/shipment-card/shipment-card';
import type { ShipperMapRouteData } from '@/features/waterway-map/domain/owned-cargo-operation-route';
import { ShipperOperationMap } from '@/features/waterway-map/components/owned-cargo-operation-map/owned-cargo-operation-map';
import {
  HydroLevelTrendChart,
  OperationalGaugeChart,
} from '@/shared/design-system/patterns/operational-chart';
import styles from './shipper-journey.module.sass';

type OverviewCargo = {
  id: string;
  code: string;
  statusLabel: string;
  statusTone: 'delayed' | 'inTransit' | 'completed';
  cargoValue: string;
  etaValue: string;
  etaSuffix: string;
  risk: string;
  docs: string;
  freshness: string;
  positionLabel: string;
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
    risk: 'Moderado',
    docs: '1 divergência',
    freshness: '4 min',
    positionLabel: 'Próximo de Parintins',
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
    risk: 'Baixo',
    docs: 'Prontos',
    freshness: '8 min',
    positionLabel: 'Rio Amazonas',
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
    risk: 'Baixo',
    docs: 'Concluídos',
    freshness: 'Encerrado',
    positionLabel: 'Santarém',
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

  return (
    <section className={styles.overviewSurface} data-testid="page62-overview">
      <aside className={styles.overviewMaster}>
        <div className={styles.overviewMasterHeader}>
          <div>
            <p className={styles.eyebrow}>VISÃO GERAL</p>
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
            <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
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

      <div className={styles.overviewWorkspace}>
        <header className={styles.overviewHeader}>
          <div>
            <p className={styles.eyebrow}>CARGA SELECIONADA</p>
            <h2>{selected.code}</h2>
            <span>{selected.origin.city} → {selected.destination.city}</span>
          </div>
          <button type="button" className={styles.primaryAction} onClick={onOpenCockpit}>Abrir cockpit</button>
        </header>

        <div className={styles.overviewMap}>
          <ShipperOperationMap
            routeData={selected.route}
            ariaLabel={'Mapa operacional da carga ' + selected.code}
            fallbackHintLabel="Mapa operacional DEMO"
            presentation="desktop-foundation"
          />
          <div className={styles.mapFloatingSummary}>
            <span><MapPin size={18}/><strong>{selected.positionLabel}</strong></span>
            <span><Navigation size={18}/><strong>{Math.round(selected.route.progressRatio * 100)}% da rota</strong></span>
            <span><Waves size={18}/><strong>Rio Amazonas</strong></span>
          </div>
          <div className={styles.mapSourceBadge}>DEMO · rota e posição preparadas para adapter/API</div>
        </div>

        <div className={styles.overviewInsightGrid}>
          <article className={styles.overviewKpi}>
            <span className={styles.iconBubble}><Navigation size={22}/></span>
            <div><small>PROGRESSO</small><strong>{Math.round(selected.route.progressRatio * 100)}%</strong><span>próximo marco: Parintins</span></div>
            <OperationalGaugeChart value={Math.round(selected.route.progressRatio * 100)} label="Rota" ariaLabel="Progresso da rota"/>
          </article>
          <article className={styles.overviewKpi}>
            <span className={styles.iconBubble}><AlertTriangle size={22}/></span>
            <div><small>RISCO</small><strong>{selected.risk}</strong><span>trecho com atenção operacional</span></div>
          </article>
          <article className={styles.overviewKpi}>
            <span className={styles.iconBubble}><FileWarning size={22}/></span>
            <div><small>DOCUMENTOS</small><strong>{selected.docs}</strong><span>ação antes da próxima janela</span></div>
          </article>
          <article className={styles.overviewKpi}>
            <span className={styles.iconBubble}><CloudRain size={22}/></span>
            <div><small>FRESHNESS</small><strong>{selected.freshness}</strong><span>posição e condição do trecho</span></div>
          </article>
        </div>

        <div className={styles.overviewLowerGrid}>
          <article className={styles.overviewHydroCard}>
            <header>
              <div><p className={styles.eyebrow}>CONTEXTO HIDROVIÁRIO</p><h3>Nível e tendência do corredor</h3></div>
              <span className={styles.demoBadge}>DEMO · substituir por ANA/Hidroweb</span>
            </header>
            <HydroLevelTrendChart />
          </article>

          <aside className={styles.overviewActionCard}>
            <p className={styles.eyebrow}>O QUE EXIGE AÇÃO AGORA?</p>
            <h3>Validar MDF-e antes da aproximação de Santarém</h3>
            <p>O peso declarado diverge da evidência operacional e pode comprometer a janela das 18:40.</p>
            <div className={styles.overviewActionFacts}>
              <span><strong>1,6 t</strong><small>diferença</small></span>
              <span><strong>18:40</strong><small>janela</small></span>
              <span><strong>16:30</strong><small>prazo de correção</small></span>
            </div>
            <button type="button" className={styles.secondaryAction} onClick={onOpenCockpit}>Entender contexto completo</button>
          </aside>
        </div>
      </div>
    </section>
  );
}
