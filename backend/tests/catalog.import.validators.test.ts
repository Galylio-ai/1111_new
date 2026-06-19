import { describe, expect, it } from 'vitest';
import * as validators from '../services/retail/src/validators/import.validators';

describe('catalog import validators', () => {
  it('rejects invalid source types and missing payload data', () => {
    expect(
      validators.importPayloadSchema.safeParse({
        source_type: 'xml',
        mapping: { name: 'title' },
        rows: [{ title: 'Phone' }],
      }).success,
    ).toBe(false);

    expect(
      validators.importPayloadSchema.safeParse({
        source_type: 'json',
        mapping: { name: 'title' },
      }).success,
    ).toBe(false);

    expect(
      validators.importPayloadSchema.safeParse({
        source_type: 'csv',
        mapping: { name: 'title' },
        rows: [{ title: 'Phone' }],
      }).success,
    ).toBe(false);
  });

  it('accepts json and csv import payloads with explicit mappings', () => {
    expect(
      validators.importPayloadSchema.safeParse({
        source_type: 'json',
        mapping: { name: 'title' },
        rows: [{ title: 'Phone' }],
      }).success,
    ).toBe(true);

    expect(
      validators.importPayloadSchema.safeParse({
        source_type: 'csv',
        mapping: { name: 'title' },
        csv: 'title\nPhone',
      }).success,
    ).toBe(true);
  });
});
