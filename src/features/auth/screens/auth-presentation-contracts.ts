import type { FormEvent } from 'react';
import type { AuthPhoneCountryOption } from '@/features/auth/domain/auth-experience-types';

export type AuthCtaState = 'idle' | 'pressed' | 'loading' | 'success' | 'error' | 'disabled';
export type { AuthPhoneCountryOption };
export type { FormEvent };
