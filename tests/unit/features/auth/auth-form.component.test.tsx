import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'pt-BR',
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => createElement('a', { href }, children),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => createElement('div', props, children),
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
      createElement('button', { type: 'button', ...props }, children),
  },
  useReducedMotion: () => true,
}));

vi.mock('@/features/auth/services/auth.client', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

import { AuthForm } from '@/features/auth/components/auth-form/auth-form';

describe('AuthForm DS v2', () => {
  it('renderiza login com telefone e CTA OTP', () => {
    const html = renderToStaticMarkup(createElement(AuthForm, { mode: 'login' }));
    expect(html).toContain('HydroRivers');
    expect(html).toContain('name="phone"');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="password"');
    expect(html).toContain('type="submit"');
  });

  it('renderiza register com campos obrigatórios', () => {
    const html = renderToStaticMarkup(createElement(AuthForm, { mode: 'register' }));
    expect(html).toContain('name="fullName"');
    expect(html).toContain('name="company"');
    expect(html).toContain('role-label');
  });
});
