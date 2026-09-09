import { AdminConsole } from '@/features/admin/components/admin-console/admin-console';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Card } from '@/shared/ui/card/card';
import { getSessionUser } from '@/shared/server/auth';
import { getTranslations } from 'next-intl/server';
import { canAccessRoute } from '@/features/auth/domain/access-control';

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getSessionUser();
  const t = await getTranslations({ locale, namespace: 'pages.admin' });

  if (!canAccessRoute(user, 'admin')) {
    return (
      <PageShell namespace="pages.admin" locale={locale}>
        <Card style={{ borderWidth: 3 }} data-testid="admin-unauthorized">
          <h2>{t('unauthorizedTitle')}</h2>
          <p>{t('unauthorizedDescription')}</p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell namespace="pages.admin" locale={locale}>
      <AdminConsole />
    </PageShell>
  );
}
