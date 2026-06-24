'use client';

import { useMemo, useState } from 'react';
import { embarcadorCargoes, type EmbarcadorCargo } from '../data/embarcador-glass-flow-data';
import styles from './embarcador-glass-flow.module.sass';

type View = 'list' | 'detail' | 'map';
type SheetKind =
  | 'hydrology'
  | 'progress'
  | 'eta'
  | 'risk'
  | 'timeline'
  | 'cargo'
  | 'convoy'
  | 'costs'
  | 'documents'
  | 'filters'
  | null;

type Theme = 'light' | 'dark';

type CardSize = 'compact' | 'wide' | 'large';

const sheetLabels: Record<Exclude<SheetKind, null>, string> = {
  hydrology: 'Condições hidroviárias',
  progress: 'Progresso da rota',
  eta: 'ETA previsto',
  risk: 'Riscos e alertas',
  timeline: 'Timeline da carga',
  cargo: 'Carga',
  convoy: 'Embarcação / comboio',
  costs: 'Custos operacionais',
  documents: 'Documentos',
  filters: 'Filtros',
};

function EmbarcadorGlassFlow() {
  const [theme, setTheme] = useState<Theme>('light');
  const [view, setView] = useState<View>('list');
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [selectedCargo, setSelectedCargo] = useState<EmbarcadorCargo>(embarcadorCargoes[0]);

  const shellClassName = `${styles.shell} ${theme === 'dark' ? styles.dark : styles.light}`;

  const goToDetail = (cargo: EmbarcadorCargo) => {
    setSelectedCargo(cargo);
    setSheet(null);
    setView('detail');
  };

  return (
    <main className={shellClassName} data-theme={theme}>
      <div className={styles.backgroundMap} aria-hidden="true">
        <span className={styles.bgRiverOne} />
        <span className={styles.bgRiverTwo} />
        <span className={styles.bgRiverThree} />
        <span className={styles.bgGlowOne} />
        <span className={styles.bgGlowTwo} />
      </div>

      <section className={styles.phone}>
        <GlassToolbar
          title={view === 'list' ? 'Minhas Cargas' : view === 'map' ? 'Mapa da rota' : selectedCargo.name}
          largeTitle={view === 'list' ? 'Minhas Cargas' : view === 'map' ? 'Mapa da rota' : selectedCargo.name}
          subtitle={view === 'list' ? '4 comboios · Região Norte' : selectedCargo.route}
          canGoBack={view !== 'list'}
          onBack={() => setView(view === 'map' ? 'detail' : 'list')}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />

        <div className={styles.scroller}>
          {view === 'list' ? (
            <CargoList onSelect={goToDetail} onOpenFilters={() => setSheet('filters')} />
          ) : null}
          {view === 'detail' ? (
            <CargoDetail cargo={selectedCargo} onOpenMap={() => setView('map')} onOpenSheet={setSheet} />
          ) : null}
          {view === 'map' ? <RouteMapScreen cargo={selectedCargo} /> : null}
        </div>

        <GlassBottomNav active={view === 'map' ? 'map' : 'cargoes'} onGoList={() => setView('list')} onGoMap={() => setView('map')} />
      </section>

      <GlassSheet kind={sheet} cargo={selectedCargo} onClose={() => setSheet(null)} />
    </main>
  );
}

function GlassToolbar({
  title,
  largeTitle,
  subtitle,
  canGoBack,
  onBack,
  onToggleTheme,
}: {
  title: string;
  largeTitle: string;
  subtitle: string;
  canGoBack: boolean;
  onBack: () => void;
  onToggleTheme: () => void;
}) {
  return (
    <header className={styles.toolbar}>
      <div className={styles.toolbarSmall}>
        <div className={styles.toolbarSide}>
          {canGoBack ? (
            <button className={styles.iconButton} type="button" onClick={onBack} aria-label="Voltar">
              ‹
            </button>
          ) : (
            <span className={styles.brandMark}>Hy</span>
          )}
        </div>
        <strong>{title}</strong>
        <div className={styles.toolbarSideRight}>
          <button className={styles.iconButton} type="button" onClick={onToggleTheme} aria-label="Alternar tema">
            ◐
          </button>
          <button className={styles.iconButton} type="button" aria-label="Perfil">
            ◌
          </button>
        </div>
      </div>
      <div className={styles.toolbarLarge}>
        <span>{subtitle}</span>
        <h1>{largeTitle}</h1>
      </div>
    </header>
  );
}

function CargoList({ onSelect, onOpenFilters }: { onSelect: (cargo: EmbarcadorCargo) => void; onOpenFilters: () => void }) {
  return (
    <div className={styles.listContent}>
      <div className={styles.searchRow}>
        <label className={styles.searchBar}>
          <span>⌕</span>
          <input placeholder="Buscar carga, rota ou porto" />
        </label>
        <button className={styles.filterButton} type="button" onClick={onOpenFilters} aria-label="Abrir filtros">
          ⌘
        </button>
      </div>
      <div className={styles.chips}>
        {['Todas', 'Em trânsito', 'Aguardando', 'Atracado', 'Alerta'].map((chip) => (
          <button key={chip} className={styles.chip} type="button">
            {chip}
          </button>
        ))}
      </div>
      <div className={styles.cargoList}>
        {embarcadorCargoes.map((cargo) => (
          <button key={cargo.id} className={styles.cargoCard} type="button" onClick={() => onSelect(cargo)}>
            <span className={styles.statusRail} />
            <div>
              <span className={styles.kicker}>{cargo.status}</span>
              <strong>{cargo.name}</strong>
              <p>{cargo.route}</p>
            </div>
            <div className={styles.cargoMeta}>
              <span>{cargo.eta}</span>
              <span>{cargo.volume}</span>
            </div>
            <div className={styles.progressTrack}>
              <span style={{ width: `${cargo.progress}%` }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CargoDetail({
  cargo,
  onOpenMap,
  onOpenSheet,
}: {
  cargo: EmbarcadorCargo;
  onOpenMap: () => void;
  onOpenSheet: (kind: SheetKind) => void;
}) {
  const compactCards = [
    { title: 'Calado', value: cargo.draft, label: 'mínimo 2,5 m', kind: 'hydrology' as SheetKind, preview: 'thermo' },
    { title: 'Nível do rio', value: cargo.riverLevel, label: 'trecho seguro', kind: 'hydrology' as SheetKind, preview: 'line' },
    { title: 'ETA', value: '18 Jun', label: '14h30', kind: 'eta' as SheetKind, preview: 'eta' },
    { title: 'Risco', value: cargo.risk, label: 'operacional', kind: 'risk' as SheetKind, preview: 'gauge' },
  ];

  return (
    <div className={styles.detailContent}>
      <section className={styles.heroCard}>
        <span className={styles.kicker}>Operação hidroviária</span>
        <h2>{cargo.cargo}</h2>
        <p>{cargo.corridor}</p>
        <div className={styles.heroStats}>
          <span>{cargo.volume}</span>
          <span>{cargo.eta}</span>
          <span>{cargo.status}</span>
        </div>
      </section>

      <RouteMapCard cargo={cargo} size="large" onClick={onOpenMap} />

      <div className={styles.metricGrid}>
        {compactCards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            label={card.label}
            preview={card.preview}
            onClick={() => onOpenSheet(card.kind)}
          />
        ))}
      </div>

      <WideCard title="Condições hidroviárias" value="Calado livre" label="5,2 m nível · 2,8 m calado" icon="≈" onClick={() => onOpenSheet('hydrology')}>
        <HydrologyPreview />
      </WideCard>
      <WideCard title="Progresso da rota" value={`${cargo.progress}%`} label="Miritituba → Barcarena" icon="↦" onClick={() => onOpenSheet('progress')}>
        <SegmentedProgress value={cargo.progress} />
      </WideCard>
      <WideCard title="ETA previsto" value={cargo.eta} label="janela portuária preservada" icon="◷" onClick={() => onOpenSheet('eta')}>
        <EtaCurve />
      </WideCard>
      <WideCard title="Riscos e alertas" value={cargo.risk} label="calado, clima e fila" icon="△" onClick={() => onOpenSheet('risk')}>
        <RiskGauge />
      </WideCard>
      <WideCard title="Timeline da carga" value="4 de 6 etapas" label="próxima: atracação" icon="⋯" onClick={() => onOpenSheet('timeline')}>
        <TimelinePreview />
      </WideCard>
      <WideCard title="Carga" value={cargo.volume} label={cargo.cargo} icon="▤" onClick={() => onOpenSheet('cargo')}>
        <CargoBars />
      </WideCard>
      <WideCard title="Embarcação / comboio" value="4 + 1" label="barcaças + empurrador" icon="▭" onClick={() => onOpenSheet('convoy')}>
        <ConvoyPreview />
      </WideCard>
      <WideCard title="Custos operacionais" value="R$ 184 mil" label="previsto para o trecho" icon="R$" onClick={() => onOpenSheet('costs')}>
        <CostPreview />
      </WideCard>
      <WideCard title="Documentos" value={cargo.documents} label="1 pendência antes da descarga" icon="✓" onClick={() => onOpenSheet('documents')}>
        <DocumentPreview />
      </WideCard>
    </div>
  );
}

function RouteMapCard({ cargo, onClick }: { cargo: EmbarcadorCargo; size?: CardSize; onClick: () => void }) {
  return (
    <button className={`${styles.referenceCard} ${styles.routeMapCard}`} type="button" onClick={onClick}>
      <CardHeading icon="⌖" title="Mapa de rastreio" subtitle={cargo.route} />
      <div className={styles.mapSurface}>
        <span className={`${styles.mapRiver} ${styles.mapRiverOne}`} />
        <span className={`${styles.mapRiver} ${styles.mapRiverTwo}`} />
        <span className={`${styles.mapRiver} ${styles.mapRiverThree}`} />
        <svg className={styles.mapSvg} viewBox="0 0 360 230" aria-hidden="true">
          <path d="M24 176 C80 126 114 118 151 133 S223 157 262 92 S318 55 342 31" />
          <circle cx="24" cy="176" r="6" />
          <circle cx="151" cy="133" r="5" />
          <circle cx="262" cy="92" r="5" />
          <circle cx="342" cy="31" r="10" />
        </svg>
        <span className={styles.cityManaus}>Manaus</span>
        <span className={styles.citySantarem}>Santarém</span>
        <span className={styles.cityBarcarena}>Barcarena</span>
        <span className={styles.cityItaituba}>Itaituba</span>
        <span className={styles.riverAmazonas}>Rio Amazonas</span>
        <span className={styles.riverTapajos}>Rio Tapajós</span>
      </div>
    </button>
  );
}

function MetricCard({ title, value, label, preview, onClick }: { title: string; value: string; label: string; preview: string; onClick: () => void }) {
  return (
    <button className={styles.metricCard} type="button" onClick={onClick}>
      <CardHeading icon="•" title={title} />
      <strong>{value}</strong>
      <span>{label}</span>
      <MiniPreview type={preview} />
    </button>
  );
}

function WideCard({
  title,
  value,
  label,
  icon,
  children,
  onClick,
}: {
  title: string;
  value: string;
  label: string;
  icon: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={styles.wideCard} type="button" onClick={onClick}>
      <CardHeading icon={icon} title={title} subtitle={label} />
      <div className={styles.wideCardBody}>
        <strong>{value}</strong>
        {children}
      </div>
    </button>
  );
}

function CardHeading({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className={styles.cardHeading}>
      <span>{icon}</span>
      <div>
        <small>{title}</small>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </div>
  );
}

function MiniPreview({ type }: { type: string }) {
  if (type === 'thermo') return <div className={styles.thermo}><span /></div>;
  if (type === 'line') return <EtaCurve compact />;
  if (type === 'gauge') return <RiskGauge compact />;
  return <SegmentedProgress value={74} compact />;
}

function HydrologyPreview() {
  return <div className={styles.hydroBars}>{[44, 62, 58, 76, 69, 82].map((h) => <span key={h} style={{ height: `${h}%` }} />)}</div>;
}
function SegmentedProgress({ value, compact = false }: { value: number; compact?: boolean }) {
  return <div className={`${styles.segmented} ${compact ? styles.compactChart : ''}`}>{[20, 40, 60, 80, 100].map((n) => <span key={n} className={value >= n ? styles.segmentOn : ''} />)}</div>;
}
function EtaCurve({ compact = false }: { compact?: boolean }) {
  return <svg className={`${styles.curve} ${compact ? styles.compactChart : ''}`} viewBox="0 0 180 72" aria-hidden="true"><path d="M8 54 C34 22 61 46 89 28 S139 18 170 42" /></svg>;
}
function RiskGauge({ compact = false }: { compact?: boolean }) {
  return <div className={`${styles.riskGauge} ${compact ? styles.compactGauge : ''}`}><span /></div>;
}
function TimelinePreview() {
  return <div className={styles.timeline}>{['Origem', 'Itaituba', 'Santarém', 'Barcarena'].map((x, index) => <span key={x} data-active={index < 3}>{x}</span>)}</div>;
}
function CargoBars() {
  return <div className={styles.cargoBars}><span /><span /><span /></div>;
}
function ConvoyPreview() {
  return <div className={styles.convoy}><span className={styles.pusher} /><span /><span /><span /><span /></div>;
}
function CostPreview() {
  return <div className={styles.costLine}><span /><span /><span /></div>;
}
function DocumentPreview() {
  return <div className={styles.docs}>{['CT-e', 'NF-e', 'BL', 'LO'].map((doc, index) => <span key={doc} data-pending={index === 2}>{doc}</span>)}</div>;
}

function RouteMapScreen({ cargo }: { cargo: EmbarcadorCargo }) {
  return (
    <div className={styles.mapScreen}>
      <RouteMapCard cargo={cargo} onClick={() => undefined} />
      <section className={styles.mapLegend}>
        <strong>Rota hidroviária ativa</strong>
        <p>Trecho monitorado com ETA, calado e janela portuária em tempo operacional.</p>
        <div><span>Atual</span><strong>Santarém</strong></div>
        <div><span>Destino</span><strong>Barcarena</strong></div>
      </section>
    </div>
  );
}

function GlassBottomNav({ active, onGoList, onGoMap }: { active: 'cargoes' | 'map'; onGoList: () => void; onGoMap: () => void }) {
  return (
    <nav className={styles.bottomNav} aria-label="Navegação do lab">
      <button type="button" className={active === 'cargoes' ? styles.navActive : ''} onClick={onGoList}><span>⌂</span>Cargas</button>
      <button type="button" onClick={onGoList}><span>⇄</span>Rotas</button>
      <button type="button" className={active === 'map' ? styles.navActive : ''} onClick={onGoMap}><span>⌖</span>Mapa</button>
      <button type="button"><span>◌</span>Perfil</button>
    </nav>
  );
}

function GlassSheet({ kind, cargo, onClose }: { kind: SheetKind; cargo: EmbarcadorCargo; onClose: () => void }) {
  const title = kind ? sheetLabels[kind] : '';
  return (
    <div className={`${styles.sheetLayer} ${kind ? styles.sheetOpen : ''}`} aria-hidden={!kind}>
      <button className={styles.sheetScrim} type="button" onClick={onClose} aria-label="Fechar" />
      <section className={styles.sheet} role="dialog" aria-modal="true" aria-label={title || 'Detalhes'}>
        <div className={styles.sheetHandle} />
        <header className={styles.sheetHeader}>
          <div>
            <span>{cargo.name}</span>
            <h2>{title}</h2>
          </div>
          <button className={styles.iconButton} type="button" onClick={onClose}>×</button>
        </header>
        <SheetContent kind={kind} cargo={cargo} />
      </section>
    </div>
  );
}

function SheetContent({ kind, cargo }: { kind: SheetKind; cargo: EmbarcadorCargo }) {
  if (!kind) return null;
  if (kind === 'filters') {
    return <div className={styles.sheetGrid}>{['Status', 'Corredor', 'Tipo de carga', 'Janela', 'Risco', 'Documentos'].map((x) => <button key={x} className={styles.sheetPill} type="button">{x}</button>)}</div>;
  }
  return (
    <div className={styles.sheetContent}>
      {kind === 'hydrology' ? <HydrologyPreview /> : null}
      {kind === 'progress' ? <SegmentedProgress value={cargo.progress} /> : null}
      {kind === 'eta' ? <EtaCurve /> : null}
      {kind === 'risk' ? <RiskGauge /> : null}
      {kind === 'timeline' ? <TimelinePreview /> : null}
      {kind === 'cargo' ? <CargoBars /> : null}
      {kind === 'convoy' ? <ConvoyPreview /> : null}
      {kind === 'costs' ? <CostPreview /> : null}
      {kind === 'documents' ? <DocumentPreview /> : null}
      <dl className={styles.sheetMetrics}>
        <div><dt>Rota</dt><dd>{cargo.route}</dd></div>
        <div><dt>ETA</dt><dd>{cargo.eta}</dd></div>
        <div><dt>Calado</dt><dd>{cargo.draft}</dd></div>
        <div><dt>Nível</dt><dd>{cargo.riverLevel}</dd></div>
      </dl>
    </div>
  );
}

export { EmbarcadorGlassFlow };
