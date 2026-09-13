'use client';

import { Bell, Boxes, Clock3, FileText, LayoutDashboard, Map, MessageSquare, PackagePlus, Search, Settings, ShieldAlert, Ship, Sparkles, UserRound, WalletCards } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Link } from '@/core/i18n/navigation';
import type { CargoCorridorId, OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import { PAGE_61_219_254_VISUAL_FIXTURE_ID, page61219254SelectedVisualFacts, page61219254VisualCargoes } from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';
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
    <aside className={styles.sidebar}>
      <div className={styles.brand}><b>H</b><strong>HydroRivers</strong></div>
      <Link className={styles.primary} href={intlAppPaths.cargos.publishCargo}><PackagePlus size={16}/>{t('myCargoes.desktop.newOperation')}</Link>
      <nav aria-label={t('myCargoes.desktop.navigation')}>
        {visualFixtureEnabled ? <><small className={styles.navGroup}>OPERAÇÕES</small><Link className={styles.active} href={intlAppPaths.cargos.myCargos}><LayoutDashboard size={16}/>{t('myCargoes.title')}</Link><Link href={intlAppPaths.tracking.home}><Map size={16}/>Mapa operacional</Link><Link href={`${intlAppPaths.cargos.myCargoDetail(selected.id)}/documentos`}><FileText size={16}/>Documentos</Link><Link href={intlAppPaths.dashboard.home}><ShieldAlert size={16}/>Alertas</Link><small className={styles.navGroup}>ANÁLISE</small><Link href={intlAppPaths.tracking.home}><Map size={16}/>Corredores</Link><Link href={intlAppPaths.dashboard.home}><Boxes size={16}/>Performance</Link></> : <><Link href={intlAppPaths.dashboard.home}><LayoutDashboard size={16}/>{t('myCargoes.desktop.cockpit')}</Link><Link href={intlAppPaths.cargos.marketplace}><Boxes size={16}/>{t('myCargoes.desktop.market')}</Link><Link className={styles.active} href={intlAppPaths.cargos.myCargos}><Ship size={16}/>{t('myCargoes.title')}</Link><Link href={intlAppPaths.negotiations.home}><MessageSquare size={16}/>{t('myCargoes.desktop.negotiations')}</Link><Link href={intlAppPaths.tracking.home}><Map size={16}/>{t('myCargoes.desktop.tracking')}</Link></>}
      </nav>
      <section className={styles.wallet}><WalletCards size={20}/><div><strong>{t('myCargoes.desktop.privateArea')}</strong><small>{t('myCargoes.desktop.privateHint')}</small></div><b>R$ —</b></section>
      <footer><button type="button"><Settings size={15}/>{t('myCargoes.desktop.settings')}</button><div className={styles.user}><span>{initials}</span><div><strong>{currentUser.name}</strong><small>{currentUser.company}</small></div></div></footer>
    </aside>
    <header className={styles.header}><div><strong>{t('myCargoes.title')}</strong><small>{t('myCargoes.desktop.workspace')}</small></div><div><Search size={17}/><Bell size={17}/><span className={styles.avatar}>{initials}</span></div></header>
    <section className={styles.master} aria-label={t('myCargoes.desktop.masterAria')}>
      <div className={styles.masterTitle}><div><h1>{t('myCargoes.title')}</h1><small>{t('myCargoes.resultsCount',{count:visible.length})}</small></div><button type="button" aria-label={t('myCargoes.desktop.moreActions')}>•••</button></div>
      <div className={styles.filters}>{(['all','attention','inTransit'] as Filter[]).map((id)=><button type="button" key={id} className={filter===id?styles.filterActive:''} onClick={()=>setFilter(id)}>{t(`myCargoes.desktop.filter.${id}`)}</button>)}</div>
      <label className={styles.search}><Search size={15}/><input aria-label={t('myCargoes.desktop.search')} placeholder={t('myCargoes.desktop.searchPlaceholder')} value={query} onChange={(event)=>setQuery(event.target.value)}/></label>
      <div className={styles.masterAlert}><ShieldAlert size={14}/><span>{t('myCargoes.desktop.attentionSummary', {count: cargoesRequiringAttention})}</span></div>
      <div className={styles.list}>{visible.map((cargo)=><button type="button" data-cargo-id={cargo.id} data-cargo-code={cargo.code} data-status={cargo.status} aria-pressed={cargo.id===selected.id} key={cargo.id} className={`${styles.card} ${cargo.id===selected.id?styles.cardSelected:''}`} onClick={()=>setSelectedId(cargo.id)}>
        <div className={styles.cardTop}><span data-tone={cargo.status}>{t(`cargoDetail.status.${cargo.status}`)}</span><small>{visualFixtureEnabled ? `#${cargo.code}` : cargo.code}</small><b>•••</b></div>
        <div className={styles.route}><strong>{visualFixtureEnabled ? <><em data-flag="us"/><span><b>{page61219254SelectedVisualFacts.originRegion}</b><small>{page61219254SelectedVisualFacts.originCity}</small></span></> : cargo.origin}</strong><i>⚓</i><strong>{visualFixtureEnabled ? <><span><b>{page61219254SelectedVisualFacts.destinationRegion}</b><small>{page61219254SelectedVisualFacts.destinationCity}</small></span><em data-flag="pa"/></> : cargo.destination}</strong></div>
        <div className={styles.routeLabels}><small>{t('myCargoes.desktop.origin')}</small><small>{t('myCargoes.desktop.destination')}</small></div>
        {visualFixtureEnabled ? <div className={styles.fixtureCardFacts}><div><small>{t('myCargoes.desktop.cargo')}</small><strong>{page61219254SelectedVisualFacts.cargoType}</strong></div><div><small>ETA</small><strong>{cargo.etaHours === 0 ? t('cargoDetail.status.delivered') : t('myCargoes.desktop.eta',{hours:cargo.etaHours})}</strong></div></div> : <><div className={styles.metrics}><span><Clock3 size={13}/>{t('myCargoes.desktop.eta',{hours:cargo.etaHours})}</span><span><ShieldAlert size={13}/>{t(`myCargoes.desktop.risk.${cargo.riskLevel}`)}</span><span><FileText size={13}/>{t('myCargoes.desktop.docs',{count:cargo.pendingDocsCount})}</span></div><div className={styles.progress}><i style={{width:`${Math.round(getShipperMapRouteForCargo(cargo).progressRatio * 100)}%`}}/></div></>}
      </button>)}</div>
    </section>
    <section className={styles.detail} aria-label={t('myCargoes.desktop.detailAria')}>
      <div className={styles.map}><ShipperOperationMap routeData={selectedRoute} ariaLabel={t('map.previewTitle')} fallbackHintLabel={t('map.fallbackHint')} presentation="desktop-foundation"/><div className={styles.mapLabel}><i/><div><strong>{selected.code}</strong><small>{selected.origin} → {selected.destination}</small></div></div><div className={styles.eta}><small>{t('myCargoes.desktop.estimatedArrival')}</small><strong>{t('myCargoes.desktop.eta',{hours:selected.etaHours})}</strong></div><div className={styles.signal}><i/><div><strong>{t(`myCargoes.desktop.freshness.${selected.freshnessState}`)}</strong><small>{t('myCargoes.desktop.updated',{minutes:selected.freshnessMinutes})}</small></div><div><strong>{t(`map.corridors.${corridorTranslationKey[selected.corridorId]}`)}</strong><small>{t(`myCargoes.desktop.risk.${selected.riskLevel}`)}</small></div></div><div className={styles.mapControls}><button type="button" aria-label={t('myCargoes.desktop.zoomIn')}>+</button><button type="button" aria-label={t('myCargoes.desktop.zoomOut')}>−</button><button type="button" aria-label={t('myCargoes.desktop.centerMap')}>◎</button></div></div>
      <div className={styles.tabs}><button type="button">{t('myCargoes.desktop.tabs.overview')}</button><Link href={`${intlAppPaths.cargos.myCargoDetail(selected.id)}?view=jornada`}>{t('myCargoes.desktop.tabs.journey')}</Link><Link href={`${intlAppPaths.cargos.myCargoDetail(selected.id)}/documentos`}>{t('myCargoes.desktop.tabs.documents')}</Link><Link href={`${intlAppPaths.cargos.myCargoDetail(selected.id)}?view=custos`}>{t('myCargoes.desktop.tabs.costs')}</Link></div>
      <div className={styles.body}><article className={styles.overview}><div className={styles.title}><div><small>{t('myCargoes.desktop.selectedCargo')}</small><h2>{selected.code}</h2></div><Link href={intlAppPaths.cargos.myCargoDetail(selected.id)}>{t('myCargoes.desktop.openCockpit')}</Link></div>{visualFixtureEnabled ? <div className={styles.fixtureCarrier}><span>NA</span><div><strong>{page61219254SelectedVisualFacts.carrier}</strong><small>{page61219254SelectedVisualFacts.vessel} · {page61219254SelectedVisualFacts.carrierReference}</small></div><b>{page61219254SelectedVisualFacts.progress}</b></div> : null}<div className={styles.grid}><section><small>{visualFixtureEnabled ? t('myCargoes.desktop.cargo') : t('myCargoes.desktop.route')}</small><strong>{visualFixtureEnabled ? page61219254SelectedVisualFacts.cargoType : selected.origin}</strong><span>{visualFixtureEnabled ? selected.origin : selected.destination}</span></section><section><small>{visualFixtureEnabled ? t('myCargoes.desktop.volume') : t('myCargoes.desktop.status')}</small><strong>{visualFixtureEnabled ? page61219254SelectedVisualFacts.totalWeight : t(`cargoDetail.status.${selected.status}`)}</strong><span>{t('myCargoes.desktop.updated',{minutes:selected.freshnessMinutes})}</span></section><section><small>{visualFixtureEnabled ? t('myCargoes.desktop.vessel') : t('myCargoes.desktop.etaLabel')}</small><strong>{visualFixtureEnabled ? page61219254SelectedVisualFacts.vessel : t('myCargoes.desktop.eta',{hours:selected.etaHours})}</strong><span>{visualFixtureEnabled ? page61219254SelectedVisualFacts.progress : t('myCargoes.desktop.forecast')}</span></section></div>
      <div className={styles.carrier}><Ship size={19}/><div><small>{t('myCargoes.desktop.corridor')}</small><strong>{t(`map.corridors.${corridorTranslationKey[selected.corridorId]}`)}</strong></div><b>{t(`myCargoes.desktop.freshness.${selected.freshnessState}`)}</b><Link href={intlAppPaths.cargos.myCargoDetail(selected.id)}><UserRound size={14}/>{t('myCargoes.desktop.openRoute')}</Link></div>
      <div className={styles.facts}>{visualFixtureEnabled ? <><div><small>SINAL</small><strong>{page61219254SelectedVisualFacts.signal}</strong><span>{t('myCargoes.desktop.updated',{minutes:selected.freshnessMinutes})}</span></div><div><small>RIO</small><strong>{page61219254SelectedVisualFacts.river}</strong><span>{t(`map.corridors.${corridorTranslationKey[selected.corridorId]}`)}</span></div><div><small>PRÓXIMO MARCO</small><strong>{page61219254SelectedVisualFacts.nextMilestone}</strong><span>{page61219254SelectedVisualFacts.nextMilestoneTime}</span></div></> : <><div><small>{t('myCargoes.desktop.offersLabel')}</small><strong>{t('myCargoes.desktop.offers',{count:selected.offersCount})}</strong></div><div><small>{t('myCargoes.desktop.freshnessLabel')}</small><strong>{t('myCargoes.desktop.updated',{minutes:selected.freshnessMinutes})}</strong></div><div><small>{t('myCargoes.desktop.docsLabel')}</small><strong>{t('myCargoes.desktop.docs',{count:selected.pendingDocsCount})}</strong></div></>}</div>
      <div className={styles.alert}><ShieldAlert size={19}/><div><strong>{t('myCargoes.desktop.attentionTitle')}</strong><span>{t('myCargoes.desktop.attentionBody')}</span></div><Link href={`${intlAppPaths.cargos.myCargoDetail(selected.id)}/documentos`}>{t('myCargoes.desktop.review')}</Link></div></article>
      <aside className={styles.intelligence}><h3><Sparkles size={15}/>{t('myCargoes.desktop.intelligence')}</h3><section><small>{t('myCargoes.desktop.riskLabel')}</small><strong>{t(`myCargoes.desktop.risk.${selected.riskLevel}`)}</strong><span>{t('myCargoes.desktop.riskHint')}</span></section><section><small>{t('myCargoes.desktop.nextMilestone')}</small><strong>{t('myCargoes.desktop.checkpoint')}</strong><span>{t('myCargoes.desktop.checkpointHint')}</span></section><section><small>{t('myCargoes.desktop.recommendedAction')}</small><strong>{t('myCargoes.desktop.reviewDocs')}</strong><span>{t('myCargoes.desktop.recommendedHint')}</span></section></aside></div>
    </section>
  </main>;
}
