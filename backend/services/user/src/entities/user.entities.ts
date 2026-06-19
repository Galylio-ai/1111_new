export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  google_id: string | null;
  avatar_url: string | null;
  role: UserRole;
  state: string | null;
  is_email_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Actor {
  id: string;
  role: UserRole;
}

export interface AuditLogInput {
  actor_user_id: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata?: Record<string, unknown>;
}
