import { ProfilePanel } from '@/features/auth/components/profile-panel/profile-panel';
import { LocaleShell } from '@/shared/layout/locale-shell';

export default function ProfilePage() {
  return (
    <LocaleShell>
      <ProfilePanel />
    </LocaleShell>
  );
}
