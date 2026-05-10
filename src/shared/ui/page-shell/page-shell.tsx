import { getLocale, getTranslations } from 'next-intl/server';
import styles from './page-shell.module.scss';

export type PageShellProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  namespace?: string;
  locale?: string;
};

export async function PageShell({ children, eyebrow, title, description, namespace, locale }: PageShellProps) {
  let resolvedEyebrow = eyebrow;
  let resolvedTitle = title;
  let resolvedDescription = description;

  if (namespace && (!title || !description || !eyebrow)) {
    const effectiveLocale = locale ?? (await getLocale());
    const t = await getTranslations({ locale: effectiveLocale, namespace });
    resolvedEyebrow = resolvedEyebrow ?? t('eyebrow');
    resolvedTitle = resolvedTitle ?? t('title');
    resolvedDescription = resolvedDescription ?? t('description');
  }

  return (
    <section className={`hr-page-shell ${styles.shell}`}>
      {(resolvedEyebrow || resolvedTitle || resolvedDescription) ? (
        <header className={`hr-page-heading ${styles.header}`}>
          {resolvedEyebrow ? <p>{resolvedEyebrow}</p> : null}
          {resolvedTitle ? <h1>{resolvedTitle}</h1> : null}
          {resolvedDescription ? <span>{resolvedDescription}</span> : null}
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
