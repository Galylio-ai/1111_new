import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';

const templateDir = path.join(process.cwd(), 'services', 'mailer', 'templates');

describe('mailer templates', () => {
  it('keeps every configured mailer subject backed by an HTML template', async () => {
    const consumer = await readFile(path.join(process.cwd(), 'services', 'mailer', 'consumer.py'), 'utf8');

    for (const templateName of ['welcome', 'email_verification', 'password_reset', 'notification']) {
      expect(consumer).toContain(`"${templateName}"`);
      const template = await readFile(path.join(templateDir, `${templateName}.html`), 'utf8');
      expect(template).toContain('{{ name }}');
      expect(template).toContain('<!DOCTYPE html>');
    }
  });

  it('keeps OTP placeholders in verification and password-reset templates', async () => {
    const verification = await readFile(path.join(templateDir, 'email_verification.html'), 'utf8');
    const passwordReset = await readFile(path.join(templateDir, 'password_reset.html'), 'utf8');

    expect(verification).toContain('{{ otp }}');
    expect(passwordReset).toContain('{{ otp }}');
  });

  it('keeps DB template preference, file fallback, and mail log hooks in the worker', async () => {
    const consumer = await readFile(path.join(process.cwd(), 'services', 'mailer', 'consumer.py'), 'utf8');
    const dbAdapter = await readFile(path.join(process.cwd(), 'services', 'mailer', 'db.py'), 'utf8');

    expect(consumer).toContain('get_active_template(template_key)');
    expect(consumer).toContain('render_template(template_name, payload)');
    expect(consumer).toContain('create_mail_log(');
    expect(consumer).toContain('update_mail_log(log_id, status="sent")');
    expect(consumer).toContain('update_mail_log(log_id, status="failed"');
    expect(dbAdapter).toContain('FROM mail_templates');
    expect(dbAdapter).toContain('INSERT INTO mail_logs');
    expect(dbAdapter).toContain('UPDATE mail_logs');
  });
});
