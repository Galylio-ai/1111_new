import { afterEach, describe, expect, it, vi } from 'vitest';

const JWT_SECRET = '0123456789abcdef0123456789abcdef';

function restoreEnvValue(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

function createAuthDbMock(user: Record<string, unknown>) {
  const insertedUsers: Record<string, unknown>[] = [];
  const usersBuilder = {
    where: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(undefined),
    insert: vi.fn((row: Record<string, unknown>) => {
      insertedUsers.push(row);
      return usersBuilder;
    }),
    returning: vi.fn(async () => [{ ...user, ...insertedUsers.at(-1) }]),
  };
  const otpBuilder = {
    insert: vi.fn(async () => undefined),
  };
  const refreshBuilder = {
    insert: vi.fn(async () => undefined),
  };
  const dbMock = vi.fn((table: string) => {
    if (table === 'auth.users') return usersBuilder;
    if (table === 'auth.otp_codes') return otpBuilder;
    if (table === 'auth.refresh_tokens') return refreshBuilder;
    throw new Error(`Unexpected table: ${table}`);
  });

  return { dbMock, insertedUsers };
}

async function loadAuthService(dbMock: ReturnType<typeof vi.fn>) {
  vi.resetModules();
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.GOOGLE_CLIENT_ID = 'google-client-id';

  vi.doMock('../services/auth/src/db', () => ({ db: dbMock }));
  vi.doMock('../services/auth/src/utils/rabbitmq', () => ({ publishMail: vi.fn() }));
  vi.doMock('../services/auth/src/utils/password', () => ({
    hashPassword: vi.fn(async () => 'password-hash'),
    comparePassword: vi.fn(async () => true),
    hashToken: vi.fn(async () => 'refresh-hash'),
    compareToken: vi.fn(async () => true),
  }));

  return import('../services/auth/src/services/auth.service');
}

describe('auth back-office redirect intent', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;

  afterEach(() => {
    vi.resetModules();
    restoreEnvValue('JWT_SECRET', originalJwtSecret);
    restoreEnvValue('GOOGLE_CLIENT_ID', originalGoogleClientId);
    vi.doUnmock('../services/auth/src/db');
    vi.doUnmock('../services/auth/src/utils/rabbitmq');
    vi.doUnmock('../services/auth/src/utils/password');
  });

  it('public register always creates role=user and returns front-office redirect intent', async () => {
    const { dbMock, insertedUsers } = createAuthDbMock({
      id: 'user-id',
      full_name: 'Public User',
      email: 'user@example.com',
      phone: null,
      role: 'user',
      is_active: true,
    });
    const service = await loadAuthService(dbMock);

    const result = await service.register({
      full_name: 'Public User',
      email: 'user@example.com',
      password: 'password123',
      state: 'Tunis',
    });

    expect(insertedUsers.at(-1)).toMatchObject({ role: 'user' });
    expect(result.user.role).toBe('user');
    expect(result.redirect_to).toBe('front-office');
  });

  it('login returns back-office redirect intent for staff roles', async () => {
    const user = {
      id: 'admin-id',
      full_name: 'Admin',
      email: 'admin@example.com',
      phone: null,
      password_hash: 'hash',
      role: 'admin',
      is_active: true,
    };
    const usersBuilder = {
      where: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(user),
    };
    const refreshBuilder = { insert: vi.fn(async () => undefined) };
    const dbMock = vi.fn((table: string) => {
      if (table === 'auth.users') return usersBuilder;
      if (table === 'auth.refresh_tokens') return refreshBuilder;
      throw new Error(`Unexpected table: ${table}`);
    });
    const service = await loadAuthService(dbMock);

    const result = await service.login({ email: 'admin@example.com', password: 'password123' });

    expect(result.user.role).toBe('admin');
    expect(result.redirect_to).toBe('back-office');
  });
});

describe('super-admin bootstrap', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('../services/auth/src/db');
    vi.doUnmock('../services/auth/src/utils/password');
  });

  it('creates the first verified active super admin and no-ops when one exists', async () => {
    const insertedUsers: Record<string, unknown>[] = [];
    const countBuilder = {
      where: vi.fn().mockReturnThis(),
      count: vi.fn().mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([{ count: '1' }]),
    };
    const insertBuilder = {
      insert: vi.fn((row: Record<string, unknown>) => {
        insertedUsers.push(row);
        return insertBuilder;
      }),
      returning: vi.fn(async () => [{ id: 'super-admin-id', ...insertedUsers.at(-1) }]),
    };
    const dbMock = vi.fn((table: string) => {
      if (table === 'auth.users') return insertedUsers.length === 0 ? countBuilder : countBuilder;
      throw new Error(`Unexpected table: ${table}`);
    });
    dbMock.mockImplementationOnce(() => countBuilder).mockImplementationOnce(() => insertBuilder);

    vi.doMock('../services/auth/src/db', () => ({ db: dbMock }));
    vi.doMock('../services/auth/src/utils/password', () => ({
      hashPassword: vi.fn(async () => 'password-hash'),
    }));

    const { seedSuperAdmin } = await import('../services/auth/src/scripts/seedSuperAdmin');

    await expect(
      seedSuperAdmin({
        email: 'root@example.com',
        password: 'password123',
        fullName: 'Root Admin',
        state: 'Tunis',
      }),
    ).resolves.toMatchObject({ created: true });

    expect(insertedUsers[0]).toMatchObject({
      email: 'root@example.com',
      role: 'super_admin',
      is_email_verified: true,
      is_active: true,
      password_hash: 'password-hash',
    });
  });
});
