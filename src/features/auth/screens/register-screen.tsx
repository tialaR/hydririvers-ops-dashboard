'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import type { AuthCtaState, AuthPhoneCountryOption } from './auth-presentation-contracts';
import { AuthActionButton } from '@/features/auth/components/auth-action-button/auth-action-button';
import { AuthShell } from '@/features/auth/components/auth-shell/auth-shell';

import styles from '../styles/auth-experience.module.sass';

type RegisterScreenProps = {
  phoneCountries: AuthPhoneCountryOption[];
};

export function RegisterScreen({ phoneCountries }: RegisterScreenProps) {
  const t = useTranslations('shipperMobileFlow.auth.register');
  const router = useRouter();
  const [company, setCompany] = useState('');
  const [responsible, setResponsible] = useState('');
  const [country, setCountry] = useState('+55');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [ctaState, setCtaState] = useState<AuthCtaState>('idle');
  const authCardClass = styles.authCard;
  const fieldClass = styles.input;
  const selectClass = styles.select;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!company.trim() || !responsible.trim()) {
      setError(t('errors.required'));
      return;
    }
    if (!consent) {
      setError(t('errors.consent'));
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
          <span className={styles.authStepBadge}>{t('stepLabel')}</span>
          <h2 className={styles.formTitle}>{t('title')}</h2>
          <p className={styles.formIntro}>{t('subtitle')}</p>
          <div className={styles.authHighlights} aria-label={t('highlightsAria')}>
            <span className={styles.authHighlight}>{t('highlightIdentity')}</span>
            <span className={styles.authHighlight}>{t('highlightOps')}</span>
            <span className={styles.authHighlight}>{t('highlightOtp')}</span>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="company">{t('company')}</label>
            <input id="company" className={fieldClass} value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="responsible">{t('responsible')}</label>
            <input id="responsible" className={fieldClass} value={responsible} onChange={(e) => setResponsible(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-country">{t('country')}</label>
            <select id="reg-country" className={selectClass} value={country} onChange={(e) => setCountry(e.target.value)}>
              {phoneCountries.map((item) => (
                <option key={item.code} value={item.code}>{item.code}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-phone">{t('phone')}</label>
            <input id="reg-phone" className={fieldClass} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <label className={styles.consentRow}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span className={styles.consentLabel}>{t('consent')}</span>
          </label>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <div className={styles.formActions}>
            <AuthActionButton label={t('submit')} type="submit" state={ctaState} />
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
