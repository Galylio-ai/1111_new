import { describe, expect, it } from 'vitest';
import * as authValidators from '../services/auth/src/validators/auth.validators';
import * as userValidators from '../services/user/src/validators/user.validators';

describe('auth validators', () => {
  it('requires either email or phone at registration', () => {
    const result = authValidators.registerSchema.safeParse({
      full_name: 'Valid User',
      password: 'password123',
      state: 'Tunis',
    });

    expect(result.success).toBe(false);
  });

  it('accepts Tunisian phone login and rejects missing identity', () => {
    expect(
      authValidators.loginSchema.safeParse({
        phone: '+21671234567',
        password: 'password123',
      }).success,
    ).toBe(true);

    expect(
      authValidators.loginSchema.safeParse({
        password: 'password123',
      }).success,
    ).toBe(false);
  });

  it('accepts only six-digit OTP values', () => {
    expect(authValidators.verifyEmailSchema.safeParse({ otp: '123456' }).success).toBe(true);
    expect(authValidators.verifyEmailSchema.safeParse({ otp: '12345a' }).success).toBe(false);
  });
});

describe('user validators', () => {
  it('coerces valid pagination values and rejects excessive page size', () => {
    const result = userValidators.paginationSchema.safeParse({
      page: '2',
      limit: '50',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 2, limit: 50 });
    }
    expect(userValidators.paginationSchema.safeParse({ page: '1', limit: '500' }).success).toBe(
      false,
    );
  });

  it('rejects invalid user ids and roles', () => {
    expect(userValidators.uuidParamSchema.safeParse({ id: 'not-a-uuid' }).success).toBe(false);
    expect(userValidators.changeRoleSchema.safeParse({ role: 'owner' }).success).toBe(false);
  });
});

