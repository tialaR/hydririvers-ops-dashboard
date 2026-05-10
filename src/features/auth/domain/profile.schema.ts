import { z } from 'zod';
import { normalizedEmailSchema } from './auth-schemas';

const optionalText = z.string().trim().optional().transform((value) => {
  const next = value?.trim();
  return next ? next : undefined;
});

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, 'profile-name-required'),
  email: normalizedEmailSchema.pipe(z.string().min(1, 'profile-email-required')),
  company: z.string().trim().min(1, 'profile-company-required'),
  phone: optionalText,
  city: optionalText,
  avatarUrl: optionalText
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;
