import type { Knex } from 'knex';
import { db } from '../db';
import { AuditLogInput } from '../entities/user.entities';

type DbConnection = Knex | Knex.Transaction;

export async function createAuditLog(input: AuditLogInput, conn?: DbConnection): Promise<void> {
  await (conn ?? db)('auth.audit_logs').insert({
    actor_user_id: input.actor_user_id,
    actor_role: input.actor_role,
    action: input.action,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    metadata: input.metadata ?? {},
  });
}
