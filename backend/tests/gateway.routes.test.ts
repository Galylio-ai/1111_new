import { describe, expect, it } from 'vitest';
import {
  PUBLIC_AUTH_PATHS,
  STRICT_AUTH_RATE_LIMIT_PATHS,
} from '../gateway/src/config/routes';

describe('gateway auth route policy', () => {
  it('allows unauthenticated forgot-password and reset-password requests', () => {
    expect(PUBLIC_AUTH_PATHS).toContain('/api/auth/forgot-password');
    expect(PUBLIC_AUTH_PATHS).toContain('/api/auth/reset-password');
  });

  it('strictly rate limits resend-otp', () => {
    expect(STRICT_AUTH_RATE_LIMIT_PATHS).toContain('/api/auth/resend-otp');
  });
});
