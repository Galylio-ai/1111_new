import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';

import * as retailService from '../services/retail/src/services/import.service';
import * as retailController from '../services/retail/src/controllers/import.controller';
import retailRoutes from '../services/retail/src/routes/import.routes';
import * as retailValidators from '../services/retail/src/validators/import.validators';

import * as paraService from '../services/para/src/services/import.service';
import * as paraController from '../services/para/src/controllers/import.controller';
import paraRoutes from '../services/para/src/routes/import.routes';
import * as paraValidators from '../services/para/src/validators/import.validators';

import * as alimentationService from '../services/alimentation/src/services/import.service';
import * as alimentationController from '../services/alimentation/src/controllers/import.controller';
import alimentationRoutes from '../services/alimentation/src/routes/import.routes';
import * as alimentationValidators from '../services/alimentation/src/validators/import.validators';

import * as fashionService from '../services/fashion/src/services/import.service';
import * as fashionController from '../services/fashion/src/controllers/import.controller';
import fashionRoutes from '../services/fashion/src/routes/import.routes';
import * as fashionValidators from '../services/fashion/src/validators/import.validators';

const expectedServiceExports = [
  'createImportService',
  'previewImport',
  'runImport',
  'getImportJobById',
  'listImportErrors',
] as const;

const expectedControllerExports = [
  'previewImport',
  'runImport',
  'getImportJobById',
  'listImportErrors',
] as const;

const expectedValidatorExports = ['importPayloadSchema', 'idParamSchema', 'paginationSchema'] as const;

function expectExports(moduleExports: Record<string, unknown>, names: readonly string[]) {
  for (const name of names) {
    expect(moduleExports, `missing export ${name}`).toHaveProperty(name);
  }
}

describe('catalog import copied contracts', () => {
  it.each([
    ['retail', retailService, retailController, retailValidators, retailRoutes],
    ['para', paraService, paraController, paraValidators, paraRoutes],
    ['alimentation', alimentationService, alimentationController, alimentationValidators, alimentationRoutes],
    ['fashion', fashionService, fashionController, fashionValidators, fashionRoutes],
  ])('%s exposes import service/controller/validator/route contracts', (_domain, service, controller, validators, routes) => {
    expectExports(service, expectedServiceExports);
    expectExports(controller, expectedControllerExports);
    expectExports(validators, expectedValidatorExports);
    expect(routes).toBeDefined();
  });

  it('keeps copied import surfaces identical across services', () => {
    expect(Object.keys(paraService).sort()).toEqual(Object.keys(retailService).sort());
    expect(Object.keys(alimentationService).sort()).toEqual(Object.keys(retailService).sort());
    expect(Object.keys(fashionService).sort()).toEqual(Object.keys(retailService).sort());
    expect(Object.keys(paraController).sort()).toEqual(Object.keys(retailController).sort());
    expect(Object.keys(alimentationController).sort()).toEqual(Object.keys(retailController).sort());
    expect(Object.keys(fashionController).sort()).toEqual(Object.keys(retailController).sort());
    expect(Object.keys(paraValidators).sort()).toEqual(Object.keys(retailValidators).sort());
    expect(Object.keys(alimentationValidators).sort()).toEqual(Object.keys(retailValidators).sort());
    expect(Object.keys(fashionValidators).sort()).toEqual(Object.keys(retailValidators).sort());
  });

  it.each(['retail', 'para', 'alimentation', 'fashion'])('%s registers /imports before the error handler', async (domain) => {
    const source = await readFile(path.join(process.cwd(), 'services', domain, 'src', 'index.ts'), 'utf8');

    expect(source).toContain("import importRouter from './routes/import.routes'");
    expect(source.indexOf("app.use('/imports', importRouter)")).toBeGreaterThan(-1);
    expect(source.indexOf("app.use('/imports', importRouter)")).toBeLessThan(
      source.indexOf('app.use(errorHandler)'),
    );
  });
});
