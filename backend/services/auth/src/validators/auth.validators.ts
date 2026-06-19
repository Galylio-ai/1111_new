import { z } from 'zod';

const TUNISIAN_STATES = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès',
  'Gafsa', 'Jendouba', 'Kairouan', 'Kasserine', 'Kébili',
  'Le Kef', 'Mahdia', 'La Manouba', 'Médenine', 'Monastir',
  'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse',
  'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan',
] as const;

const TUNISIAN_PHONE_RE = /^\+216[24579][0-9]{7}$/;

export const registerSchema = z
  .object({
    full_name: z.string().min(2).max(100),
    email: z.string().email().optional(),
    phone: z.string().regex(TUNISIAN_PHONE_RE, 'Invalid Tunisian phone number').optional(),
    password: z.string().min(8).max(128),
    state: z.enum(TUNISIAN_STATES as unknown as [string, ...string[]]),
  })
  .refine((d) => d.email || d.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
  });

export const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().regex(TUNISIAN_PHONE_RE).optional(),
    password: z.string().min(1),
  })
  .refine((d) => d.email || d.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
  });

export const googleSchema = z.object({
  id_token: z.string().min(1),
  state: z.enum(TUNISIAN_STATES as unknown as [string, ...string[]]).optional(),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export const logoutSchema = z.object({
  refresh_token: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  otp: z.string().length(6).regex(/^\d{6}$/),
});

export const resendOtpSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).regex(/^\d{6}$/),
  new_password: z.string().min(8).max(128),
});
