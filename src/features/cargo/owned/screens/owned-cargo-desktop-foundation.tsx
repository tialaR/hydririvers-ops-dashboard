'use client';

import { Bell, CirclePlus, FileText, LayoutDashboard, Route, Search, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Link } from '@/core/i18n/navigation';
import {
  buildOwnedCargoDesktopViewModel,
  type OwnedCargoDesktopCopy,
} from '@/features/cargo/owned/application/owned-cargo-desktop-view-model';
import { OwnedCargoDetailSummary } from '@/features/cargo/owned/components/owned-cargo-detail-summary';
import { OwnedCargoDetailTabs } from '@/features/cargo/owned/components/owned-cargo-detail-tabs';
import { OwnedCargoShipmentCard } from '@/features/cargo/owned/components/owned-cargo-shipment-card';
import type { CargoCorridorId, OwnedCargo, OwnedCargoFreshnessState, OwnedCargoRiskLevel, OwnedCargoStatus } from '@/features/cargo/owned/domain/owned-cargo-types';
import {
  PAGE_61_219_254_VISUAL_FIXTURE_ID,
  getPage61219254DesktopFacts,
  page61219254SelectedVisualFacts,
  page61219254VisualCargoes,
} from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';
import { useProductShell } from '@/features/product-shell/providers/product-shell-provider';
import { ShipperOperationMap } from '@/features/waterway-map/components/owned-cargo-operation-map/owned-cargo-operation-map';
import { getShipperMapRouteForCargo } from '@/features/waterway-map/domain/owned-cargo-operation-route';
import { intlAppPaths } from '@/shared/routing/app-routes';

import styles from './owned-cargo-desktop-foundation.module.sass';

type Props = { cargoes: OwnedCargo[] };
type Filter = 'all' | 'attention' | 'inTransit' | 'delivered';

const statusKeys: Record<OwnedCargoStatus, 'open' | 'inTransit' | 'attention' | 'delivered' | 'blocked'> = {
  open: 'open',
  inTransit: 'inTransit',
  attention: 'attention',
  delivered: 'delivered',
  blocked: 'blocked',
};

const corridorKeys: Record<CargoCorridorId, 'amazonasSolimoes' | 'madeira' | 'tapajos' | 'tocantinsAraguaia'> = {
  'amazonas-solimoes': 'amazonasSolimoes',
  madeira: 'madeira',
  tapajos: 'tapajos',
  'tocantins-araguaia': 'tocantinsAraguaia',
};

const riskKeys: Record<OwnedCargoRiskLevel, 'low' | 'medium' | 'high' | 'critical'> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
};

const freshnessKeys: Record<OwnedCargoFreshnessState, 'fresh' | 'stale' | 'offline'> = {
  fresh: 'fresh',
  stale: 'stale',
  offline: 'offline',
};

export function OwnedCargoDesktopFoundation({ cargoes }: Props) {
  const t = useTranslations('shipperMobileFlow');
  const searchParams = useSearchParams();
  const { currentUser } = useProductShell();
  const usesDeterministicFixtureData =
    searchParams.get('visualFixture') === PAGE_61_219_254_VISUAL_FIXTURE_ID;

  const renderedCargoes = usesDeterministicFixtureData ? page61219254VisualCargoes : cargoes;
  const [selectedId, setSelectedId] = useState(renderedCargoes[0]?.id ?? '');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const copy: OwnedCargoDesktopCopy = {
    status: Object.fromEntries(
      Object.entries(statusKeys).map(([status, key]) => [status, t(`cargoDetail.status.${key}`)]),
    ) as Record<OwnedCargoStatus, string>,
    corridor: Object.fromEntries(
      Object.entries(corridorKeys).map(([corridor, key]) => [corridor, t(`map.corridors.${key}`)]),
    ) as Record<CargoCorridorId, string>,
    risk: Object.fromEntries(
      Object.entries(riskKeys).map(([risk, key]) => [risk, t(`myCargoes.desktop.risk.${key}`)]),
    ) as Record<OwnedCargoRiskLevel, string>,
    freshness: Object.fromEntries(
      Object.entries(freshnessKeys).map(([freshness, key]) => [freshness, t(`myCargoes.desktop.freshness.${key}`)]),
    ) as Record<OwnedCargoFreshnessState, string>,
    cargoLabel: t('myCargoes.desktop.cargo'),
    vesselLabel: t('myCargoes.desktop.vessel'),
    corridorLabel: t('myCargoes.desktop.corridor'),
    attentionEyebrow: t('myCargoes.desktop.attentionTitle'),
    attentionTitle: t('myCargoes.desktop.attentionBody'),
    attentionBody: t('myCargoes.desktop.recommendedHint'),
    attentionAction: t('myCargoes.desktop.review'),
    fitRoute: t('myCargoes.desktop.centerMap'),
    liveSignal: t('myCargoes.desktop.freshness.fresh'),
    normalRiver: t('myCargoes.desktop.risk.low'),
    docs: (count) => t('myCargoes.desktop.docs', { count }),
    eta: (hours) => t('myCargoes.desktop.eta', { hours }),
    updated: (minutes) => t('myCargoes.desktop.updated', { minutes }),
  };

  const viewModels = renderedCargoes.map((cargo) =>
    buildOwnedCargoDesktopViewModel(
      cargo,
      copy,
      usesDeterministicFixtureData ? getPage61219254DesktopFacts(cargo) : undefined,
    ));

  const visible = viewModels.filter(({ cargo }) => {
    const statusMatches = filter === 'all' || cargo.status === filter;
    return statusMatches &&
      `${cargo.code} ${cargo.origin} ${cargo.destination}`.toLowerCase().includes(query.toLowerCase());
  });

  const selected =
    viewModels.find(({ cargo }) => cargo.id === selectedId) ??
    visible[0] ??
    viewModels[0];

  if (!selected) return null;

  const initials = currentUser.avatarInitials || currentUser.name.slice(0, 2).toUpperCase();
  const selectedRoute = getShipperMapRouteForCargo(selected.cargo);
  const counts = {
    all: viewModels.length,
    inTransit: viewModels.filter(({ cargo }) => cargo.status === 'inTransit').length,
    delivered: viewModels.filter(({ cargo }) => cargo.status === 'delivered').length,
    attention: viewModels.filter(({ cargo }) => cargo.status === 'attention' || cargo.pendingDocsCount > 0).length,
  };

  return <main className={`${styles.root} ${styles.canonicalRoot}`} data-testid="m01-desktop-foundation">
    <aside className={styles.sidebar} data-testid="page61-sidebar">
      <div className={styles.brand}><strong>HydroRivers</strong><span className={styles.canonicalBrandSearch}><LayoutDashboard size={16}/><span>{t('myCargoes.desktop.search')}</span></span></div>
      <Link className={styles.primary} href={intlAppPaths.cargos.publishCargo}><CirclePlus size={16}/><span>{t('myCargoes.desktop.newOperation')}</span></Link>
      <nav aria-label={t('myCargoes.desktop.navigation')}>
        <small className={styles.navGroup}>OPERAÇÕES</small>
        <Link className={styles.active} href={intlAppPaths.cargos.myCargos}><LayoutDashboard size={16}/>{t('myCargoes.title')}</Link>
        <Link href={intlAppPaths.tracking.home}><Route size={16}/>Mapa operacional</Link>
        <Link href={`${intlAppPaths.cargos.myCargoDetail(selected.cargo.id)}/documentos`}><FileText size={16}/>{t('myCargoes.desktop.tabs.documents')}</Link>
        <Link href={intlAppPaths.dashboard.home}><Bell size={16}/>Alertas</Link>
        <small className={styles.navGroup}>ANÁLISE</small>
        <Link href={intlAppPaths.tracking.home}><Route size={16}/>Corredores</Link>
        <Link href={intlAppPaths.dashboard.home}><LayoutDashboard size={16}/>Performance</Link>
      </nav>
      <section className={styles.wallet}><div><strong>Carteira privada</strong><small>{counts.all} cargas ativas</small><em>{counts.attention} exigem atenção</em></div></section>
      <footer><button type="button"><Settings size={15}/>{t('myCargoes.desktop.settings')}</button><div className={styles.user}><span>{initials}</span><div><strong>{currentUser.name}</strong><small>{currentUser.company || 'Embarcadora'}</small></div></div></footer>
    </aside>

    <header className={styles.header} data-testid="page61-header"><div/><div className={styles.canonicalHeaderControls}><span/><span/><span/><i/></div></header>

    <section className={styles.master} data-testid="page61-master" aria-label={t('myCargoes.desktop.masterAria')}>
      <div className={styles.masterTitle}>
        <div><h1>{t('myCargoes.title')}</h1><small className={styles.canonicalTitleSpacer} aria-hidden="true">{counts.all} cargas</small></div>
        <small className={styles.canonicalAttentionSummary}>{counts.attention} exigem atenção</small>
        <span className={styles.canonicalFilterButton} aria-hidden="true"><i/><i/><i/></span>
      </div>

      <div className={styles.filters}>
        <button type="button" className={filter === 'all' ? styles.filterActive : ''} onClick={() => setFilter('all')}>Todas ({counts.all})</button>
        <button type="button" className={filter === 'inTransit' ? styles.filterActive : ''} onClick={() => setFilter('inTransit')}>Em trânsito ({counts.inTransit})</button>
        <button type="button" className={filter === 'delivered' ? styles.filterActive : ''} onClick={() => setFilter('delivered')}>Entregues ({counts.delivered})</button>
        <button type="button" className={filter === 'attention' ? styles.filterActive : ''} onClick={() => setFilter('attention')}>Atrasadas ({counts.attention})</button>
      </div>

      <label className={styles.search}><Search size={15}/><input aria-label={t('myCargoes.desktop.search')} placeholder={t('myCargoes.desktop.searchPlaceholder')} value={query} onChange={(event)=>setQuery(event.target.value)}/></label>

      <div className={styles.masterAlert}>
        <b aria-hidden="true">!</b>
        <span><strong>{selected.attention.title}</strong><small>{selected.attention.body}</small></span>
        <em aria-hidden="true">›</em>
      </div>

      <div className={styles.list}>{visible.map((viewModel) => <OwnedCargoShipmentCard
        key={viewModel.cargo.id}
        viewModel={viewModel}
        selected={viewModel.cargo.id === selected.cargo.id}
        onSelect={() => setSelectedId(viewModel.cargo.id)}
      />)}</div>
    </section>

    <section className={styles.detail} data-testid="page61-detail" aria-label={t('myCargoes.desktop.detailAria')}>
      <div className={styles.map} data-testid="page61-map-surface">
        <ShipperOperationMap routeData={selectedRoute} ariaLabel={t('map.previewTitle')} fallbackHintLabel={t('map.fallbackHint')} presentation="desktop-foundation"/>
        <div className={styles.mapLabel}><strong>{selected.map.operation}</strong></div>
        <div className={styles.eta}><strong>{selected.map.risk}</strong></div>
        <div className={styles.signal}><i/><div><strong>{selected.map.signal}</strong><small>{selected.map.signalDetail}</small></div><div><strong>{selected.map.river}</strong><small>{selected.map.riverDetail}</small></div></div>
        <button type="button" className={styles.fitRoute}>{selected.map.fitRoute}</button>
        <div className={styles.mapControls} data-testid="page61-map-controls"><button type="button" aria-label={t('myCargoes.desktop.zoomIn')}>⊖</button><button type="button" aria-label={t('myCargoes.desktop.zoomOut')}>◴</button><button type="button" aria-label={t('myCargoes.desktop.centerMap')}>◎</button></div>
      </div>
      <OwnedCargoDetailTabs cargoId={selected.cargo.id} labels={usesDeterministicFixtureData ? page61219254SelectedVisualFacts.tabs : undefined}/>
      <OwnedCargoDetailSummary viewModel={selected}/>
    </section>
  </main>;
}
