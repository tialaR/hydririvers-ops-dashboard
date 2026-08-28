'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import type { AuthCtaState, AuthPhoneCountryOption } from './auth-presentation-contracts';
import { AuthActionButton } from '@/features/auth/components/auth-action-button/auth-action-button';
import { AuthShell } from '@/features/auth/components/auth-shell/auth-shell';

import styles from '../styles/auth-experience.module.sass';

type LoginScreenProps = {
  phoneCountries: AuthPhoneCountryOption[];
};

export function LoginScreen({ phoneCountries }: LoginScreenProps) {
  const t = useTranslations('shipperMobileFlow.auth.login');
  const tCountries = useTranslations('shipperMobileFlow.phoneCountries');
  const router = useRouter();
  const [country, setCountry] = useState('+55');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ctaState, setCtaState] = useState<AuthCtaState>('idle');
  const authCardClass = styles.authCard;
  const inputClass = styles.input;
  const selectClass = styles.select;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (phone.trim().length < 8) {
      setError(t('errors.phone'));
      return;
    }
    if (password.length < 4) {
      setError(t('errors.password'));
      return;
    }
    setCtaState('loading');
    window.setTimeout(() => {
      setCtaState('success');
      router.push('/verificar-otp');
    }, 400);
  };

  return (
    <AuthShell>
      <div className={styles.authScreen}>
        <div className={styles.authBackdrop} aria-hidden />
        <form className={authCardClass} onSubmit={handleSubmit}>
          <div className={styles.authBrand} aria-hidden>
            <span className={styles.authBrandMark}>HY</span>
            <span className={styles.authBrandLine} />
          </div>
          <h2 className={styles.formTitle}>{t('title')}</h2>
          <p className={styles.formIntro}>{t('subtitle')}</p>
          <div className={styles.authHighlights} aria-label={t('highlightsAria')}>
            <span className={styles.authHighlight}>{t('highlightAudit')}</span>
            <span className={styles.authHighlight}>{t('highlightEta')}</span>
            <span className={styles.authHighlight}>{t('highlightSecurity')}</span>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="country">
              {t('country')}
            </label>
            <select
              id="country"
              className={selectClass}
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            >
              {phoneCountries.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code}{' '}
                  {tCountries(item.code === '+55' ? 'br' : item.code === '+34' ? 'es' : 'us')}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">
              {t('phone')}
            </label>
            <input
              id="phone"
              className={inputClass}
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t('phonePlaceholder')}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <div className={styles.formActions}>
            <AuthActionButton label={t('submit')} type="submit" state={ctaState} />
            <AuthActionButton label={t('registerLink')} href="/registrar" variant="ghost" />
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
