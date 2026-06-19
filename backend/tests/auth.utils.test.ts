import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it, vi } from 'vitest';

const JWT_SECRET = '0123456789abcdef0123456789abcdef';

function restoreEnvValue(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

async function loadJwtUtils() {
  vi.resetModules();
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.JWT_EXPIRES_IN = '15m';
  return import('../services/auth/src/utils/jwt');
}

describe('auth token utilities', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalJwtExpiresIn = process.env.JWT_EXPIRES_IN;

  afterEach(() => {
    vi.resetModules();
    restoreEnvValue('JWT_SECRET', originalJwtSecret);
    restoreEnvValue('JWT_EXPIRES_IN', originalJwtExpiresIn);
  });

  it('generates six-digit OTP values', async () => {
    const { generateOtp } = await import('../services/auth/src/utils/otp');

    expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  it('generates and parses selector.secret refresh tokens', async () => {
    const { generateRefreshToken, parseRefreshToken } = await import('../services/auth/src/utils/otp');

    const token = generateRefreshToken();

    expect(token.selector).toMatch(/^[0-9a-f]{16}$/);
    expect(token.secret).toMatch(/^[0-9a-f]{64}$/);
    expect(token.raw).toBe(`${token.selector}.${token.secret}`);
    expect(parseRefreshToken(token.raw)).toEqual({
      selector: token.selector,
      secret: token.secret,
    });
  });

  it('rejects malformed refresh tokens without leaking structure', async () => {
    const { parseRefreshToken } = await import('../services/auth/src/utils/otp');

    expect(parseRefreshToken('')).toBeNull();
    expect(parseRefreshToken('not-a-token')).toBeNull();
    expect(parseRefreshToken(`${'a'.repeat(16)}.${'g'.repeat(64)}`)).toBeNull();
    expect(parseRefreshToken(`${'a'.repeat(15)}.${'b'.repeat(64)}`)).toBeNull();
  });

  it('signs HS256 access tokens that verify back to subject and role claims', async () => {
    const { signAccessToken, verifyAccessToken } = await loadJwtUtils();

    const token = signAccessToken('user-id', 'admin');
    const decoded = verifyAccessToken(token);
    const header = jwt.decode(token, { complete: true })?.header;

    expect(header?.alg).toBe('HS256');
    expect(decoded.sub).toBe('user-id');
    expect(decoded.role).toBe('admin');
    expect(decoded.jti).toEqual(expect.any(String));
  });

  it('rejects tokens signed with a different secret', async () => {
    const { verifyAccessToken } = await loadJwtUtils();
    const token = jwt.sign({ sub: 'user-id', role: 'user', jti: 'id' }, 'wrong-secret', {
      algorithm: 'HS256',
    });

    expect(() => verifyAccessToken(token)).toThrow();
  });
});
