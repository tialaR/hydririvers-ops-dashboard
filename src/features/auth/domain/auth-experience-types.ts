export type AuthPhoneCountryCode = '+55' | '+34' | '+1';

export type AuthExperienceUser = {
  id: string;
  name: string;
  company: string;
  role: 'shipper';
  avatarInitials: string;
  locale: string;
};

export type AuthPhoneCountryOption = {
  code: AuthPhoneCountryCode;
  labelKey: string;
  placeholderKey: string;
};
