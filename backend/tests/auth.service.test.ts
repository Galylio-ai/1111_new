import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const JWT_SECRET = '0123456789abcdef0123456789abcdef';

function restoreEnvValue(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

function buildResetPasswordDb(user: unknown, otpRecord: unknown) {
  const usersBuilder = {
    where: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(user),
  };
  const otpSelectBuilder = {
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(otpRecord),
  };
  const otpIncrementBuilder = {
    where: vi.fn().mockReturnThis(),
    increment: vi.fn().mockResolvedValue(1),
  };
  let otpCalls = 0;

  return vi.fn((table: string) => {
    if (table === 'auth.users') return usersBuilder;
    if (table === 'auth.otp_codes') return otpCalls++ === 0 ? otpSelectBuilder : otpIncrementBuilder;
    throw new Error(`Unexpected table: ${table}`);
  });
}

async function loadAuthService(options: {
  dbMock?: ReturnType<typeof vi.fn>;
  googleClientId?: string;
  googlePayload?: Record<string, unknown>;
} = {}) {
  vi.resetModules();
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.GOOGLE_CLIENT_ID = options.googleClientId ?? '';

  vi.doMock('../services/auth/src/db', () => ({
    db: options.dbMock ?? vi.fn(),
  }));
  vi.doMock('../services/auth/src/utils/rabbitmq', () => ({
    publishMail: vi.fn(),
  }));
  vi.doMock('google-auth-library', () => ({
    OAuth2Client: vi.fn().mockImplementation(function OAuth2Client() {
      return {
      verifyIdToken: vi.fn().mockResolvedValue({
        getPayload: () => options.googlePayload,
      }),
      };
    }),
  }));

  return import('../services/auth/src/services/auth.service');
}

describe('auth service security behavior', () => {
  const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
    restoreEnvValue('GOOGLE_CLIENT_ID', originalGoogleClientId);
    restoreEnvValue('JWT_SECRET', originalJwtSecret);
    vi.doUnmock('../services/auth/src/db');
    vi.doUnmock('../services/auth/src/utils/rabbitmq');
    vi.doUnmock('google-auth-library');
  });

  it('returns a controlled error when Google OAuth is not configured', async () => {
    const service = await loadAuthService();

    await expect(service.googleAuth({ id_token: 'token' })).rejects.toMatchObject({
      statusCode: 503,
      message: 'Google OAuth is not configured',
    });
  });

  it('rejects Google payloads with unverified email before account linking', async () => {
    const dbMock = vi.fn();
    const service = await loadAuthService({
      dbMock,
      googleClientId: 'client-id',
      googlePayload: {
        sub: 'google-user-id',
        email: 'user@example.com',
        email_verified: false,
      },
    });

    await expect(service.googleAuth({ id_token: 'token' })).rejects.toMatchObject({
      statusCode: 403,
      message: 'Google email must be verified',
    });
    expect(dbMock).not.toHaveBeenCalled();
  });

  it('uses the same reset-password message for unknown email', async () => {
    const service = await loadAuthService({
      dbMock: buildResetPasswordDb(undefined, undefined),
    });

    await expect(
      service.resetPassword({
        email: 'missing@example.com',
        otp: '123456',
        new_password: 'password123',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: service.RESET_PASSWORD_FAILED_MESSAGE,
    });
  });

  it('uses the same reset-password message for missing OTP records', async () => {
    const service = await loadAuthService({
      dbMock: buildResetPasswordDb({ id: 'user-id' }, undefined),
    });

    await expect(
      service.resetPassword({
        email: 'user@example.com',
        otp: '123456',
        new_password: 'password123',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: service.RESET_PASSWORD_FAILED_MESSAGE,
    });
  });

  it('uses the same reset-password message for invalid OTP values', async () => {
    const service = await loadAuthService({
      dbMock: buildResetPasswordDb({ id: 'user-id' }, { id: 'otp-id', code: '000000', attempts: 0 }),
    });

    await expect(
      service.resetPassword({
        email: 'user@example.com',
        otp: '123456',
        new_password: 'password123',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: service.RESET_PASSWORD_FAILED_MESSAGE,
    });
  });
});
