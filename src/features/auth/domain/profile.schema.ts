import { z } from 'zod';
import { normalizedEmailSchema, phoneE164Schema } from './auth-schemas';

const optionalText = z.string().trim().optional().transform((value) => {
  const next = value?.trim();
  return next ? next : undefined;
});

/** Normaliza entrada do perfil para E.164 (+ e apenas dígitos após o +). */
export function normalizeProfilePhoneInput(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  if (!t.startsWith('+')) return t;
  return `+${t.replace(/\D/g, '')}`;
}

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, 'profile-name-required'),
  email: normalizedEmailSchema.pipe(z.string().min(1, 'profile-email-required')),
  company: z.string().trim().min(1, 'profile-company-required'),
  phone: z
    .string()
    .trim()
    .min(1, 'profile-phone-required')
    .transform(normalizeProfilePhoneInput)
    .superRefine((val, ctx) => {
      if (!val.startsWith('+')) {
        ctx.addIssue({ code: 'custom', message: 'profile-phone-no-country' });
        return;
      }
      if (!phoneE164Schema.safeParse(val).success) {
        ctx.addIssue({ code: 'custom', message: 'profile-phone-invalid' });
      }
    }),
  city: z.string().trim().min(1, 'profile-city-required'),
  avatarUrl: optionalText
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;
