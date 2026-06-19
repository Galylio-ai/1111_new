import { parse } from 'csv-parse/sync';

export function parseCsvRows(csv: string): Array<Record<string, unknown>> {
  return parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, unknown>>;
}
