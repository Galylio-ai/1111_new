import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { config } from '../config';
import { AppError } from './errorHandler';

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
};

export function detectAvatarMime(bytes: Buffer): keyof typeof ALLOWED | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length >= pngSignature.length && bytes.subarray(0, pngSignature.length).equals(pngSignature)) {
    return 'image/png';
  }

  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }

  return null;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(config.uploadPath, 'avatars'));
  },
  filename: (req, _file, cb) => {
    const userId = req.headers['x-user-id'] as string;
    cb(null, `${userId}.tmp`);
  },
});

export const avatarUpload = multer({
  storage,
  limits: { fileSize: config.maxAvatarSizeMb * 1024 * 1024 },
});

export async function validateAndRenameAvatar(
  file: Express.Multer.File,
  userId: string,
): Promise<Express.Multer.File> {
  const handle = await fs.open(file.path, 'r');
  const header = Buffer.alloc(16);
  const { bytesRead } = await handle.read(header, 0, header.length, 0);
  await handle.close();
  const mime = detectAvatarMime(header.subarray(0, bytesRead));

  if (!mime) {
    await fs.unlink(file.path);
    throw new AppError(400, 'File content is not a supported image');
  }

  const ext = ALLOWED[mime];
  const newPath = path.join(path.dirname(file.path), `${userId}.${ext}`);

  await fs.rename(file.path, newPath);

  return {
    ...file,
    path: newPath,
    filename: `${userId}.${ext}`,
    mimetype: mime,
  };
}
