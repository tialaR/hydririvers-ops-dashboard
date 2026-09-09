import { redirect } from 'next/navigation';
import type { AppLocale } from '@/shared/routing/route-types';
import { appRoutes } from '@/shared/routing/app-routes';

export default async function LegacyMyCargoDetailAliasPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  redirect(appRoutes.cargos.myCargoDetail(locale as AppLocale, id));
}
