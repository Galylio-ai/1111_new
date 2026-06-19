import { mkdtemp, readFile, rm, stat, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadUploadMiddleware(uploadPath: string, maxAvatarSizeMb = '5') {
  vi.resetModules();
  process.env.UPLOAD_PATH = uploadPath;
  process.env.MAX_AVATAR_SIZE_MB = maxAvatarSizeMb;
  return import('../services/user/src/middleware/upload');
}

describe('user upload middleware', () => {
  const originalUploadPath = process.env.UPLOAD_PATH;
  const originalMaxAvatarSizeMb = process.env.MAX_AVATAR_SIZE_MB;
  const tempDirs: string[] = [];

  afterEach(async () => {
    if (originalUploadPath === undefined) delete process.env.UPLOAD_PATH;
    else process.env.UPLOAD_PATH = originalUploadPath;
    if (originalMaxAvatarSizeMb === undefined) delete process.env.MAX_AVATAR_SIZE_MB;
    else process.env.MAX_AVATAR_SIZE_MB = originalMaxAvatarSizeMb;
    vi.resetModules();

    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('renames validated PNG avatars to the user id and detected extension', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'avatar-upload-'));
    tempDirs.push(tempDir);
    const tempFile = path.join(tempDir, 'user-id.tmp');
    const pngBytes = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
    ]);
    await writeFile(tempFile, pngBytes);

    const { validateAndRenameAvatar } = await loadUploadMiddleware(tempDir);
    const result = await validateAndRenameAvatar(
      { path: tempFile, filename: 'user-id.tmp', mimetype: 'application/octet-stream' } as Express.Multer.File,
      'user-id',
    );

    expect(result.path).toBe(path.join(tempDir, 'user-id.png'));
    expect(result.filename).toBe('user-id.png');
    expect(result.mimetype).toBe('image/png');
    await expect(stat(tempFile)).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(readFile(result.path)).resolves.toEqual(pngBytes);
  });

  it('deletes unsupported avatar uploads and returns a validation error', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'avatar-upload-'));
    tempDirs.push(tempDir);
    const tempFile = path.join(tempDir, 'user-id.tmp');
    await writeFile(tempFile, Buffer.from('plain text'));

    const { validateAndRenameAvatar } = await loadUploadMiddleware(tempDir);

    await expect(
      validateAndRenameAvatar(
        { path: tempFile, filename: 'user-id.tmp', mimetype: 'text/plain' } as Express.Multer.File,
        'user-id',
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'File content is not a supported image',
    });
    await expect(stat(tempFile)).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
