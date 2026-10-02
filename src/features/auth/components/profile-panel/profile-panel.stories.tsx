'use client';

import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';

import { ProfilePanel } from './profile-panel';

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

const withProfileApi: Decorator = (Story) => {
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

    if (path === '/api/auth/profile' && init?.method === 'PUT') {
      const body = typeof init.body === 'string' ? JSON.parse(init.body) : {};
      return new Response(JSON.stringify({ user: { ...storyUser, ...body } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    return originalFetch(input, init);
  };

  return <Story />;
};

const meta = {
  title: 'Product/Profile/Profile Panel',
  component: ProfilePanel,
  decorators: [withProfileApi],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Editable authenticated profile in the neutral HydroRivers product DS, including avatar, access status, identity details, and persisted mock editing.',
      },
    },
  },
} satisfies Meta<typeof ProfilePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {};
