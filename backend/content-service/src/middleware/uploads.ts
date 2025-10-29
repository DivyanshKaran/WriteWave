import fs from 'fs';
import path from 'path';
import multer from 'multer';

const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);
const ALLOWED_IMAGE_TYPES = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(',');

export function ensureUploadDir(): void {
  const abs = path.resolve(process.cwd(), UPLOAD_PATH);
  if (!fs.existsSync(abs)) fs.mkdirSync(abs, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_PATH),
  filename: (_req, file, cb) => {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${sanitized}`);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(new Error('Invalid file type'));
  cb(null, true);
}

export const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE }, fileFilter });


