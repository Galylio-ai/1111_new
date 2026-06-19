import crypto from 'crypto';
import type { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db';
import { config } from '../config';
import { hashPassword, comparePassword, hashToken, compareToken } from '../utils/password';
import { signAccessToken } from '../utils/jwt';
import { generateOtp, generateRefreshToken, parseRefreshToken } from '../utils/otp';
import { publishMail } from '../utils/rabbitmq';
import { AppError } from '../middleware/errorHandler';

const googleClient = new OAuth2Client(config.google.clientId);
export const RESET_PASSWORD_FAILED_MESSAGE = 'Invalid or expired reset code';

// ---------------------------------------------------------------------------
// Constant-time OTP comparison.
//
// JavaScript's !== short-circuits on the first differing byte, leaking how
// many leading characters matched via response-time variance.  Node's
// crypto.timingSafeEqual() always iterates the full buffer regardless of
// content, eliminating that channel.
//
// Both strings are right-padded with NUL bytes to the same length before
// comparison.  Padding with '\0' is safe here because generateOtp() only
// produces ASCII digits ('0'–'9'), so a padded buffer can never equal an
// unpadded one of different length.
// ---------------------------------------------------------------------------
function otpEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  const ba = Buffer.from(a.padEnd(len, '\0'));
  const bb = Buffer.from(b.padEnd(len, '\0'));
  return crypto.timingSafeEqual(ba, bb);
}

interface User {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  google_id: string | null;
  avatar_url: string | null;
  role: string;
  state: string;
  is_email_verified: boolean;
  is_active: boolean;
}

type RedirectIntent = 'front-office' | 'back-office';
type AuthResult = {
  user: Omit<User, 'password_hash'>;
  access_token: string;
  refresh_token: string;
  redirect_to: RedirectIntent;
};

export function redirectForRole(role: string): RedirectIntent {
  return role === 'admin' || role === 'super_admin' ? 'back-office' : 'front-office';
}

// ---------------------------------------------------------------------------
// issueTokenPair
//
// Accepts an optional Knex query-builder / transaction (q).  When refreshTokens
// calls this inside its db.transaction() block it passes the transaction so
// that the new token row is inserted atomically with the revocation of the old
// one.  All other callers (register, login, googleAuth) omit q and get the
// module-level db instance.
//
// Storage layout change (migration 002):
//   selector   — 16-char hex prefix, stored in plain text for O(1) lookup
//   token_hash — bcrypt hash of the 64-char hex secret portion only
// The full raw token ("selector.secret") is returned to the client but never
// persisted anywhere in the clear.
// ---------------------------------------------------------------------------
async function issueTokenPair(
  user: User,
  q: Knex | Knex.Transaction = db,
): Promise<{ access_token: string; refresh_token: string }> {
  const { raw, selector, secret } = generateRefreshToken();
  const tokenHash = await hashToken(secret);   // bcrypt only the secret portion
  const expiresAt = new Date(Date.now() + config.refreshToken.expiresDays * 86400 * 1000);

  await q('auth.refresh_tokens').insert({
    id: uuidv4(),
    user_id: user.id,
    selector,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  return {
    access_token: signAccessToken(user.id, user.role),
    refresh_token: raw,
  };
}

export async function register(body: {
  full_name: string;
  email?: string;
  phone?: string;
  password: string;
  state: string;
}): Promise<AuthResult> {
  if (body.email) {
    const exists = await db('auth.users').where({ email: body.email }).first();
    if (exists) throw new AppError(409, 'Email already in use');
  }
  if (body.phone) {
    const exists = await db('auth.users').where({ phone: body.phone }).first();
    if (exists) throw new AppError(409, 'Phone already in use');
  }

  const password_hash = await hashPassword(body.password);
  const id = uuidv4();

  const [user] = await db('auth.users')
    .insert({
      id,
      full_name: body.full_name,
      email: body.email ?? null,
      phone: body.phone ?? null,
      password_hash,
      role: 'user',
      state: body.state,
    })
    .returning('*');

  if (body.email) {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + config.otpTtlMs);
    await db('auth.otp_codes').insert({
      id: uuidv4(),
      user_id: id,
      code: otp,
      type: 'email_verification',
      expires_at: expiresAt,
    });

    void publishMail('mail.welcome', {
      to: body.email,
      name: body.full_name,
      data: {},
    });
    void publishMail('mail.verification', {
      to: body.email,
      name: body.full_name,
      data: { otp },
    });
  }

  const tokens = await issueTokenPair(user as User);
  const { password_hash: _ph, ...safeUser } = user as User;
  return { user: safeUser, ...tokens, redirect_to: redirectForRole(safeUser.role) };
}

export async function login(body: {
  email?: string;
  phone?: string;
  password: string;
}): Promise<AuthResult> {
  const user = (await db('auth.users')
    .where(body.email ? { email: body.email } : { phone: body.phone })
    .first()) as User | undefined;

  if (!user || !user.password_hash) throw new AppError(401, 'Invalid credentials');
  if (!user.is_active) throw new AppError(403, 'Account disabled');

  const valid = await comparePassword(body.password, user.password_hash);
  if (!valid) throw new AppError(401, 'Invalid credentials');

  const tokens = await issueTokenPair(user);
  const { password_hash: _ph, ...safeUser } = user;
  return { user: safeUser, ...tokens, redirect_to: redirectForRole(safeUser.role) };
}

export async function googleAuth(body: {
  id_token: string;
  state?: string;
}): Promise<AuthResult> {
  if (!config.google.clientId) {
    throw new AppError(503, 'Google OAuth is not configured');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: body.id_token,
      audience: config.google.clientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError(400, 'Invalid Google token');
  }

  if (!payload?.sub) throw new AppError(400, 'Invalid Google token');
  if (payload.email && !payload.email_verified) {
    throw new AppError(403, 'Google email must be verified');
  }

  let user = (await db('auth.users').where({ google_id: payload.sub }).first()) as User | undefined;

  if (!user && payload.email) {
    user = (await db('auth.users').where({ email: payload.email }).first()) as User | undefined;
    if (user) {
      await db('auth.users').where({ id: user.id }).update({ google_id: payload.sub });
      user.google_id = payload.sub;
    }
  }

  if (!user) {
    const id = uuidv4();
    [user] = await db('auth.users')
      .insert({
        id,
        full_name: payload.name ?? '',
        email: payload.email ?? null,
        google_id: payload.sub,
        avatar_url: payload.picture ?? null,
        role: 'user',
        state: body.state ?? null,
        is_email_verified: !!payload.email_verified,
      })
      .returning('*');
  }

  if (!user) throw new AppError(500, 'Google auth failed');
  if (!user.is_active) throw new AppError(403, 'Account disabled');

  const tokens = await issueTokenPair(user as User);
  const { password_hash: _ph, ...safeUser } = user as User;
  return { user: safeUser, ...tokens, redirect_to: redirectForRole(safeUser.role) };
}

// ---------------------------------------------------------------------------
// refreshTokens
//
// Previous implementation: SELECT all non-revoked tokens → iterate with
// bcrypt.compare() until a match → O(N × ~100 ms bcrypt).  With 1 000 active
// sessions per user this takes ~100 s, making it trivially exploitable as DoS.
//
// New implementation:
//   1. Parse the raw token into { selector, secret }.
//   2. SELECT the single row WHERE selector = ? — O(1) via idx_rt_selector.
//   3. bcrypt.compare(secret, row.token_hash) — exactly one hash operation.
//   4. Everything from "token found" to "new token inserted" runs inside a
//      single serializable db.transaction() with forUpdate() on the matched
//      row.  A concurrent request carrying the same token blocks on the lock,
//      then finds revoked = true and returns 401 — closing the TOCTOU window.
// ---------------------------------------------------------------------------
export async function refreshTokens(
  rawToken: string,
): Promise<{ access_token: string; refresh_token: string }> {
  const parsed = parseRefreshToken(rawToken);
  if (!parsed) throw new AppError(401, 'Invalid or expired refresh token');

  return db.transaction(async (trx) => {
    // O(1) lookup; forUpdate() acquires a row-level lock so a concurrent
    // request with the same token blocks here until this transaction commits.
    const record = (await trx('auth.refresh_tokens')
      .where({ selector: parsed.selector, revoked: false })
      .where('expires_at', '>', new Date())
      .forUpdate()
      .first()) as { id: string; user_id: string; token_hash: string } | undefined;

    if (!record) throw new AppError(401, 'Invalid or expired refresh token');

    // Verify only the secret portion against the stored bcrypt hash
    const valid = await compareToken(parsed.secret, record.token_hash);
    if (!valid) throw new AppError(401, 'Invalid or expired refresh token');

    const user = (await trx('auth.users')
      .where({ id: record.user_id })
      .first()) as User | undefined;
    if (!user || !user.is_active) throw new AppError(401, 'User not found or disabled');

    // Revoke the old token and insert the new one in the same transaction.
    // If issueTokenPair throws, the revocation is rolled back — no lost session.
    await trx('auth.refresh_tokens').where({ id: record.id }).update({ revoked: true });
    return issueTokenPair(user, trx);
  });
}

// ---------------------------------------------------------------------------
// logout
//
// Same O(1) selector lookup as refreshTokens.  Silent on malformed tokens and
// on tokens that are already revoked or not found — no information is leaked
// about whether a given selector exists in the database.
// ---------------------------------------------------------------------------
export async function logout(rawToken: string): Promise<void> {
  const parsed = parseRefreshToken(rawToken);
  if (!parsed) return; // malformed — silent, avoids format enumeration

  const record = (await db('auth.refresh_tokens')
    .where({ selector: parsed.selector, revoked: false })
    .first()) as { id: string; token_hash: string } | undefined;

  if (!record) return; // already revoked or not found — silent

  // Verify the secret before revoking so an attacker who guesses a valid
  // selector (16 hex chars, birthday ~2^64) cannot force-revoke another
  // user's session.
  const valid = await compareToken(parsed.secret, record.token_hash);
  if (valid) {
    await db('auth.refresh_tokens').where({ id: record.id }).update({ revoked: true });
  }
}

export async function verifyEmail(userId: string, otp: string): Promise<void> {
  const record = await db('auth.otp_codes')
    .where({ user_id: userId, type: 'email_verification', used: false })
    .where('expires_at', '>', new Date())
    .orderBy('created_at', 'desc')
    .first();

  if (!record) throw new AppError(400, 'OTP not found or expired');
  if (record.attempts >= config.otpMaxAttempts) throw new AppError(400, 'OTP invalidated — request a new one');

  if (!otpEqual(record.code, otp)) {
    await db('auth.otp_codes').where({ id: record.id }).increment('attempts', 1);
    throw new AppError(400, 'Invalid OTP');
  }

  await db('auth.otp_codes').where({ id: record.id }).update({ used: true });
  await db('auth.users').where({ id: userId }).update({ is_email_verified: true });
}

export async function resendOtp(userId: string): Promise<void> {
  const user = (await db('auth.users').where({ id: userId }).first()) as User | undefined;
  // Silent on all non-send conditions — no enumeration of users or verification state
  if (!user || user.is_email_verified || !user.email) return;

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + config.otpTtlMs);

  await db('auth.otp_codes').insert({
    id: uuidv4(),
    user_id: user.id,
    code: otp,
    type: 'email_verification',
    expires_at: expiresAt,
  });

  void publishMail('mail.verification', {
    to: user.email,
    name: user.full_name,
    data: { otp },
  });
}

export async function forgotPassword(email: string): Promise<void> {
  const user = (await db('auth.users').where({ email }).first()) as User | undefined;
  // Silent fail — don't reveal whether the email exists
  if (!user) return;

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + config.otpTtlMs);

  await db('auth.otp_codes').insert({
    id: uuidv4(),
    user_id: user.id,
    code: otp,
    type: 'password_reset',
    expires_at: expiresAt,
  });

  void publishMail('mail.password_reset', {
    to: email,
    name: user.full_name,
    data: { otp },
  });
}

export async function resetPassword(body: {
  email: string;
  otp: string;
  new_password: string;
}): Promise<void> {
  const user = (await db('auth.users').where({ email: body.email }).first()) as User | undefined;
  if (!user) throw new AppError(400, RESET_PASSWORD_FAILED_MESSAGE);

  const record = await db('auth.otp_codes')
    .where({ user_id: user.id, type: 'password_reset', used: false })
    .where('expires_at', '>', new Date())
    .orderBy('created_at', 'desc')
    .first();

  if (!record) throw new AppError(400, RESET_PASSWORD_FAILED_MESSAGE);
  if (record.attempts >= config.otpMaxAttempts) throw new AppError(400, RESET_PASSWORD_FAILED_MESSAGE);

  if (!otpEqual(record.code, body.otp)) {
    await db('auth.otp_codes').where({ id: record.id }).increment('attempts', 1);
    throw new AppError(400, RESET_PASSWORD_FAILED_MESSAGE);
  }

  const password_hash = await hashPassword(body.new_password);
  await db('auth.otp_codes').where({ id: record.id }).update({ used: true });
  await db('auth.users').where({ id: user.id }).update({ password_hash, updated_at: new Date() });
  await db('auth.refresh_tokens').where({ user_id: user.id }).update({ revoked: true });
}
