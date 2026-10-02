import { redirect } from 'next/navigation';

export default async function LegacyPublicCargoDetailAlias({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect(`/${locale}/cargas/${encodeURIComponent(id)}`);
}
