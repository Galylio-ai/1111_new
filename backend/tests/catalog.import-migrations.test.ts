import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';

const domains = ['retail', 'para', 'alimentation', 'fashion'] as const;

describe('catalog import migrations', () => {
  it.each(domains)('%s has append-only import job and error tables', async (domain) => {
    const source = await readFile(
      path.join(process.cwd(), 'services', domain, 'src', 'db', 'migrations', '003_import_jobs.js'),
      'utf8',
    );

    expect(source).toContain('CREATE TABLE IF NOT EXISTS import_jobs');
    expect(source).toContain('CREATE TABLE IF NOT EXISTS import_errors');
    expect(source).toContain("source_type IN ('json', 'csv')");
    expect(source).toContain('completed_with_errors');
    expect(source).toContain('idx_import_errors_import_job_id');
    expect(source).toContain('archived_count');
  });
});
