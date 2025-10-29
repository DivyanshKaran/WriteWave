"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.ensureUploadDir = ensureUploadDir;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);
const ALLOWED_IMAGE_TYPES = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
function ensureUploadDir() {
    const abs = path_1.default.resolve(process.cwd(), UPLOAD_PATH);
    if (!fs_1.default.existsSync(abs)) {
        fs_1.default.mkdirSync(abs, { recursive: true });
    }
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_PATH);
    },
    filename: (_req, file, cb) => {
        const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const timestamp = Date.now();
        cb(null, `${timestamp}-${sanitized}`);
    },
});
function fileFilter(_req, file, cb) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'));
    }
    cb(null, true);
}
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
});
//# sourceMappingURL=uploads.js.map