import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/components/profile-panel/profile-panel', () => ({
  ProfilePanel: () => React.createElement('div', { 'data-testid': 'profile-panel' })
}));

vi.mock('@/shared/layout/locale-shell', () => ({
  LocaleShell: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'locale-shell' }, children)
}));

import ProfilePage from '@/app/[locale]/(shipper-mobile-flow)/perfil/page';

describe('profile page', () => {
  it('renderiza o perfil completo dentro do chrome canônico', () => {
    const html = renderToStaticMarkup(ProfilePage() as React.ReactElement);
    expect(html).toContain('locale-shell');
    expect(html).toContain('profile-panel');
  });
});
