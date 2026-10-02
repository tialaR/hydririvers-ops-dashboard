import { redirect } from 'next/navigation';

export default async function VerifyOtpCompatibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/entrar`);
}
