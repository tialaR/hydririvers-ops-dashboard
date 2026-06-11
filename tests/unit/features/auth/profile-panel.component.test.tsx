import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => {
    const t = (key: string) => `${ns}.${key}`;
    return Object.assign(t, { has: () => true, raw: () => undefined });
  },
}));

vi.mock('next/image', () => ({
  default: (props: { alt?: string }) => createElement('img', { alt: props.alt ?? '' }),
}));

vi.mock('@/features/auth/hooks/use-auth-session', () => ({
  useAuthSession: () => ({
    ready: true,
    user: {
      id: 'u1',
      name: 'Ana Silva',
      email: 'ana@example.com',
      company: 'Rio Log',
      role: 'shipper',
      approved: true,
      phoneE164: '+5511999999999',
    },
  }),
}));

vi.mock('@/features/auth/services/auth.client', () => ({
  updateProfile: vi.fn(),
}));

import { ProfilePanel } from '@/features/auth/components/profile-panel/profile-panel';

describe('ProfilePanel DS v2', () => {
  it('renderiza surface de identidade e formulário', () => {
    const html = renderToStaticMarkup(createElement(ProfilePanel));
    expect(html).toContain('Ana Silva');
    expect(html).toContain('name="phone"');
    expect(html).toContain('type="submit"');
  });
});
