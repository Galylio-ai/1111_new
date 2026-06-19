import { describe, expect, it, vi } from 'vitest';
import { createAdminUserService } from '../services/user/src/services/adminUser.service';
import * as validators from '../services/user/src/validators/user.validators';

const actorAdmin = { id: 'admin-id', role: 'admin' };
const actorSuperAdmin = { id: 'super-id', role: 'super_admin' };

function createService(overrides: Record<string, unknown> = {}) {
  const userRepository = {
    createUser: vi.fn(async (input) => ({ id: 'new-id', ...(input as object) })),
    findById: vi.fn(async () => ({
      id: 'target-id',
      role: 'user',
      is_active: true,
      is_email_verified: false,
    })),
    findByEmailOrPhone: vi.fn(async () => undefined),
    updateUser: vi.fn(async (_id, patch) => ({ id: 'target-id', ...(patch as object) })),
    countActiveSuperAdmins: vi.fn(async () => 2),
    revokeRefreshTokens: vi.fn(async () => undefined),
    transaction: vi.fn(async (callback) => callback({ trx: true })),
    ...overrides,
  };
  const auditRepository = {
    createAuditLog: vi.fn(async () => undefined),
  };
  const passwordHasher = vi.fn(async () => 'password-hash');

  return {
    service: createAdminUserService({
      userRepository: userRepository as never,
      auditRepository: auditRepository as never,
      passwordHasher,
    }),
    userRepository,
    auditRepository,
    passwordHasher,
  };
}

describe('admin user validation', () => {
  it('only accepts admin or super_admin roles for staff creation', () => {
    expect(
      validators.createAdminUserSchema.safeParse({
        full_name: 'Normal User',
        email: 'user@example.com',
        password: 'password123',
        state: 'Tunis',
        role: 'user',
      }).success,
    ).toBe(false);

    expect(
      validators.createAdminUserSchema.safeParse({
        full_name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        state: 'Tunis',
        role: 'admin',
      }).success,
    ).toBe(true);
  });
});

describe('admin user management service', () => {
  it('allows only super_admin to create staff accounts and writes audit logs', async () => {
    const { service, userRepository, auditRepository, passwordHasher } = createService();

    await expect(
      service.createStaffUser(actorAdmin, {
        full_name: 'Other Admin',
        email: 'other@example.com',
        password: 'password123',
        state: 'Tunis',
        role: 'admin',
      }),
    ).rejects.toMatchObject({ statusCode: 403 });

    await expect(
      service.createStaffUser(actorSuperAdmin, {
        full_name: 'Other Admin',
        email: 'other@example.com',
        password: 'password123',
        state: 'Tunis',
        role: 'admin',
      }),
    ).resolves.toMatchObject({ role: 'admin' });

    expect(passwordHasher).toHaveBeenCalledWith('password123');
    expect(userRepository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'admin',
        password_hash: 'password-hash',
        is_email_verified: true,
        is_active: true,
      }),
      expect.anything(),
    );
    expect(auditRepository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'admin.created', actor_user_id: 'super-id' }),
      expect.anything(),
    );
  });

  it('blocks admins from managing staff accounts', async () => {
    const { service } = createService({
      findById: vi.fn(async () => ({ id: 'target-id', role: 'admin', is_active: true })),
    });

    await expect(
      service.updateUser(actorAdmin, 'target-id', { full_name: 'Edited Name' }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('refuses to demote or deactivate the last active super_admin', async () => {
    const { service } = createService({
      findById: vi.fn(async () => ({ id: 'super-id', role: 'super_admin', is_active: true })),
      countActiveSuperAdmins: vi.fn(async () => 1),
    });

    await expect(
      service.changeRole(actorSuperAdmin, 'super-id', 'admin'),
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.deactivateUser(actorSuperAdmin, 'super-id')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('resets passwords and revokes refresh tokens in one transaction', async () => {
    const { service, userRepository, auditRepository } = createService();

    await service.resetPassword(actorSuperAdmin, 'target-id', 'new-password123');

    expect(userRepository.updateUser).toHaveBeenCalledWith(
      'target-id',
      { password_hash: 'password-hash' },
      expect.anything(),
    );
    expect(userRepository.revokeRefreshTokens).toHaveBeenCalledWith('target-id', expect.anything());
    expect(auditRepository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'user.password_reset_by_admin' }),
      expect.anything(),
    );
  });

  it('revokes sessions and writes audit logs', async () => {
    const { service, userRepository, auditRepository } = createService();

    await service.revokeSessions(actorSuperAdmin, 'target-id');

    expect(userRepository.revokeRefreshTokens).toHaveBeenCalledWith('target-id', expect.anything());
    expect(auditRepository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'user.sessions_revoked' }),
      expect.anything(),
    );
  });
});
