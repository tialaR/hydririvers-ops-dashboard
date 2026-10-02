'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AuthForm } from '@/features/auth/components/auth-form/auth-form';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { ProfilePanel } from '@/features/auth/components/profile-panel/profile-panel';
import { Page62ShipperJourneyDemo } from '@/features/cargo/components/shipper-journey/page-62-shipper-journey-demo';
import { PublicCargoDetailScreen } from '@/features/cargo/public/screens/public-cargo-detail-screen';
import { PublicCargoesScreen, type PublicCargoBottomSheetProps } from '@/features/cargo/public/screens/public-cargoes-screen';
import { PUBLIC_CARGOES } from '@/features/cargo/public/mocks/public-cargo.mock';
import { BottomSheet } from '@/features/product-shell/components/bottom-sheet/bottom-sheet';
import { EmptyState } from '@/features/product-shell/components/product-state/product-state';
import { PrimaryButton } from '@/features/product-shell/components/primary-button/primary-button';
import { SearchFilterStack } from '@/features/product-shell/components/search-filter-stack/search-filter-stack';
import { AdminChrome } from '@/shared/layout/admin-chrome/admin-chrome';
import { apiRoutes } from '@/shared/routing/api-routes';

const STORY_OTP = '314159';

const STORY_SHIPPER: HydroUser = {
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

let storyUser: HydroUser | null = null;
let originalFetch: typeof globalThis.fetch | null = null;

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function requestPath(input: RequestInfo | URL) {
  const raw = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
  return new URL(raw, window.location.origin).pathname;
}

function requestBody(init?: RequestInit) {
  if (typeof init?.body !== 'string') return {};
  try {
    return JSON.parse(init.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function installStoryApi(authenticated: boolean) {
  if (!originalFetch) originalFetch = globalThis.fetch.bind(globalThis);
  storyUser = authenticated ? { ...STORY_SHIPPER } : null;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = requestPath(input);

    if (path === apiRoutes.auth.me) {
      return json({ user: storyUser });
    }

    if (path === apiRoutes.auth.login) {
      const body = requestBody(init);
      if (typeof body.otp === 'string' && body.otp.length === 6) {
        storyUser = { ...STORY_SHIPPER };
        return json({ user: storyUser });
      }

      return json({
        otpRequired: true,
        challenge: 'storybook-login-challenge',
        expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
        expiresInSeconds: 300,
        phoneE164: STORY_SHIPPER.phoneE164,
        otpCode: STORY_OTP,
      });
    }

    if (path === apiRoutes.auth.register) {
      const body = requestBody(init);
      if (typeof body.otp === 'string' && body.otp.length === 6) {
        storyUser = {
          ...STORY_SHIPPER,
          id: 'storybook-new-shipper',
          name: typeof body.fullName === 'string' ? body.fullName : STORY_SHIPPER.name,
          email: typeof body.email === 'string' ? body.email : STORY_SHIPPER.email,
          company: typeof body.company === 'string' ? body.company : STORY_SHIPPER.company,
          persistenceKind: 'ephemeral',
        };
        return json({ user: storyUser }, 201);
      }

      return json({
        otpRequired: true,
        challenge: 'storybook-register-challenge',
        expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
        expiresInSeconds: 300,
        phoneE164: typeof body.phoneE164 === 'string' ? body.phoneE164 : STORY_SHIPPER.phoneE164,
        otpCode: STORY_OTP,
      });
    }

    if (path === apiRoutes.auth.profile && init?.method === 'PUT') {
      const body = requestBody(init);
      storyUser = { ...STORY_SHIPPER, ...storyUser, ...body } as HydroUser;
      return json({ user: storyUser });
    }

    if (path === apiRoutes.auth.logout && init?.method === 'POST') {
      storyUser = null;
      return new Response(null, { status: 204 });
    }

    return originalFetch!(input, init);
  };

  window.dispatchEvent(new CustomEvent('hydrorivers:auth-changed'));
}

const withAnonymousApi = async () => {
  installStoryApi(false);
};

const withAuthenticatedApi = async () => {
  installStoryApi(true);
};

const BottomSheetAdapter = (props: PublicCargoBottomSheetProps) => <BottomSheet {...props} />;

function RouteMapStory() {
  const routes = [
    ['01', '/[locale]/cargas', 'Vitrine pública', 'Visitante encontra cargas sem empresa ou preço.'],
    ['02', '/[locale]/cargas/[id]', 'Detalhe público', 'Entende a oportunidade antes de criar conta.'],
    ['03', '/[locale]/entrar', 'Login + OTP', 'Acesso de usuário existente.'],
    ['04', '/[locale]/registrar', 'Registro + OTP', 'Criação e validação de nova conta.'],
    ['05', '/[locale]/dashboard', 'Shell autenticado', 'Entrada privada com sidebar, header, alertas e perfil.'],
    ['06', '/[locale]/minhas-cargas', 'Carteira da embarcadora', 'Descoberta e priorização das cargas próprias.'],
    ['07', '/[locale]/minhas-cargas/[id]', 'Jornada operacional', 'D01–D12 + Cockpit pós-ação.'],
    ['08', '/[locale]/perfil', 'Perfil', 'Identidade, contato, empresa, foto e persistência.'],
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: '#f3f3f3', padding: '32px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        <header>
          <p style={{ margin: 0, color: '#8a8a8a', fontSize: '12px', letterSpacing: '.12em' }}>EMBARCADORA · ROUTE CONTRACT</p>
          <h1 style={{ margin: '8px 0', fontSize: '32px', letterSpacing: '-.04em' }}>Fluxo que precisa ser validado antes do mobile</h1>
          <p style={{ margin: 0, color: '#9b9b9b', maxWidth: '760px' }}>
            Cada rota abaixo possui uma story dedicada neste grupo. O seletor global de idioma valida pt-BR, en-US e es.
          </p>
        </header>
        <section style={{ display: 'grid', border: '1px solid #2b2b2b', borderRadius: '14px', overflow: 'hidden' }}>
          {routes.map(([order, route, title, description], index) => (
            <article
              key={route}
              style={{
                display: 'grid',
                gridTemplateColumns: '44px minmax(210px, .8fr) minmax(180px, .7fr) minmax(0, 1.4fr)',
                gap: '16px',
                alignItems: 'center',
                minHeight: '72px',
                padding: '12px 16px',
                borderTop: index ? '1px solid #2b2b2b' : 0,
                background: '#111',
              }}
            >
              <strong style={{ color: '#727272' }}>{order}</strong>
              <code style={{ color: '#e7e7e7' }}>{route}</code>
              <strong>{title}</strong>
              <span style={{ color: '#969696' }}>{description}</span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function PublicCargoesRouteStory() {
  return (
    <main style={{ width: 'min(100% - 32px, 1120px)', margin: '0 auto', padding: '32px 0 64px' }}>
      <PublicCargoesScreen
        initialCargoes={PUBLIC_CARGOES}
        SearchFilter={SearchFilterStack}
        BottomSheet={BottomSheetAdapter}
        EmptyState={EmptyState}
        ActionButton={PrimaryButton}
      />
    </main>
  );
}

function PublicCargoDetailRouteStory() {
  const cargo = PUBLIC_CARGOES[0];
  return (
    <main style={{ width: 'min(100% - 32px, 900px)', margin: '0 auto', padding: '32px 0 64px' }}>
      <PublicCargoDetailScreen cargo={cargo} ActionButton={PrimaryButton} />
    </main>
  );
}

function LoginRouteStory() {
  return <AuthForm mode="login" loginPrefill={STORY_SHIPPER.email} />;
}

function RegisterRouteStory() {
  return <AuthForm mode="register" />;
}

function PrivateShellStory() {
  return (
    <AdminChrome>
      <main style={{ minHeight: 'calc(100vh - 72px)', padding: '24px', background: '#080808', color: '#f3f3f3' }}>
        <div style={{ border: '1px solid #2b2b2b', borderRadius: '14px', background: '#111', padding: '24px' }}>
          <small style={{ color: '#8b8b8b' }}>SHELL AUTENTICADO</small>
          <h1 style={{ margin: '8px 0 6px' }}>Sidebar + header da embarcadora</h1>
          <p style={{ margin: 0, color: '#9b9b9b' }}>
            Valide navegação, collapse, busca, idioma, tema, notificações e acesso ao perfil antes de abrir a jornada.
          </p>
        </div>
      </main>
    </AdminChrome>
  );
}

function AuthenticatedJourneyStory() {
  return (
    <AdminChrome>
      <Page62ShipperJourneyDemo initial="discovery" />
    </AdminChrome>
  );
}

function ProfileRouteStory() {
  return (
    <AdminChrome>
      <ProfilePanel />
    </AdminChrome>
  );
}

const meta = {
  title: 'Product/Embarcadora/Route Flow',
  component: RouteMapStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Route-level validation flow for the shipper persona. This group closes the public funnel, Auth/OTP, authenticated chrome, Page 62 operational journey, and Profile before the mobile implementation starts.',
      },
    },
  },
} satisfies Meta<typeof RouteMapStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RouteMap: Story = {};

export const PublicCargoes: Story = {
  name: '01 · /cargas · Public marketplace',
  render: () => <PublicCargoesRouteStory />,
};

export const PublicCargoDetail: Story = {
  name: '02 · /cargas/[id] · Public detail',
  render: () => <PublicCargoDetailRouteStory />,
};

export const LoginOtp: Story = {
  name: '03 · /entrar · Login + OTP',
  render: () => <LoginRouteStory />,
  play: withAnonymousApi,
};

export const RegisterOtp: Story = {
  name: '04 · /registrar · Register + OTP',
  render: () => <RegisterRouteStory />,
  play: withAnonymousApi,
};

export const AuthenticatedShell: Story = {
  name: '05 · /dashboard · Sidebar + Header',
  render: () => <PrivateShellStory />,
  play: withAuthenticatedApi,
};

export const ShipperJourney: Story = {
  name: '06–07 · /minhas-cargas → /minhas-cargas/[id]',
  render: () => <AuthenticatedJourneyStory />,
  play: withAuthenticatedApi,
};

export const Profile: Story = {
  name: '08 · /perfil · Editable profile',
  render: () => <ProfileRouteStory />,
  play: withAuthenticatedApi,
};
