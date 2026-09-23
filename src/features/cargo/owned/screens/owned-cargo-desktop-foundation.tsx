'use client';

import { Bell, Boxes, CirclePlus, FileText, LayoutDashboard, Map, MessageSquare, PackagePlus, Route, Search, Settings, ShieldAlert, Ship, WalletCards } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Link } from '@/core/i18n/navigation';
import { OwnedCargoDetailSummary } from '@/features/cargo/owned/components/owned-cargo-detail-summary';
import { OwnedCargoDetailTabs } from '@/features/cargo/owned/components/owned-cargo-detail-tabs';
import { OwnedCargoShipmentCard } from '@/features/cargo/owned/components/owned-cargo-shipment-card';
import type { CargoCorridorId, OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import { PAGE_61_219_254_VISUAL_FIXTURE_ID, page61219254MapVisualFacts, page61219254VisualCargoes } from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';
import { useProductShell } from '@/features/product-shell/providers/product-shell-provider';
import { ShipperOperationMap } from '@/features/waterway-map/components/owned-cargo-operation-map/owned-cargo-operation-map';
import { getShipperMapRouteForCargo } from '@/features/waterway-map/domain/owned-cargo-operation-route';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from './owned-cargo-desktop-foundation.module.sass';

type Props = { cargoes: OwnedCargo[] };
type Filter = 'all' | 'attention' | 'inTransit';

const corridorTranslationKey: Record<CargoCorridorId, 'amazonasSolimoes' | 'madeira' | 'tapajos' | 'tocantinsAraguaia'> = {
  'amazonas-solimoes': 'amazonasSolimoes',
  madeira: 'madeira',
  tapajos: 'tapajos',
  'tocantins-araguaia': 'tocantinsAraguaia'
};

export function OwnedCargoDesktopFoundation({ cargoes }: Props) {
  const t = useTranslations('shipperMobileFlow');
  const searchParams = useSearchParams();
  const { currentUser } = useProductShell();
  const visualFixtureEnabled = searchParams.get('visualFixture') === PAGE_61_219_254_VISUAL_FIXTURE_ID;
  const renderedCargoes = visualFixtureEnabled ? page61219254VisualCargoes : cargoes;
  const [selectedId, setSelectedId] = useState(renderedCargoes[0]?.id ?? '');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const visible = useMemo(() => renderedCargoes.filter((cargo) => {
    const statusMatches = filter === 'all' || cargo.status === filter;
    return statusMatches && `${cargo.code} ${cargo.origin} ${cargo.destination}`.toLowerCase().includes(query.toLowerCase());
  }), [renderedCargoes, filter, query]);
  const selected = renderedCargoes.find((cargo) => cargo.id === selectedId) ?? visible[0] ?? renderedCargoes[0];
  if (!selected) return null;
  const initials = currentUser.avatarInitials || currentUser.name.slice(0, 2).toUpperCase();
  const selectedRoute = getShipperMapRouteForCargo(selected);
  const cargoesRequiringAttention = renderedCargoes.filter((cargo) => cargo.pendingDocsCount > 0 || cargo.status === 'attention').length;

  return <main className={`${styles.root} ${visualFixtureEnabled ? styles.fixtureRoot : ''}`} data-testid="m01-desktop-foundation">
    <aside className={styles.sidebar} data-testid="page61-sidebar">
      <div className={styles.brand}>{visualFixtureEnabled ? <><strong>HydroRivers</strong><span className={styles.fixtureBrandSearch}><LayoutDashboard size={16}/><span>Buscar</span></span></> : <><b>H</b><strong>HydroRivers</strong></>}</div>
      <Link className={styles.primary} href={intlAppPaths.cargos.publishCargo}>{visualFixtureEnabled ? <CirclePlus size={16}/> : <PackagePlus size={16}/>}<span>{t('myCargoes.desktop.newOperation')}</span></Link>
      <nav aria-label={t('myCargoes.desktop.navigation')}>
        {visualFixtureEnabled ? <><small className={styles.navGroup}>OPERAÇÕES</small><Link className={styles.active} href={intlAppPaths.cargos.myCargos}><LayoutDashboard size={16}/>Minhas Cargas</Link><Link href={intlAppPaths.tracking.home}><Route size={16}/>Mapa operacional</Link><Link href={`${intlAppPaths.cargos.myCargoDetail(selected.id)}/documentos`}><FileText size={16}/>Documentos</Link><Link href={intlAppPaths.dashboard.home}><Bell size={16}/>Alertas</Link><small className={styles.navGroup}>ANÁLISE</small><Link href={intlAppPaths.tracking.home}><Route size={16}/>Corredores</Link><Link href={intlAppPaths.dashboard.home}><LayoutDashboard size={16}/>Performance</Link></> : <><Link href={intlAppPaths.dashboard.home}><LayoutDashboard size={16}/>{t('myCargoes.desktop.cockpit')}</Link><Link href={intlAppPaths.cargos.marketplace}><Boxes size={16}/>{t('myCargoes.desktop.market')}</Link><Link className={styles.active} href={intlAppPaths.cargos.myCargos}><Ship size={16}/>{t('myCargoes.title')}</Link><Link href={intlAppPaths.negotiations.home}><MessageSquare size={16}/>{t('myCargoes.desktop.negotiations')}</Link><Link href={intlAppPaths.tracking.home}><Map size={16}/>{t('myCargoes.desktop.tracking')}</Link></>}
      </nav>
      <section className={styles.wallet}>{visualFixtureEnabled ? <div><strong>Carteira privada</strong><small>7 cargas ativas</small><em>2 exigem atenção</em></div> : <><WalletCards size={20}/><div><strong>{t('myCargoes.desktop.privateArea')}</strong><small>{t('myCargoes.desktop.privateHint')}</small></div><b>R$ —</b></>}</section>
      <footer><button type="button"><Settings size={15}/>{t('myCargoes.desktop.settings')}</button><div className={styles.user}><span>{initials}</span><div><strong>{currentUser.name}</strong><small>{visualFixtureEnabled ? 'Embarcadora' : currentUser.company}</small></div></div></footer>
    </aside>
    <header className={styles.header} data-testid="page61-header">{visualFixtureEnabled ? <><div/><div className={styles.fixtureHeaderControls}><span/><span/><span/><i/></div></> : <><div><strong>{t('myCargoes.title')}</strong><small>{t('myCargoes.desktop.workspace')}</small></div><div><Search size={17}/><Bell size={17}/><span className={styles.avatar}>{initials}</span></div></>}</header>
    <section className={styles.master} data-testid="page61-master" aria-label={t('myCargoes.desktop.masterAria')}>
      <div className={styles.masterTitle}>{visualFixtureEnabled ? <><div><h1>Minhas Cargas</h1><small className={styles.fixtureTitleSpacer} aria-hidden="true">7 cargas</small></div><small className={styles.fixtureAttentionSummary}>2 exigem atenção</small><span className={styles.fixtureFilterButton} aria-hidden="true"><i/><i/><i/></span></> : <><div><h1>{t('myCargoes.title')}</h1><small>{t('myCargoes.resultsCount',{count:visible.length})}</small></div><button type="button" aria-label={t('myCargoes.desktop.moreActions')}>•••</button></>}</div>
      <div className={styles.filters}>{visualFixtureEnabled ? <><button type="button" className={styles.filterActive}>Todas (7)</button><button type="button">Em trânsito (3)</button><button type="button">Entregues (2)</button><button type="button">Atrasadas (2)</button></> : (['all','attention','inTransit'] as Filter[]).map((id)=><button type="button" key={id} className={filter===id?styles.filterActive:''} onClick={()=>setFilter(id)}>{t(`myCargoes.desktop.filter.${id}`)}</button>)}</div>
      <label className={styles.search}><Search size={15}/><input aria-label={t('myCargoes.desktop.search')} placeholder={visualFixtureEnabled ? '' : t('myCargoes.desktop.searchPlaceholder')} value={query} onChange={(event)=>setQuery(event.target.value)}/></label>
      <div className={styles.masterAlert}>{visualFixtureEnabled ? <><b aria-hidden="true">!</b><span><strong>Manifesto pendente · ação até 16:30</strong><small>Janela de atracação sob risco operacional</small></span><em aria-hidden="true">›</em></> : <><ShieldAlert size={14}/><span>{t('myCargoes.desktop.attentionSummary', {count: cargoesRequiringAttention})}</span></>}</div>
      <div className={styles.list}>{visible.map((cargo) => <OwnedCargoShipmentCard
        key={cargo.id}
        cargo={cargo}
        selected={cargo.id === selected.id}
        visualFixtureEnabled={visualFixtureEnabled}
        onSelect={() => setSelectedId(cargo.id)}
      />)}</div>
    </section>
    <section className={styles.detail} data-testid="page61-detail" aria-label={t('myCargoes.desktop.detailAria')}>
      <div className={styles.map} data-testid="page61-map-surface"><ShipperOperationMap routeData={selectedRoute} ariaLabel={t('map.previewTitle')} fallbackHintLabel={t('map.fallbackHint')} presentation={visualFixtureEnabled ? 'page-61-219-254' : 'desktop-foundation'}/>{visualFixtureEnabled ? <><div className={styles.mapLabel}><strong>{page61219254MapVisualFacts.operation}</strong></div><div className={styles.eta}><strong>{page61219254MapVisualFacts.risk}</strong></div><div className={styles.signal}><i/><div><strong>{page61219254MapVisualFacts.signal}</strong><small>{page61219254MapVisualFacts.signalDetail}</small></div><div><strong>{page61219254MapVisualFacts.river}</strong><small>{page61219254MapVisualFacts.riverDetail}</small></div></div><button type="button" className={styles.fitRoute}>{page61219254MapVisualFacts.fitRoute}</button><div className={styles.mapControls} data-testid="page61-map-controls"><button type="button" aria-label={t('myCargoes.desktop.zoomIn')}>⊖</button><button type="button" aria-label={t('myCargoes.desktop.zoomOut')}>◴</button><button type="button" aria-label={t('myCargoes.desktop.centerMap')}>◎</button></div></> : <><div className={styles.mapLabel}><i/><div><strong>{selected.code}</strong><small>{selected.origin} → {selected.destination}</small></div></div><div className={styles.eta}><small>{t('myCargoes.desktop.estimatedArrival')}</small><strong>{t('myCargoes.desktop.eta',{hours:selected.etaHours})}</strong></div><div className={styles.signal}><i/><div><strong>{t(`myCargoes.desktop.freshness.${selected.freshnessState}`)}</strong><small>{t('myCargoes.desktop.updated',{minutes:selected.freshnessMinutes})}</small></div><div><strong>{t(`map.corridors.${corridorTranslationKey[selected.corridorId]}`)}</strong><small>{t(`myCargoes.desktop.risk.${selected.riskLevel}`)}</small></div></div><div className={styles.mapControls}><button type="button" aria-label={t('myCargoes.desktop.zoomIn')}>+</button><button type="button" aria-label={t('myCargoes.desktop.zoomOut')}>−</button><button type="button" aria-label={t('myCargoes.desktop.centerMap')}>◎</button></div></>}</div>
      <OwnedCargoDetailTabs cargoId={selected.id}/>
      <OwnedCargoDetailSummary cargo={selected} visualFixtureEnabled={visualFixtureEnabled}/>
    </section>
  </main>;
}
