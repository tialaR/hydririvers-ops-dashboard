'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/shipper-mobile-flow/components/primary-button/primary-button';
import type { ShipperCtaState } from '@/features/shipper-mobile-flow/types/shipper-flow-types';
import { useShipperFlow } from '@/features/shipper-mobile-flow/providers/shipper-flow-provider';

import styles from '../components/shared-ui/shared-ui.module.sass';

const OTP_LENGTH = 6;

type VerifyOtpScreenProps = {
  mockOtp: string;
};

export function VerifyOtpScreen({ mockOtp }: VerifyOtpScreenProps) {
  const t = useTranslations('shipperMobileFlow.auth.otp');
  const router = useRouter();
  const { setAuthenticated } = useShipperFlow();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [ctaState, setCtaState] = useState<ShipperCtaState>('idle');
  const code = useMemo(() => digits.join(''), [digits]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length < OTP_LENGTH) {
      setError(t('errors.incomplete'));
      return;
    }
    if (code === '000000') {
      setError(t('errors.expired'));
      setCtaState('error');
      return;
    }
    if (code !== mockOtp) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setError(nextAttempts >= 3 ? t('errors.blocked') : t('errors.incorrect'));
      setCtaState('error');
      return;
    }
    setCtaState('loading');
    window.setTimeout(() => {
      setAuthenticated(true);
      setCtaState('success');
      router.push('/cockpit');
    }, 400);
  };

  return (
    <MobileAppShell>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>{t('title')}</h2>
        <p className={styles.summary}>{t('subtitle')}</p>
        <div className={styles.otpRow} role="group" aria-label={t('title')}>
          {digits.map((digit, index) => (
            <input
              key={index}
              className={styles.otpInput}
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              aria-label={t('digit', { index: index + 1 })}
            />
          ))}
        </div>
        <p className={styles.summary}>{t('resendHint')}</p>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <PrimaryButton label={t('submit')} type="submit" state={ctaState} />
        <PrimaryButton label={t('changePhone')} href="/entrar" variant="ghost" />
      </form>
    </MobileAppShell>
  );
}
