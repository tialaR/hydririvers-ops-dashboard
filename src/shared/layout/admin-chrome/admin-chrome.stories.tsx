'use client';

import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';

import { AdminChrome } from './admin-chrome';

const storyUser = {
  id: 'storybook-shipper',
  name: 'Tiala Rocha',
  email: 'tiala@hydrorivers.com',
  company: 'Cooperativa Açaí Norte',
  role: 'shipper',
  approved: true,
  countryCode: '+55',
  phone: '91999990001',
  phoneE164: '+5591999990001',
  city: 'Belém, PA',
  persistenceKind: 'seed',
};

const withShellApi: Decorator = (Story) => {
  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
    const path = new URL(raw, window.location.origin).pathname;

    if (path === '/api/auth/me') {
      return new Response(JSON.stringify({ user: storyUser }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (path === '/api/auth/logout' && init?.method === 'POST') {
      return new Response(null, { status: 204 });
    }

    return originalFetch(input, init);
  };

  return <Story />;
};

function ShellFixture() {
  return (
    <AdminChrome>
      <main style={{ minHeight: 'calc(100vh - 72px)', padding: '24px', background: '#080808', color: '#f3f3f3' }}>
        <section style={{ minHeight: '620px', border: '1px solid #2b2b2b', borderRadius: '14px', background: '#111', padding: '24px' }}>
          <small style={{ color: '#858585', letterSpacing: '.08em' }}>PRODUCT SHELL</small>
          <h1 style={{ margin: '8px 0 6px', letterSpacing: '-.035em' }}>Desktop chrome da embarcadora</h1>
          <p style={{ margin: 0, maxWidth: '720px', color: '#9b9b9b' }}>
            Valide sidebar, collapse, busca, idioma, tema, notificações e acesso ao perfil.
          </p>
        </section>
      </main>
    </AdminChrome>
  );
}

const meta = {
  title: 'Product/Shell/Desktop Chrome',
  component: ShellFixture,
  decorators: [withShellApi],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Canonical authenticated desktop shell with sidebar and topbar isolated for product validation.',
      },
    },
  },
} satisfies Meta<typeof ShellFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};
