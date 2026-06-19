import { describe, expect, it, vi } from 'vitest';
import { renderTemplate } from '../services/mailer-api/src/utils/template';
import { createMailerManagementService } from '../services/mailer-api/src/services/mailer.service';
import * as validators from '../services/mailer-api/src/validators/mailer.validators';

describe('mailer-api validation and rendering', () => {
  it('validates template status values', () => {
    expect(
      validators.createTemplateSchema.safeParse({
        template_key: 'welcome',
        subject: 'Welcome',
        html_body: '<p>Hello {{ name }}</p>',
        status: 'deleted',
      }).success,
    ).toBe(false);
  });

  it('renders template variables without sending mail', () => {
    const rendered = renderTemplate('Hello {{ name }} - {{ code }}', {
      name: 'Haydar',
      code: '123456',
    });

    expect(rendered).toBe('Hello Haydar - 123456');
  });
});

describe('mailer management service', () => {
  function setup(overrides: Record<string, unknown> = {}) {
    const mailRepository = {
      createTemplate: vi.fn(async (input) => ({ id: 'tpl-id', ...(input as object) })),
      listTemplates: vi.fn(),
      getTemplateById: vi.fn(async () => ({
        id: 'tpl-id',
        template_key: 'welcome',
        subject: 'Welcome {{ name }}',
        html_body: '<p>Hello {{ name }}</p>',
        status: 'active',
      })),
      updateTemplate: vi.fn(async (_id, input) => ({ id: 'tpl-id', ...(input as object) })),
      archiveTemplate: vi.fn(async () => ({ id: 'tpl-id', status: 'archived' })),
      createLog: vi.fn(async (input) => ({ id: 'log-id', ...(input as object) })),
      listLogs: vi.fn(),
      getLogById: vi.fn(async () => ({
        id: 'log-id',
        template_key: 'welcome',
        to_email: 'test@example.com',
        subject: 'Welcome Haydar',
        status: 'failed',
      })),
      updateLog: vi.fn(async (_id, input) => ({ id: 'log-id', ...(input as object) })),
      ...overrides,
    };
    const publisher = vi.fn(async () => undefined);
    return {
      service: createMailerManagementService({
        mailRepository: mailRepository as never,
        publisher,
      }),
      mailRepository,
      publisher,
    };
  }

  it('previews active templates with variables without publishing mail', async () => {
    const { service, publisher } = setup();

    await expect(service.previewTemplate('tpl-id', { name: 'Haydar' })).resolves.toEqual({
      subject: 'Welcome Haydar',
      html_body: '<p>Hello Haydar</p>',
    });
    expect(publisher).not.toHaveBeenCalled();
  });

  it('test-send creates a queued log and publishes a notification mail', async () => {
    const { service, mailRepository, publisher } = setup();

    await service.testSendTemplate('tpl-id', {
      to_email: 'test@example.com',
      variables: { name: 'Haydar' },
    });

    expect(mailRepository.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        template_key: 'welcome',
        to_email: 'test@example.com',
        subject: 'Welcome Haydar',
        status: 'queued',
      }),
    );
    expect(publisher).toHaveBeenCalledWith('mail.notification', {
      to: 'test@example.com',
      name: 'Haydar',
      data: expect.objectContaining({
        subject: 'Welcome Haydar',
        html_body: '<p>Hello Haydar</p>',
        template_key: 'welcome',
        mail_log_id: 'log-id',
      }),
    });
  });

  it('refuses to retry non-failed logs', async () => {
    const { service } = setup({
      getLogById: vi.fn(async () => ({ id: 'log-id', status: 'sent' })),
    });

    await expect(service.retryLog('log-id')).rejects.toMatchObject({ statusCode: 400 });
  });
});
