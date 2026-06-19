import { AppError } from '../utils/errors';
import { MailTemplate } from '../entities/mailer.entities';
import { renderTemplate } from '../utils/template';

type MailRepository = typeof import('../repositories/mail.repository');
type Publisher = (
  routingKey: string,
  payload: { to: string; name: string; data: Record<string, unknown> },
) => Promise<void>;

const lazyRepository: MailRepository = {
  createTemplate: async (...args) => {
    const repository = await import('../repositories/mail.repository');
    return repository.createTemplate(...args);
  },
  listTemplates: async (...args) => {
    const repository = await import('../repositories/mail.repository');
    return repository.listTemplates(...args);
  },
  getTemplateById: async (...args) => {
    const repository = await import('../repositories/mail.repository');
    return repository.getTemplateById(...args);
  },
  updateTemplate: async (...args) => {
    const repository = await import('../repositories/mail.repository');
    return repository.updateTemplate(...args);
  },
  archiveTemplate: async (...args) => {
    const repository = await import('../repositories/mail.repository');
    return repository.archiveTemplate(...args);
  },
  createLog: async (...args) => {
    const repository = await import('../repositories/mail.repository');
    return repository.createLog(...args);
  },
  listLogs: async (...args) => {
    const repository = await import('../repositories/mail.repository');
    return repository.listLogs(...args);
  },
  getLogById: async (...args) => {
    const repository = await import('../repositories/mail.repository');
    return repository.getLogById(...args);
  },
  updateLog: async (...args) => {
    const repository = await import('../repositories/mail.repository');
    return repository.updateLog(...args);
  },
};

const lazyPublisher: Publisher = async (routingKey, payload) => {
  const { publishMail } = await import('../utils/rabbitmq');
  return publishMail(routingKey, payload);
};

function ensureActiveTemplate(template: MailTemplate | null): MailTemplate {
  if (!template || template.status !== 'active') throw new AppError(404, 'Active template not found');
  return template;
}

function rendered(template: MailTemplate, variables: Record<string, unknown>) {
  return {
    subject: renderTemplate(template.subject, variables),
    html_body: renderTemplate(template.html_body, variables),
  };
}

export function createMailerManagementService(
  deps: { mailRepository?: MailRepository; publisher?: Publisher } = {},
) {
  const mailRepository = deps.mailRepository ?? lazyRepository;
  const publisher = deps.publisher ?? lazyPublisher;

  async function getTemplateById(id: string) {
    const template = await mailRepository.getTemplateById(id);
    if (!template) throw new AppError(404, 'Template not found');
    return template;
  }

  async function updateTemplate(id: string, input: Partial<MailTemplate>) {
    const template = await mailRepository.updateTemplate(id, input);
    if (!template) throw new AppError(404, 'Template not found');
    return template;
  }

  async function archiveTemplate(id: string) {
    const template = await mailRepository.archiveTemplate(id);
    if (!template) throw new AppError(404, 'Template not found');
    return template;
  }

  async function previewTemplate(id: string, variables: Record<string, unknown>) {
    return rendered(ensureActiveTemplate(await mailRepository.getTemplateById(id)), variables);
  }

  async function testSendTemplate(
    id: string,
    input: { to_email: string; variables: Record<string, unknown> },
  ) {
    const template = ensureActiveTemplate(await mailRepository.getTemplateById(id));
    const output = rendered(template, input.variables);
    const log = await mailRepository.createLog({
      template_key: template.template_key,
      to_email: input.to_email,
      subject: output.subject,
      status: 'queued',
      error_message: null,
      sent_at: null,
    });
    await publisher('mail.notification', {
      to: input.to_email,
      name: String(input.variables.name ?? input.to_email),
      data: {
        ...input.variables,
        subject: output.subject,
        html_body: output.html_body,
        template_key: template.template_key,
        mail_log_id: log.id,
      },
    });
    return log;
  }

  async function retryLog(id: string) {
    const log = await mailRepository.getLogById(id);
    if (!log) throw new AppError(404, 'Mail log not found');
    if (log.status !== 'failed') throw new AppError(400, 'Only failed mail logs can be retried');
    const updated = await mailRepository.updateLog(id, {
      status: 'queued',
      error_message: null,
      sent_at: null,
    });
    await publisher('mail.notification', {
      to: log.to_email,
      name: log.to_email,
      data: {
        subject: log.subject,
        template_key: log.template_key,
        mail_log_id: log.id,
      },
    });
    return updated;
  }

  async function getLogById(id: string) {
    const log = await mailRepository.getLogById(id);
    if (!log) throw new AppError(404, 'Mail log not found');
    return log;
  }

  return {
    createTemplate: mailRepository.createTemplate,
    listTemplates: mailRepository.listTemplates,
    getTemplateById,
    updateTemplate,
    archiveTemplate,
    previewTemplate,
    testSendTemplate,
    listLogs: mailRepository.listLogs,
    getLogById,
    retryLog,
  };
}

const service = createMailerManagementService();

export const createTemplate = service.createTemplate;
export const listTemplates = service.listTemplates;
export const getTemplateById = service.getTemplateById;
export const updateTemplate = service.updateTemplate;
export const archiveTemplate = service.archiveTemplate;
export const previewTemplate = service.previewTemplate;
export const testSendTemplate = service.testSendTemplate;
export const listLogs = service.listLogs;
export const getLogById = service.getLogById;
export const retryLog = service.retryLog;
