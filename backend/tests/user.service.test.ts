import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectAvatarMime } from '../services/user/src/middleware/upload';

function restoreEnvValue(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

async function loadUserService(dbMock: ReturnType<typeof vi.fn>, unlinkSpy: ReturnType<typeof vi.fn>) {
  vi.resetModules();
  process.env.UPLOAD_PATH = 'C:\\uploads';

  vi.doMock('../services/user/src/db', () => ({ db: dbMock }));
  vi.doMock('../services/user/src/utils/logger', () => ({
    logger: { warn: vi.fn() },
  }));
  vi.doMock('fs', () => ({
    default: { unlink: unlinkSpy },
  }));

  return import('../services/user/src/services/user.service');
}

describe('user avatar and profile safeguards', () => {
  const originalUploadPath = process.env.UPLOAD_PATH;

  afterEach(() => {
    restoreEnvValue('UPLOAD_PATH', originalUploadPath);
    vi.resetModules();
    vi.doUnmock('../services/user/src/db');
    vi.doUnmock('../services/user/src/utils/logger');
    vi.doUnmock('fs');
  });

  it('detects supported avatar image signatures without a parser dependency', () => {
    expect(detectAvatarMime(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe('image/jpeg');
    expect(detectAvatarMime(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
      'image/png',
    );
    expect(detectAvatarMime(Buffer.from('RIFFxxxxWEBP', 'ascii'))).toBe('image/webp');
    expect(detectAvatarMime(Buffer.from('not an image', 'ascii'))).toBeNull();
  });

  it('rejects profile updates when the active user update returns no row', async () => {
    const builder = {
      where: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
    };
    const service = await loadUserService(vi.fn(() => builder), vi.fn());

    await expect(service.updateMe('user-id', { full_name: 'New Name' })).rejects.toMatchObject({
      statusCode: 404,
      message: 'User not found',
    });
    expect(builder.where).toHaveBeenCalledWith({ id: 'user-id', is_active: true });
  });

  it('does not delete the new avatar when replacing an avatar with the same extension', async () => {
    const filePath = 'C:\\uploads\\avatars\\user-id.jpg';
    const selectBuilder = {
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({ avatar_url: '/uploads/avatars/user-id.jpg' }),
    };
    const updateBuilder = {
      where: vi.fn().mockReturnThis(),
      update: vi.fn().mockResolvedValue(1),
    };
    const builders = [selectBuilder, updateBuilder];
    const unlinkSpy = vi.fn((_path: string, cb: (err?: NodeJS.ErrnoException | null) => void) => cb(null));
    const service = await loadUserService(vi.fn(() => builders.shift()), unlinkSpy);

    await expect(
      service.updateAvatar('user-id', {
        path: filePath,
      } as Express.Multer.File),
    ).resolves.toBe('/uploads/avatars/user-id.jpg');
    expect(unlinkSpy).not.toHaveBeenCalled();
    expect(selectBuilder.where).toHaveBeenCalledWith({ id: 'user-id', is_active: true });
    expect(updateBuilder.where).toHaveBeenCalledWith({ id: 'user-id', is_active: true });
  });

  it('deletes the previous avatar when it is a different uploaded file', async () => {
    const filePath = 'C:\\uploads\\avatars\\user-id.webp';
    const selectBuilder = {
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({ avatar_url: '/uploads/avatars/user-id.jpg' }),
    };
    const updateBuilder = {
      where: vi.fn().mockReturnThis(),
      update: vi.fn().mockResolvedValue(1),
    };
    const builders = [selectBuilder, updateBuilder];
    const unlinkSpy = vi.fn((_path: string, cb: (err?: NodeJS.ErrnoException | null) => void) => cb(null));
    const service = await loadUserService(vi.fn(() => builders.shift()), unlinkSpy);

    await expect(
      service.updateAvatar('user-id', {
        path: filePath,
      } as Express.Multer.File),
    ).resolves.toBe('/uploads/avatars/user-id.webp');
    expect(unlinkSpy).toHaveBeenCalledWith('C:\\uploads\\avatars\\user-id.jpg', expect.any(Function));
  });

  it('rejects avatar updates for missing or inactive users and removes the uploaded file', async () => {
    const filePath = 'C:\\uploads\\avatars\\user-id.jpg';
    const selectBuilder = {
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(undefined),
    };
    const unlinkSpy = vi.fn((_path: string, cb: (err?: NodeJS.ErrnoException | null) => void) => cb(null));
    const service = await loadUserService(vi.fn(() => selectBuilder), unlinkSpy);

    await expect(
      service.updateAvatar('user-id', {
        path: filePath,
      } as Express.Multer.File),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: 'User not found',
    });
    expect(unlinkSpy).toHaveBeenCalledWith(filePath, expect.any(Function));
  });
});
