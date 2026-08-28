'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import { useState } from 'react';

import styles from './language-switcher.module.sass';

const LOCALES = ['pt-BR', 'en-US', 'es'] as const;

export function LanguageSwitcher() {
  const t = useTranslations('shipperMobileFlow.language');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const short = locale === 'pt-BR' ? 'PT' : locale === 'en-US' ? 'EN' : 'ES';

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.control}
        aria-label={t('switch')}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {short}
      </button>
      {open ? (
        <div className={styles.menu} role="menu">
          {LOCALES.map((item) => (
            <button
              key={item}
              type="button"
              role="menuitem"
              className={`${styles.option} ${item === locale ? styles.optionActive : ''}`}
              onClick={() => {
                router.replace(pathname, { locale: item });
                setOpen(false);
              }}
            >
              {t(item)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
