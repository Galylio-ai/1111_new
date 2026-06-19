export const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
] as const;

export const PUBLIC_PATH_PREFIXES = [] as const;

export const ADMIN_ONLY_PATH_PREFIXES = [
  '/api/mail',
  '/api/admin/catalog',
  '/api/admin/web-control',
] as const;

export const STRICT_AUTH_RATE_LIMIT_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/resend-otp',
] as const;
