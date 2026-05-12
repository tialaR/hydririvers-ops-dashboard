import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { ProfilePanel } from '@/features/auth/components/profile-panel/profile-panel';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.profile' });
  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <ProfilePanel />
    </PageShell>
  );
}
