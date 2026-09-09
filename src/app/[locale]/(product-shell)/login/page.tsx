import { redirect } from 'next/navigation';

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' ? raw : undefined;
}

/** @deprecated Compatibility alias. Canonical public login is /entrar. */
export default async function LegacyLoginAlias({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ prefill?: string | string[]; next?: string | string[] }>;
}) {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  const query = new URLSearchParams();
  const prefill = firstSearchParam(sp.prefill);
  const next = firstSearchParam(sp.next);
  if (prefill) query.set('prefill', prefill);
  if (next) query.set('next', next);
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  redirect(`/${locale}/entrar${suffix}`);
}
