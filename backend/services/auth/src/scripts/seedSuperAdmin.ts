import 'dotenv/config';
import { db } from '../db';
import { hashPassword } from '../utils/password';

type SeedInput = {
  email: string;
  password: string;
  fullName: string;
  state?: string;
  phone?: string;
};

type SeedResult = { created: boolean; message: string; user_id?: string };

function readInputFromEnv(): SeedInput {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const fullName = process.env.SUPER_ADMIN_NAME;

  if (!email || !password || !fullName) {
    throw new Error('SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, and SUPER_ADMIN_NAME are required');
  }

  return {
    email,
    password,
    fullName,
    state: process.env.SUPER_ADMIN_STATE,
    phone: process.env.SUPER_ADMIN_PHONE,
  };
}

function validateInput(input: SeedInput): void {
  if (!input.email.includes('@')) throw new Error('SUPER_ADMIN_EMAIL must be a valid email');
  if (input.password.length < 8 || input.password.length > 128) {
    throw new Error('SUPER_ADMIN_PASSWORD must be between 8 and 128 characters');
  }
  if (input.fullName.trim().length < 2) {
    throw new Error('SUPER_ADMIN_NAME must be at least 2 characters');
  }
}

export async function seedSuperAdmin(input = readInputFromEnv()): Promise<SeedResult> {
  validateInput(input);

  const [{ count }] = await db('auth.users')
    .where({ role: 'super_admin' })
    .count<{ count: string }[]>('id as count');

  if (Number(count) > 0) {
    return { created: false, message: 'A super_admin already exists; no changes made.' };
  }

  const passwordHash = await hashPassword(input.password);
  const [user] = await db('auth.users')
    .insert({
      full_name: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      password_hash: passwordHash,
      role: 'super_admin',
      state: input.state ?? null,
      is_email_verified: true,
      is_active: true,
    })
    .returning(['id']);

  return {
    created: true,
    message: 'Super admin created.',
    user_id: String(user.id),
  };
}

if (require.main === module) {
  seedSuperAdmin()
    .then((result) => {
      console.log(result.message);
      process.exit(0);
    })
    .catch((err) => {
      console.error((err as Error).message);
      process.exit(1);
    });
}
