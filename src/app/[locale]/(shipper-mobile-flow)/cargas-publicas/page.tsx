import { redirect } from 'next/navigation';

export default async function LegacyPublicCargoesAlias({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/cargas`);
}
