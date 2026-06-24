'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/shipper-mobile-flow/components/primary-button/primary-button';
import type { ShipperCtaState, ShipperPhoneCountry } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from '../components/shared-ui/shared-ui.module.sass';

type LoginScreenProps = {
  phoneCountries: ShipperPhoneCountry[];
};

export function LoginScreen({ phoneCountries }: LoginScreenProps) {
  const t = useTranslations('shipperMobileFlow.auth.login');
  const tCountries = useTranslations('shipperMobileFlow.phoneCountries');
  const router = useRouter();
  const [country, setCountry] = useState('+55');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ctaState, setCtaState] = useState<ShipperCtaState>('idle');

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
    <MobileAppShell>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>{t('title')}</h2>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="country">
            {t('country')}
          </label>
          <select
            id="country"
            className={styles.select}
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
            className={styles.input}
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
            className={styles.input}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <PrimaryButton label={t('submit')} type="submit" state={ctaState} />
        <PrimaryButton label={t('registerLink')} href="/registrar" variant="ghost" />
      </form>
    </MobileAppShell>
  );
}
