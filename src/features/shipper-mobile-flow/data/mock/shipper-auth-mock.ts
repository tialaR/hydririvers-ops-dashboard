import type { ShipperPhoneCountry } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

export const SHIPPER_MOCK_OTP = '482916';

export const SHIPPER_PHONE_COUNTRIES: ShipperPhoneCountry[] = [
  { code: '+55', labelKey: 'phoneCountries.br', placeholderKey: 'phonePlaceholders.br' },
  { code: '+34', labelKey: 'phoneCountries.es', placeholderKey: 'phonePlaceholders.es' },
  { code: '+1', labelKey: 'phoneCountries.us', placeholderKey: 'phonePlaceholders.us' }
];
