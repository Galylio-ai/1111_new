import * as userRepositoryDefault from '../repositories/user.repository';
import * as auditRepositoryDefault from '../repositories/audit.repository';
import { AppError } from '../middleware/errorHandler';
import { Actor, User, UserRole } from '../entities/user.entities';
import { hashPassword } from '../utils/password';

type UserRepository = typeof userRepositoryDefault;
type AuditRepository = typeof auditRepositoryDefault;

type StaffCreateInput = {
  full_name: string;
  email: string;
  phone?: string | null;
  password: string;
  state: string;
  role: Extract<UserRole, 'admin' | 'super_admin'>;
};

type UserUpdateInput = {
  full_name?: string;
  phone?: string | null;
  state?: string;
};

type ListInput = {
  role?: UserRole;
  is_active?: boolean;
  is_email_verified?: boolean;
  page?: number;
  limit?: number;
};

function isStaff(role: string): boolean {
  return role === 'admin' || role === 'super_admin';
}

function canManage(actor: Actor, target: User): boolean {
  if (actor.role === 'super_admin') return true;
  return actor.role === 'admin' && target.role === 'user';
}

function assertSuperAdmin(actor: Actor): void {
  if (actor.role !== 'super_admin') throw new AppError(403, 'Forbidden');
}

function assertCanManage(actor: Actor, target: User): void {
  if (!canManage(actor, target)) throw new AppError(403, 'Forbidden');
}

function auditBase(actor: Actor, action: string, targetId: string, metadata?: Record<string, unknown>) {
  return {
    actor_user_id: actor.id,
    actor_role: actor.role,
    action,
    entity_type: 'user',
    entity_id: targetId,
    metadata,
  };
}

export function createAdminUserService(
  deps: {
    userRepository?: UserRepository;
    auditRepository?: AuditRepository;
    passwordHasher?: (plain: string) => Promise<string>;
  } = {},
) {
  const userRepository = deps.userRepository ?? userRepositoryDefault;
  const auditRepository = deps.auditRepository ?? auditRepositoryDefault;
  const passwordHasher = deps.passwordHasher ?? hashPassword;

  async function getRequiredUser(id: string, conn?: unknown): Promise<User> {
    const user = await userRepository.findById(id, conn as never);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async function assertNotLastActiveSuperAdmin(target: User, conn?: unknown): Promise<void> {
    if (target.role !== 'super_admin' || !target.is_active) return;
    const count = await userRepository.countActiveSuperAdmins(conn as never);
    if (count <= 1) throw new AppError(400, 'Cannot modify the last active super admin');
  }

  async function createStaffUser(actor: Actor, input: StaffCreateInput): Promise<User> {
    assertSuperAdmin(actor);
    if (!isStaff(input.role)) throw new AppError(400, 'Staff role must be admin or super_admin');

    return userRepository.transaction(async (trx) => {
      const conflict = await userRepository.findByEmailOrPhone(
        { email: input.email, phone: input.phone },
        undefined,
        trx,
      );
      if (conflict) throw new AppError(409, 'Email or phone already in use');

      const passwordHash = await passwordHasher(input.password);
      const user = await userRepository.createUser(
        {
          full_name: input.full_name,
          email: input.email,
          phone: input.phone ?? null,
          password_hash: passwordHash,
          role: input.role,
          state: input.state,
          is_email_verified: true,
          is_active: true,
        },
        trx,
      );
      await auditRepository.createAuditLog(
        auditBase(actor, input.role === 'super_admin' ? 'super_admin.created' : 'admin.created', user.id, {
          role: input.role,
        }),
        trx,
      );
      return user;
    });
  }

  async function listUsers(actor: Actor, input: ListInput) {
    const filters = actor.role === 'admin' ? { ...input, role: 'user' as const } : input;
    return userRepository.listUsers(filters);
  }

  async function getUserById(actor: Actor, id: string): Promise<User> {
    const target = await getRequiredUser(id);
    assertCanManage(actor, target);
    return target;
  }

  async function updateUser(actor: Actor, id: string, input: UserUpdateInput): Promise<User> {
    return userRepository.transaction(async (trx) => {
      const target = await getRequiredUser(id, trx);
      assertCanManage(actor, target);
      if (input.phone) {
        const conflict = await userRepository.findByEmailOrPhone({ phone: input.phone }, id, trx);
        if (conflict) throw new AppError(409, 'Phone already in use');
      }
      const updated = await userRepository.updateUser(id, input, trx);
      if (!updated) throw new AppError(404, 'User not found');
      await auditRepository.createAuditLog(auditBase(actor, 'user.updated', id, input), trx);
      return updated;
    });
  }

  async function changeRole(actor: Actor, id: string, role: UserRole): Promise<User> {
    assertSuperAdmin(actor);
    return userRepository.transaction(async (trx) => {
      const target = await getRequiredUser(id, trx);
      if (target.role === 'super_admin' && role !== 'super_admin') {
        await assertNotLastActiveSuperAdmin(target, trx);
      }
      const updated = await userRepository.updateUser(id, { role }, trx);
      if (!updated) throw new AppError(404, 'User not found');
      await auditRepository.createAuditLog(
        auditBase(actor, 'user.role_changed', id, { from: target.role, to: role }),
        trx,
      );
      return updated;
    });
  }

  async function deactivateUser(actor: Actor, id: string): Promise<User> {
    return userRepository.transaction(async (trx) => {
      const target = await getRequiredUser(id, trx);
      assertCanManage(actor, target);
      await assertNotLastActiveSuperAdmin(target, trx);
      const updated = await userRepository.updateUser(id, { is_active: false }, trx);
      if (!updated) throw new AppError(404, 'User not found');
      await auditRepository.createAuditLog(auditBase(actor, 'user.deactivated', id), trx);
      return updated;
    });
  }

  async function reactivateUser(actor: Actor, id: string): Promise<User> {
    assertSuperAdmin(actor);
    return userRepository.transaction(async (trx) => {
      await getRequiredUser(id, trx);
      const updated = await userRepository.updateUser(id, { is_active: true }, trx);
      if (!updated) throw new AppError(404, 'User not found');
      await auditRepository.createAuditLog(auditBase(actor, 'user.reactivated', id), trx);
      return updated;
    });
  }

  async function setEmailVerification(actor: Actor, id: string, isEmailVerified: boolean): Promise<User> {
    return userRepository.transaction(async (trx) => {
      const target = await getRequiredUser(id, trx);
      assertCanManage(actor, target);
      const updated = await userRepository.updateUser(
        id,
        { is_email_verified: isEmailVerified },
        trx,
      );
      if (!updated) throw new AppError(404, 'User not found');
      await auditRepository.createAuditLog(
        auditBase(actor, 'user.email_verification_changed', id, {
          is_email_verified: isEmailVerified,
        }),
        trx,
      );
      return updated;
    });
  }

  async function resetPassword(actor: Actor, id: string, password: string): Promise<void> {
    await userRepository.transaction(async (trx) => {
      const target = await getRequiredUser(id, trx);
      assertCanManage(actor, target);
      const passwordHash = await passwordHasher(password);
      await userRepository.updateUser(id, { password_hash: passwordHash }, trx);
      await userRepository.revokeRefreshTokens(id, trx);
      await auditRepository.createAuditLog(auditBase(actor, 'user.password_reset_by_admin', id), trx);
    });
  }

  async function revokeSessions(actor: Actor, id: string): Promise<void> {
    await userRepository.transaction(async (trx) => {
      const target = await getRequiredUser(id, trx);
      assertCanManage(actor, target);
      await userRepository.revokeRefreshTokens(id, trx);
      await auditRepository.createAuditLog(auditBase(actor, 'user.sessions_revoked', id), trx);
    });
  }

  return {
    createStaffUser,
    listUsers,
    getUserById,
    updateUser,
    changeRole,
    deactivateUser,
    reactivateUser,
    setEmailVerification,
    resetPassword,
    revokeSessions,
  };
}

const service = createAdminUserService();

export const createStaffUser = service.createStaffUser;
export const listUsers = service.listUsers;
export const getUserById = service.getUserById;
export const updateUser = service.updateUser;
export const changeRole = service.changeRole;
export const deactivateUser = service.deactivateUser;
export const reactivateUser = service.reactivateUser;
export const setEmailVerification = service.setEmailVerification;
export const resetPassword = service.resetPassword;
export const revokeSessions = service.revokeSessions;
