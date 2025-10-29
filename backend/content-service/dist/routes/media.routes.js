"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaRoutes = void 0;
const express_1 = require("express");
const media_controller_1 = require("../controllers/media.controller");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|mp4|avi|mov|pdf|doc|docx/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only images, audio, video, and document files are allowed.'));
        }
    }
});
const router = (0, express_1.Router)();
exports.mediaRoutes = router;
router.get('/', media_controller_1.mediaController.getMediaAssets);
router.get('/statistics', media_controller_1.mediaController.getMediaAssetStatistics);
router.get('/search', media_controller_1.mediaController.searchMediaAssets);
router.get('/type/:type', media_controller_1.mediaController.getMediaAssetsByType);
router.get('/category/:category', media_controller_1.mediaController.getMediaAssetsByCategory);
router.get('/:mediaId', media_controller_1.mediaController.getMediaAssetById);
router.get('/:mediaId/file', media_controller_1.mediaController.getMediaAssetFile);
router.get('/:mediaId/thumbnail', media_controller_1.mediaController.getMediaAssetThumbnail);
router.post('/upload', auth_1.authenticateJWT, upload.single('file'), (0, validation_1.validate)(validation_1.validationSchemas.media), media_controller_1.mediaController.uploadMediaAsset);
router.put('/:mediaId', auth_1.authenticateJWT, (0, validation_1.validate)(validation_1.validationSchemas.media), media_controller_1.mediaController.updateMediaAsset);
router.delete('/:mediaId', auth_1.authenticateJWT, media_controller_1.mediaController.deleteMediaAsset);
//# sourceMappingURL=media.routes.js.map