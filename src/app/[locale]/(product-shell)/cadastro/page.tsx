import { redirect } from 'next/navigation';

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' ? raw : undefined;
}

/** @deprecated Compatibility alias. Canonical public registration is /registrar. */
export default async function LegacyRegisterAlias({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ prefill?: string | string[] }>;
}) {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  const query = new URLSearchParams();
  const prefill = firstSearchParam(sp.prefill);
  if (prefill) query.set('prefill', prefill);
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  redirect(`/${locale}/registrar${suffix}`);
}
