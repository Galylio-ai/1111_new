import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it, vi } from 'vitest';

const JWT_SECRET = '0123456789abcdef0123456789abcdef';

function restoreEnvValue(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

async function loadGatewayAuth() {
  vi.resetModules();
  process.env.JWT_SECRET = JWT_SECRET;
  return import('../gateway/src/middleware/auth');
}

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

describe('gateway JWT middleware', () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  afterEach(() => {
    vi.resetModules();
    restoreEnvValue('JWT_SECRET', originalJwtSecret);
  });

  it('rejects protected requests without a bearer token', async () => {
    const { jwtMiddleware } = await loadGatewayAuth();
    const req = { path: '/api/users/me', headers: {} };
    const res = createResponse();
    const next = vi.fn();

    jwtMiddleware(req as never, res as never, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Missing or invalid authorization header',
    });
  });

  it('adds user identity headers for valid HS256 bearer tokens', async () => {
    const { jwtMiddleware } = await loadGatewayAuth();
    const token = jwt.sign({ sub: 'user-id', role: 'admin', jti: 'token-id' }, JWT_SECRET, {
      algorithm: 'HS256',
    });
    const req = {
      path: '/api/users/me',
      headers: { authorization: `Bearer ${token}` },
    };
    const res = createResponse();
    const next = vi.fn();

    jwtMiddleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.headers['x-user-id']).toBe('user-id');
    expect(req.headers['x-user-role']).toBe('admin');
    expect(res.status).not.toHaveBeenCalled();
  });
});
