import type { AuthExperienceUser, AuthPhoneCountryOption } from '../domain/auth-experience-types';

export const AUTH_EXPERIENCE_MOCK_OTP = '482916';

export const AUTH_EXPERIENCE_PHONE_COUNTRIES: AuthPhoneCountryOption[] = [
  { code: '+55', labelKey: 'phoneCountries.br', placeholderKey: 'phonePlaceholders.br' },
  { code: '+34', labelKey: 'phoneCountries.es', placeholderKey: 'phonePlaceholders.es' },
  { code: '+1', labelKey: 'phoneCountries.us', placeholderKey: 'phonePlaceholders.us' }
];

export const AUTH_EXPERIENCE_MOCK_USER: AuthExperienceUser = {
  id: 'shipper-001',
  name: 'Ana Ribeiro',
  company: 'Norte Grãos Ltda.',
  role: 'shipper',
  avatarInitials: 'AR',
  locale: 'pt-BR'
};
