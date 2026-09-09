'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { useRouter } from '@/core/i18n/navigation';
import { demoPassword, demoShipperEmail } from '@/features/auth/domain/auth-constants';
import { qaDirectLogin } from '@/features/auth/services/auth.client';
import { PrimaryButton } from '@/features/product-shell/components/primary-button/primary-button';
import { QA_LOGIN_PREFILL_STORAGE_KEY } from '@/shared/qa/login-prefill';
import { intlAppPaths } from '@/shared/routing/app-routes';

export function DemoEntryButton() {
  const t = useTranslations('shipperMobileFlow.landing');
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function enterDemo() {
    setPending(true);
    try {
      await qaDirectLogin(demoShipperEmail);
      router.push(intlAppPaths.cargos.myCargos);
    } catch {
      try {
        sessionStorage.setItem(
          QA_LOGIN_PREFILL_STORAGE_KEY,
          JSON.stringify({ email: demoShipperEmail, password: demoPassword }),
        );
      } catch {
        // The query prefill still keeps the fallback useful if storage is unavailable.
      }
      const next = encodeURIComponent(`/${locale}${intlAppPaths.cargos.myCargos}`);
      router.push(`${intlAppPaths.auth.login}?prefill=${encodeURIComponent(demoShipperEmail)}&next=${next}`);
    }
  }

  return (
    <PrimaryButton
      label={pending ? t('demoLoading') : t('demoCta')}
      onClick={enterDemo}
      state={pending ? 'loading' : 'idle'}
    />
  );
}
