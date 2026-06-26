import { z } from 'zod';

const TUNISIAN_STATES = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès',
  'Gafsa', 'Jendouba', 'Kairouan', 'Kasserine', 'Kébili',
  'Le Kef', 'Mahdia', 'La Manouba', 'Médenine', 'Monastir',
  'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse',
  'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan',
] as const;

const TUNISIAN_PHONE_RE = /^\+216[24579][0-9]{7}$/;

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export const updateMeSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(TUNISIAN_PHONE_RE, 'Invalid Tunisian phone number').optional(),
  state: z.enum(TUNISIAN_STATES as unknown as [string, ...string[]]).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['user', 'admin', 'super_admin']).optional(),
  is_active: z.coerce.boolean().optional(),
  is_email_verified: z.coerce.boolean().optional(),
});

export const changeRoleSchema = z.object({
  role: z.enum(['user', 'admin', 'super_admin']),
});

export const createAdminUserSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(TUNISIAN_PHONE_RE, 'Invalid Tunisian phone number').optional(),
  password: z.string().min(8).max(128),
  state: z.enum(TUNISIAN_STATES as unknown as [string, ...string[]]),
  role: z.enum(['admin', 'super_admin']),
});

export const adminUpdateUserSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(TUNISIAN_PHONE_RE, 'Invalid Tunisian phone number').nullable().optional(),
  state: z.enum(TUNISIAN_STATES as unknown as [string, ...string[]]).optional(),
});

export const emailVerificationSchema = z.object({
  is_email_verified: z.boolean(),
});

export const deleteMeSchema = z.object({
  password: z.string().min(1).optional(),
});

export const adminResetPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});
