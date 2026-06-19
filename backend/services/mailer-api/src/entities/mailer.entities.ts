export type TemplateStatus = 'active' | 'archived' | 'hidden';
export type MailLogStatus = 'queued' | 'sent' | 'failed';

export interface MailTemplate {
  id: string;
  template_key: string;
  subject: string;
  html_body: string;
  status: TemplateStatus;
  created_at?: Date;
  updated_at?: Date;
}

export interface MailLog {
  id: string;
  template_key: string | null;
  to_email: string;
  subject: string;
  status: MailLogStatus;
  error_message: string | null;
  sent_at: Date | null;
  created_at?: Date;
}
