'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import type { AuthCtaState } from './auth-presentation-contracts';
import { AuthActionButton } from '@/features/auth/components/auth-action-button/auth-action-button';
import { AuthShell } from '@/features/auth/components/auth-shell/auth-shell';

import styles from '../styles/auth-experience.module.sass';

const OTP_LENGTH = 6;

type VerifyOtpScreenProps = {
  mockOtp: string;
};

export function VerifyOtpScreen({ mockOtp }: VerifyOtpScreenProps) {
  const t = useTranslations('shipperMobileFlow.auth.otp');
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [ctaState, setCtaState] = useState<AuthCtaState>('idle');
  const authCardClass = styles.authCard;
  const hasError = Boolean(error);
  const code = useMemo(() => digits.join(''), [digits]);
  const resolveOtpInputClass = (digit: string, inputHasError: boolean) => {
    void digit;
    void inputHasError;
    return styles.otpInput;
  };

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
      setCtaState('success');
      router.push('/cockpit');
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
          <span className={styles.authSecureBadge}>{t('secureBadge')}</span>
          <h2 className={styles.formTitle}>{t('title')}</h2>
          <p className={styles.formIntro}>{t('subtitle')}</p>
          <div className={styles.authHighlights} aria-label={t('highlightsAria')}>
            <span className={styles.authHighlight}>{t('highlightFraud')}</span>
            <span className={styles.authHighlight}>{t('highlightTraceability')}</span>
            <span className={styles.authHighlight}>{t('highlightSession')}</span>
          </div>
          <div className={styles.otpRow} role="group" aria-label={t('title')}>
            {digits.map((digit, index) => (
              <input
                key={index}
                className={resolveOtpInputClass(digit, hasError)}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                aria-label={t('digit', { index: index + 1 })}
              />
            ))}
          </div>
          <p className={styles.formIntro}>{t('resendHint')}</p>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <div className={styles.formActions}>
            <AuthActionButton label={t('submit')} type="submit" state={ctaState} />
            <AuthActionButton label={t('changePhone')} href="/entrar" variant="ghost" />
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
