import { Router } from 'express';
import { mediaController } from '../controllers/media.controller';
import { validate, validationSchemas } from '../middleware/validation';
import { authenticateJWT } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, audio, and video files
    const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|mp4|avi|mov|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, audio, video, and document files are allowed.'));
    }
  }
});

const router = Router();

// Media routes
// GET /media - Get all media assets
router.get('/', mediaController.getMediaAssets);

// GET /media/statistics - Get media asset statistics
router.get('/statistics', mediaController.getMediaAssetStatistics);

// GET /media/search - Search media assets
router.get('/search', mediaController.searchMediaAssets);

// GET /media/type/:type - Get media assets by type
router.get('/type/:type', mediaController.getMediaAssetsByType);

// GET /media/category/:category - Get media assets by category
router.get('/category/:category', mediaController.getMediaAssetsByCategory);

// GET /media/:mediaId - Get media asset by ID
router.get('/:mediaId', mediaController.getMediaAssetById);

// GET /media/:mediaId/file - Get media asset file
router.get('/:mediaId/file', mediaController.getMediaAssetFile);

// GET /media/:mediaId/thumbnail - Get media asset thumbnail
router.get('/:mediaId/thumbnail', mediaController.getMediaAssetThumbnail);

// POST /media/upload - Upload media asset
router.post('/upload', authenticateJWT, upload.single('file'), validate(validationSchemas.media), mediaController.uploadMediaAsset);

// PUT /media/:mediaId - Update media asset (admin only)
router.put('/:mediaId', authenticateJWT, validate(validationSchemas.media), mediaController.updateMediaAsset);

// DELETE /media/:mediaId - Delete media asset (admin only)
router.delete('/:mediaId', authenticateJWT, mediaController.deleteMediaAsset);

export { router as mediaRoutes };
