import crypto from 'crypto';

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

// ---------------------------------------------------------------------------
// Refresh token format: "{selector}.{secret}"
//
//   selector  16 hex chars (8 random bytes)  — stored in plain text in the DB,
//                                              used as the indexed lookup key
//   secret    64 hex chars (32 random bytes) — bcrypt-hashed before storage;
//                                              never stored in the clear
//   raw       selector + '.' + secret        — the full opaque token returned
//                                              to the client (81 chars total)
//
// Splitting the token into a public selector and a private secret means the
// DB lookup is O(1) (WHERE selector = ?) instead of O(N × bcrypt_time), while
// the bcrypt-hashed secret still makes offline brute-force infeasible even if
// the tokens table is leaked.
// ---------------------------------------------------------------------------

export interface RefreshTokenParts {
  raw: string;
  selector: string;
  secret: string;
}

export function generateRefreshToken(): RefreshTokenParts {
  const selector = crypto.randomBytes(8).toString('hex');   // 16 hex chars
  const secret   = crypto.randomBytes(32).toString('hex');  // 64 hex chars
  return { raw: `${selector}.${secret}`, selector, secret };
}

// Validates structure and returns the two parts, or null if the token is
// malformed.  Callers must treat null as "token not found" to avoid leaking
// format information.
const HEX_RE = /^[0-9a-f]+$/;

export function parseRefreshToken(
  raw: string,
): { selector: string; secret: string } | null {
  // Expected: exactly 16 hex + '.' + 64 hex = 81 chars
  if (typeof raw !== 'string' || raw.length !== 81 || raw[16] !== '.') {
    return null;
  }
  const selector = raw.slice(0, 16);
  const secret   = raw.slice(17);
  if (!HEX_RE.test(selector) || !HEX_RE.test(secret)) {
    return null;
  }
  return { selector, secret };
}
