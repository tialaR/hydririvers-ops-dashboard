import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';

import { Page62ShipperJourneyDemo } from './page-62-shipper-journey-demo';

const withAuthApi: Decorator = (Story) => {
  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
    const path = new URL(raw, window.location.origin).pathname;
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) as Record<string, unknown> : {};

    if (path === '/api/auth/login' || path === '/api/auth/register') {
      if (typeof body.otp === 'string' && body.otp.length === 6) {
        return new Response(JSON.stringify({
          user: {
            id: 'storybook-shipper',
            name: 'Tiala Rocha',
            email: typeof body.email === 'string' ? body.email : 'tiala@hydrorivers.com',
            company: 'Cooperativa Açaí Norte',
            role: 'shipper',
            approved: true,
            countryCode: '+55',
            phone: '91999990001',
            phoneE164: '+5591999990001',
            city: 'Belém, PA',
            persistenceKind: 'seed',
          },
        }), { status: path.endsWith('/register') ? 201 : 200, headers: { 'content-type': 'application/json' } });
      }

      return new Response(JSON.stringify({
        otpRequired: true,
        challenge: 'storybook-auth-challenge',
        expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
        expiresInSeconds: 300,
        phoneE164: '+5591999990001',
        otpCode: '314159',
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    return originalFetch(input, init);
  };

  return <Story />;
};

const meta = {
  title: 'Page 62/Shipper Journey',
  component: Page62ShipperJourneyDemo,
  tags: ['autodocs'],
  decorators: [withAuthApi],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive Page 62 shipper journey built from the delivered Figma exports and the evidence-backed domain contract. DEMO data remains explicit and repository-shaped for a future API adapter.',
      },
    },
  },
} satisfies Meta<typeof Page62ShipperJourneyDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullFlow: Story = {
  args: { initial: 'auth' },
  parameters: {
    docs: {
      description: {
        story: 'Fluxo completo da Embarcadora: autenticação/OTP → D01–D12 → retorno ao Cockpit pós-ação, com ramificação de correção/reenvio.',
      },
    },
  },
};

export const AuthAccess: Story = { args: { initial: 'auth' } };
export const Overview: Story = { args: { initial: 'discovery' } };
export const D04D05Cockpit: Story = { args: { initial: 'cockpit' } };
export const D06D07DocumentsRisk: Story = { args: { initial: 'documentsRisk' } };
export const D08D09Negotiation: Story = { args: { initial: 'negotiation' } };
export const D10ActionReview: Story = { args: { initial: 'review' } };
export const D11ActionFeedback: Story = { args: { initial: 'feedback' } };
export const D12CorrectionResubmit: Story = { args: { initial: 'correction' } };
export const PostActionCockpit: Story = {
  args: { initial: 'cockpit', initialPostAction: 'documentCorrected' },
};
