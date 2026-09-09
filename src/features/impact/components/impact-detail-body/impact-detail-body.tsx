import { getTranslations } from 'next-intl/server';
import { Card } from '@/shared/ui/card/card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { ImpactEvidence, ImpactEvidenceSourceType } from '@/features/impact/domain/impact-evidence';
import { listImpactEvidencesByImpactId } from '@/features/impact/domain/impact-evidence';
import styles from './impact-detail-body.module.scss';

export type ImpactDetailId =
  | 'cost'
  | 'sustainability'
  | 'regional'
  | 'automation'
  | 'brdomar'
  | 'compliance'
  | 'connectivity'
  | 'government';

export type ImpactEvidenceStubJson = {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  year?: string;
  disclaimer: string;
};

type ImpactDetailBodyProps = {
  id: ImpactDetailId;
  locale: string;
};

function badgeClassForSource(sourceType: ImpactEvidenceSourceType): string {
  if (sourceType === 'policy') return styles.badgePolicy;
  return styles.badgePublic;
}

export async function ImpactDetailBody({ id, locale }: ImpactDetailBodyProps) {
  const card = await getTranslations({ locale, namespace: `impactCards.${id}` });
  const page = await getTranslations({ locale, namespace: 'pages.impactDetail' });

  const meaning = page.raw(`meaning.${id}`) as string;
  const details = page.raw(`details.${id}`) as string[];
  const valuePoints = page.raw(`valuePoints.${id}`) as string[];
  const limits = page.raw(`limits.${id}`) as string[];

  const real = listImpactEvidencesByImpactId(id);
  const stubs = page.raw(`evidenceStubs.${id}`) as ImpactEvidenceStubJson[] | undefined;
  const useStubs = real.length === 0;
  const stubList = Array.isArray(stubs) ? stubs : [];

  return (
    <div className={styles.wrap} data-testid="impact-detail-body">
      <Card className={styles.card}>
        <div className={styles.kickerRow}>
          <HydroIcon name="leaf" /> {page('kicker')}
        </div>
        <p className={styles.lead}>{page('description')}</p>

        <section className={styles.section} data-testid="impact-detail-meaning">
          <h3>{page('meaningTitle')}</h3>
          <p>{meaning}</p>
        </section>

        <section className={styles.section} data-testid="impact-detail-value">
          <h3>{page('valueTitle')}</h3>
          <ul className={styles.list}>
            {valuePoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section} data-testid="impact-detail-evidence">
          <h3>{page('evidenceTitle')}</h3>
          <p className={styles.lead}>{page('evidenceDescription')}</p>
          <ul className={styles.evidenceList}>
            {useStubs && stubList.length === 0 ? <li>{page('evidenceMissing')}</li> : null}
            {!useStubs
              ? real.map((e: ImpactEvidence) => (
                  <li key={e.id} className={`${styles.evidenceItem} ${styles.public}`}>
                    <div className={styles.evidenceHead}>
                      <span className={`${styles.badge} ${badgeClassForSource(e.sourceType)}`}>
                        {page(`evidenceSource.${e.sourceType}`)}
                      </span>
                    </div>
                    <strong>{e.title}</strong>
                    <p>{e.summary}</p>
                    <span className={styles.meta}>
                      {e.sourceName}
                      {e.year ? ` · ${e.year}` : ''}
                    </span>
                    {e.url ? (
                      <a className={styles.sourceLink} href={e.url} target="_blank" rel="noreferrer">
                        {page('openEvidenceSource')}
                      </a>
                    ) : null}
                    {e.disclaimer ? <span className={styles.disclaimer}>{e.disclaimer}</span> : null}
                  </li>
                ))
              : stubList.map((s) => (
                  <li key={s.id} className={`${styles.evidenceItem} ${styles.stub}`} data-testid="impact-detail-stub-evidence">
                    <div className={styles.evidenceHead}>
                      <span className={`${styles.badge} ${styles.badgeStub}`}>{page('evidenceStubBadge')}</span>
                    </div>
                    <strong>{s.title}</strong>
                    <p>{s.summary}</p>
                    <span className={styles.meta}>
                      {s.sourceName}
                      {s.year ? ` · ${s.year}` : ''}
                    </span>
                    <span className={styles.disclaimer}>{s.disclaimer}</span>
                  </li>
                ))}
          </ul>
        </section>

        <section className={styles.section} data-testid="impact-detail-limits">
          <h3>{page('limitsTitle')}</h3>
          <ul className={styles.list}>
            {limits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section} data-testid="impact-detail-operation">
          <h3>{page('operationTitle')}</h3>
          <ul className={styles.list}>
            {details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <p className={styles.lead}>
          <strong>{card('title')}</strong>
          {' — '}
          {card('description')}
        </p>
      </Card>
    </div>
  );
}
