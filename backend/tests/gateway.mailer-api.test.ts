import { describe, expect, it } from 'vitest';
import { ADMIN_ONLY_PATH_PREFIXES } from '../gateway/src/config/routes';

describe('gateway mailer-api policy', () => {
  it('marks mail management routes as admin-only', () => {
    expect(ADMIN_ONLY_PATH_PREFIXES).toContain('/api/mail');
  });
});
