import { demoPassword } from '@/features/auth/domain/auth-constants';
import type { HydroUser, UserRole } from '@/features/auth/domain/auth.types';
import type { AppLocale } from '@/shared/routing/route-types';
import { intlAppPaths } from '@/shared/routing/app-routes';

export type MockUserStatus = 'active' | 'pending';

export type MockRegistryCountry = 'BR' | 'US' | 'ES';

export type MockQaPersonaId =
  | 'tiala'
  | 'mariana'
  | 'joao'
  | 'carlos'
  | 'ana'
  | 'admin'
  | 'emily-hartwell'
  | 'marcus-whitfield'
  | 'priya-nair'
  | 'lucia-morales'
  | 'pablo-ribera'
  | 'elena-castillo';

export type MockRegistryUser = {
  id: string;
  qaPersonaId: MockQaPersonaId;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneE164: string;
  country: MockRegistryCountry;
  locale: AppLocale;
  role: UserRole;
  businessRole: 'shipper' | 'carrier' | 'admin';
  companyName: string;
  passwordDemo: string;
  passwordHash: string;
  status: MockUserStatus;
  city: string;
  primaryRoutes: readonly string[];
  qaUseCase: string;
  expectedCapabilities: readonly string[];
  qaHubVisible: boolean;
  qaDirectLoginAllowed: boolean;
  directLoginRedirectPath: string;
};

export type MockPublicVisitor = {
  id: 'visitor';
  displayName: string;
  primaryRoutes: readonly string[];
  blockedRoutes: readonly string[];
  qaUseCase: string;
};

const E164_PATTERN = /^\+[1-9]\d{6,14}$/;

const BR_USERS: readonly MockRegistryUser[] = [
  {
    id: 'u-shipper-1',
    qaPersonaId: 'tiala',
    firstName: 'Tiala',
    lastName: 'Rocha',
    displayName: 'Tiala Rocha',
    email: 'tiala@hydrorivers.com',
    phoneE164: '+5591999990001',
    country: 'BR',
    locale: 'pt-BR',
    role: 'shipper',
    businessRole: 'shipper',
    companyName: 'Cooperativa Açaí Norte',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-tiala$9dcd4a88f3067bdede443b11a6e0b0a4b9156c2ecb9d65ab51d97999cd3d0c56',
    status: 'active',
    city: 'Belém, PA',
    primaryRoutes: [intlAppPaths.cargos.marketplace, intlAppPaths.cargos.myCargos],
    qaUseCase: 'Embarcadora aprovada — fluxos completos de shipper e minhas cargas.',
    expectedCapabilities: ['marketplace', 'my-cargos-owner', 'publish-cargo', 'negotiate', 'track'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.cargos.marketplace
  },
  {
    id: 'u-shipper-2',
    qaPersonaId: 'mariana',
    firstName: 'Mariana',
    lastName: 'Tapajós',
    displayName: 'Mariana Tapajós',
    email: 'mariana@bioamazonia.coop',
    phoneE164: '+5593999990004',
    country: 'BR',
    locale: 'pt-BR',
    role: 'shipper',
    businessRole: 'shipper',
    companyName: 'BioAmazônia Cooperativa',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-mariana$f48848f7f1cf1228e6f67a0c9878f580e186c1b129b4735955a61303f77add03',
    status: 'active',
    city: 'Santarém, PA',
    primaryRoutes: [intlAppPaths.cargos.marketplace, intlAppPaths.cargos.myCargos],
    qaUseCase: 'Segunda embarcadora BR — validar múltiplos shippers e dados Santarém/Tapajós.',
    expectedCapabilities: ['marketplace', 'my-cargos-owner', 'publish-cargo', 'negotiate', 'track'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.cargos.marketplace
  },
  {
    id: 'u-carrier-1',
    qaPersonaId: 'joao',
    firstName: 'João',
    lastName: 'Navegante',
    displayName: 'João Navegante',
    email: 'joao@naveganorte.com',
    phoneE164: '+5592999990002',
    country: 'BR',
    locale: 'pt-BR',
    role: 'carrier',
    businessRole: 'carrier',
    companyName: 'Navega Norte',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-joao$e5ec12970d513aa07db1f371bbe47bb8c0fb567b859ee26b0986647792a1c40d',
    status: 'active',
    city: 'Manaus, AM',
    primaryRoutes: [intlAppPaths.cargos.marketplace, intlAppPaths.cargos.myCargos, intlAppPaths.negotiations.home],
    qaUseCase: 'Transportador aprovado — negociações e cargas vinculadas.',
    expectedCapabilities: ['marketplace', 'my-cargos-assigned', 'negotiate', 'track'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.cargos.marketplace
  },
  {
    id: 'u-carrier-2',
    qaPersonaId: 'carlos',
    firstName: 'Carlos',
    lastName: 'Madeira',
    displayName: 'Carlos Madeira',
    email: 'carlos@hidroviasmadeira.com',
    phoneE164: '+5569999990005',
    country: 'BR',
    locale: 'pt-BR',
    role: 'carrier',
    businessRole: 'carrier',
    companyName: 'Hidrovias Madeira',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-carlos$6355a3ddc3ee0a74bceaa888703856ec4cbb4e9ce83270b46bfd29625e17b2d0',
    status: 'active',
    city: 'Porto Velho, RO',
    primaryRoutes: [intlAppPaths.cargos.marketplace, intlAppPaths.cargos.myCargos, intlAppPaths.negotiations.home],
    qaUseCase: 'Segundo transportador aprovado — comparar escopo de assistente e negociação.',
    expectedCapabilities: ['marketplace', 'my-cargos-assigned', 'negotiate', 'track'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.cargos.marketplace
  },
  {
    id: 'u-carrier-3',
    qaPersonaId: 'ana',
    firstName: 'Ana',
    lastName: 'Solimões',
    displayName: 'Ana Solimões',
    email: 'ana@rioslog.com',
    phoneE164: '+5597999990006',
    country: 'BR',
    locale: 'pt-BR',
    role: 'carrier',
    businessRole: 'carrier',
    companyName: 'RiosLog Amazônia',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-ana$a893e202bc19a8c8fb09aa8dfa9f2983b56324069a881b65012afb25e8ff6bae',
    status: 'pending',
    city: 'Tabatinga, AM',
    primaryRoutes: [intlAppPaths.cargos.marketplace, intlAppPaths.auth.profile],
    qaUseCase: 'Transportadora em moderação — restrições por approved=false.',
    expectedCapabilities: ['marketplace-limited', 'profile-pending'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.auth.profile
  },
  {
    id: 'u-admin-1',
    qaPersonaId: 'admin',
    firstName: 'Operação',
    lastName: 'HydroRivers',
    displayName: 'Operação HydroRivers',
    email: 'admin@hydrorivers.com',
    phoneE164: '+5591999990003',
    country: 'BR',
    locale: 'pt-BR',
    role: 'admin',
    businessRole: 'admin',
    companyName: 'HydroRivers',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-admin$ab428a37474350a500c4969c3bd1ad6842d292dceef3b037c3206b25bb62d3d5',
    status: 'active',
    city: 'Belém, PA',
    primaryRoutes: [intlAppPaths.admin.home, intlAppPaths.cargos.marketplace],
    qaUseCase: 'Administração interna — painel admin e troca de cenário mock.',
    expectedCapabilities: ['admin-panel', 'mock-mode-reset', 'broad-read'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.admin.home
  }
] as const;

const US_USERS: readonly MockRegistryUser[] = [
  {
    id: 'u-us-shipper-1',
    qaPersonaId: 'emily-hartwell',
    firstName: 'Emily',
    lastName: 'Hartwell',
    displayName: 'Emily Hartwell',
    email: 'emily.hartwell@mississippi-logistics.com',
    phoneE164: '+15550100001',
    country: 'US',
    locale: 'en-US',
    role: 'shipper',
    businessRole: 'shipper',
    companyName: 'Mississippi Logistics Co.',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-emily-hartwell$70f3625638e62067ee5fd1e334a4f1b9b0fd744673e3ce50b55a80f40e14ce04',
    status: 'active',
    city: 'Memphis, TN',
    primaryRoutes: [intlAppPaths.cargos.marketplace, intlAppPaths.cargos.myCargos],
    qaUseCase: 'Shipper en-US — validar locale, dial +1 e auth internacional (sem cargas US).',
    expectedCapabilities: ['marketplace', 'locale-en-US', 'phone-e164-us'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.cargos.marketplace
  },
  {
    id: 'u-us-carrier-1',
    qaPersonaId: 'marcus-whitfield',
    firstName: 'Marcus',
    lastName: 'Whitfield',
    displayName: 'Marcus Whitfield',
    email: 'marcus.whitfield@ohioriverfreight.com',
    phoneE164: '+15550100002',
    country: 'US',
    locale: 'en-US',
    role: 'carrier',
    businessRole: 'carrier',
    companyName: 'Ohio River Freight',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-marcus-whitfield$81033b5e7b7f6ccbb71706113b07bec5e5deed726f4ec9cab9bd027d20a0a5ec',
    status: 'active',
    city: 'Louisville, KY',
    primaryRoutes: [intlAppPaths.cargos.marketplace, intlAppPaths.negotiations.home],
    qaUseCase: 'Carrier en-US aprovado — telefone +1 e permissões de transportador.',
    expectedCapabilities: ['marketplace', 'locale-en-US', 'phone-e164-us', 'negotiate'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.cargos.marketplace
  },
  {
    id: 'u-us-carrier-2',
    qaPersonaId: 'priya-nair',
    firstName: 'Priya',
    lastName: 'Nair',
    displayName: 'Priya Nair',
    email: 'priya.nair@greatlakesnav.com',
    phoneE164: '+15550100003',
    country: 'US',
    locale: 'en-US',
    role: 'carrier',
    businessRole: 'carrier',
    companyName: 'Great Lakes Navigation',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-priya-nair$d9fed6e4efa434c311d3cac1742fccbea26b7d11dafad57cf5d994a6d46fc42b',
    status: 'pending',
    city: 'New Orleans, LA',
    primaryRoutes: [intlAppPaths.cargos.marketplace, intlAppPaths.auth.profile],
    qaUseCase: 'Carrier en-US pendente — moderação e locale en-US.',
    expectedCapabilities: ['marketplace-limited', 'profile-pending', 'locale-en-US'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.auth.profile
  }
] as const;

const ES_USERS: readonly MockRegistryUser[] = [
  {
    id: 'u-es-shipper-1',
    qaPersonaId: 'lucia-morales',
    firstName: 'Lucía',
    lastName: 'Morales',
    displayName: 'Lucía Morales',
    email: 'lucia.morales@hidrovia-iberica.es',
    phoneE164: '+34600999001',
    country: 'ES',
    locale: 'es',
    role: 'shipper',
    businessRole: 'shipper',
    companyName: 'Hidrovía Ibérica',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-lucia-morales$3b2344ff94ee5f99cf43a3ea53b26a309c1557123d5ec241a241d89e3ceb0f1d',
    status: 'active',
    city: 'Valencia',
    primaryRoutes: [intlAppPaths.cargos.marketplace, intlAppPaths.cargos.myCargos],
    qaUseCase: 'Embarcadora es — validar locale es, dial +34 e auth (sem cargas ES).',
    expectedCapabilities: ['marketplace', 'locale-es', 'phone-e164-es'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.cargos.marketplace
  },
  {
    id: 'u-es-carrier-1',
    qaPersonaId: 'pablo-ribera',
    firstName: 'Pablo',
    lastName: 'Ribera',
    displayName: 'Pablo Ribera',
    email: 'pablo.ribera@riberaebro.es',
    phoneE164: '+34600999002',
    country: 'ES',
    locale: 'es',
    role: 'carrier',
    businessRole: 'carrier',
    companyName: 'Ribera del Ebro Logística',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-pablo-ribera$ad7f3bd6136b2b589339cb9e51bf68f6411ecbecd51d4d4304c85de8157da781',
    status: 'active',
    city: 'Sevilla',
    primaryRoutes: [intlAppPaths.cargos.marketplace, intlAppPaths.negotiations.home],
    qaUseCase: 'Transportista es aprobado — permisos de carrier y locale es.',
    expectedCapabilities: ['marketplace', 'locale-es', 'phone-e164-es', 'negotiate'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.cargos.marketplace
  },
  {
    id: 'u-es-carrier-2',
    qaPersonaId: 'elena-castillo',
    firstName: 'Elena',
    lastName: 'Castillo',
    displayName: 'Elena Castillo',
    email: 'elena.castillo@canal-logistica.es',
    phoneE164: '+34600999003',
    country: 'ES',
    locale: 'es',
    role: 'carrier',
    businessRole: 'carrier',
    companyName: 'Canal Logística',
    passwordDemo: demoPassword,
    passwordHash:
      'pbkdf2_sha256$100000$hydrorivers-elena-castillo$9eb69b34101041eacb0d74e47cb435d023b080775cb95ed03f0fe8c0f20f7801',
    status: 'pending',
    city: 'Barcelona',
    primaryRoutes: [intlAppPaths.cargos.marketplace, intlAppPaths.auth.profile],
    qaUseCase: 'Transportista es pendiente — moderación y locale es.',
    expectedCapabilities: ['marketplace-limited', 'profile-pending', 'locale-es'],
    qaHubVisible: true,
    qaDirectLoginAllowed: true,
    directLoginRedirectPath: intlAppPaths.auth.profile
  }
] as const;

/** Fonte canônica única de usuários mock autenticados (Fase 2). */
export const MOCK_USER_REGISTRY: readonly MockRegistryUser[] = [...BR_USERS, ...US_USERS, ...ES_USERS];

/** Visitante não autenticado — caso separado, fora do registry de usuários. */
export const MOCK_PUBLIC_VISITOR: MockPublicVisitor = {
  id: 'visitor',
  displayName: 'Visitante',
  primaryRoutes: [intlAppPaths.cargos.marketplace],
  blockedRoutes: [intlAppPaths.cargos.myCargos],
  qaUseCase: 'Marketplace público sem sessão; minhas cargas bloqueado.'
};

const COUNTRY_DIAL_CODE: Record<MockRegistryCountry, string> = {
  BR: '+55',
  US: '+1',
  ES: '+34'
};

export type MockQaPersona = {
  id: MockQaPersonaId;
  mockUserId: string;
  email: string;
  password: string;
  role: UserRole;
  approved: boolean;
  companyDisplay: string;
  directLoginRedirectPath: string;
};

function registryCountryDialCode(country: MockRegistryCountry): string {
  return COUNTRY_DIAL_CODE[country];
}

export function toHydroUser(entry: MockRegistryUser): HydroUser {
  return {
    id: entry.id,
    name: entry.displayName,
    email: entry.email,
    company: entry.companyName,
    role: entry.role,
    approved: entry.status === 'active',
    city: entry.city,
    countryCode: registryCountryDialCode(entry.country),
    phone: entry.phoneE164,
    phoneE164: entry.phoneE164,
    passwordHash: entry.passwordHash,
    persistenceKind: 'seed'
  };
}

export function toHydroUsers(registry: readonly MockRegistryUser[] = MOCK_USER_REGISTRY): HydroUser[] {
  return registry.map(toHydroUser);
}

export function toQaPersona(entry: MockRegistryUser): MockQaPersona {
  return {
    id: entry.qaPersonaId,
    mockUserId: entry.id,
    email: entry.email,
    password: entry.passwordDemo,
    role: entry.role,
    approved: entry.status === 'active',
    companyDisplay: entry.companyName,
    directLoginRedirectPath: entry.directLoginRedirectPath
  };
}

export function toQaPersonas(registry: readonly MockRegistryUser[] = MOCK_USER_REGISTRY): MockQaPersona[] {
  return registry.filter((entry) => entry.qaHubVisible).map(toQaPersona);
}

export function getMockUserById(id: string): MockRegistryUser | undefined {
  return MOCK_USER_REGISTRY.find((entry) => entry.id === id);
}

export function getMockUserByEmail(email: string): MockRegistryUser | undefined {
  const normalized = email.trim().toLowerCase();
  return MOCK_USER_REGISTRY.find((entry) => entry.email.toLowerCase() === normalized);
}

export function getMockUserByPhone(phoneE164: string): MockRegistryUser | undefined {
  const normalized = phoneE164.replace(/\D/g, '');
  return MOCK_USER_REGISTRY.find((entry) => entry.phoneE164.replace(/\D/g, '') === normalized);
}

export function getMockUsersVisibleInQaHub(): MockRegistryUser[] {
  return MOCK_USER_REGISTRY.filter((entry) => entry.qaHubVisible);
}

export function getQaDirectLoginEmails(): string[] {
  return MOCK_USER_REGISTRY.filter((entry) => entry.qaDirectLoginAllowed).map((entry) => entry.email);
}

export function findSeedPhoneByEmail(email: string): { countryCode: string; phone: string } | null {
  const entry = getMockUserByEmail(email);
  if (!entry) return null;
  return {
    countryCode: registryCountryDialCode(entry.country),
    phone: entry.phoneE164
  };
}

export function isValidE164(phone: string): boolean {
  return E164_PATTERN.test(phone);
}
