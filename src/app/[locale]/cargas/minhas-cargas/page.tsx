import { redirect } from 'next/navigation';
import type { AppLocale } from '@/shared/routing/route-types';
import { appRoutes } from '@/shared/routing/app-routes';

export default async function MinhasCargasAliasPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(appRoutes.cargos.myCargos(locale as AppLocale));
}
