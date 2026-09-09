import { cookies } from 'next/headers';
import { hasLocale } from 'next-intl';
import { redirect } from 'next/navigation';

import { routing } from '@/core/i18n/routing';
import { cookieNames } from '@/shared/http/cookie-names';

export default async function RootPage() {
  const cookieStore = await cookies();
  const requestedLocale = cookieStore.get(cookieNames.locale)?.value;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  redirect(`/${locale}`);
}
