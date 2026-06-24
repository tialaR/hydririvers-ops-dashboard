'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/shipper-mobile-flow/components/primary-button/primary-button';
import type { ShipperCtaState, ShipperPhoneCountry } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from '../components/shared-ui/shared-ui.module.sass';

type RegisterScreenProps = {
  phoneCountries: ShipperPhoneCountry[];
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
  const [ctaState, setCtaState] = useState<ShipperCtaState>('idle');

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
    <MobileAppShell>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>{t('title')}</h2>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="company">{t('company')}</label>
          <input id="company" className={styles.input} value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="responsible">{t('responsible')}</label>
          <input id="responsible" className={styles.input} value={responsible} onChange={(e) => setResponsible(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-country">{t('country')}</label>
          <select id="reg-country" className={styles.select} value={country} onChange={(e) => setCountry(e.target.value)}>
            {phoneCountries.map((item) => (
              <option key={item.code} value={item.code}>{item.code}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-phone">{t('phone')}</label>
          <input id="reg-phone" className={styles.input} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <label className={styles.label}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> {t('consent')}
        </label>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <PrimaryButton label={t('submit')} type="submit" state={ctaState} />
      </form>
    </MobileAppShell>
  );
}
