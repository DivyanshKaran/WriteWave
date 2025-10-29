import { Router } from 'express';
import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  toggleLike,
  toggleBookmark,
  addComment,
  getComments,
  getTrendingArticles,
  getFeaturedArticles,
  getUserArticles,
  getPopularTags,
  getArticleStats,
  getUserArticleStats,
  errorHandler
} from '../controllers/articles.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required for reading)
router.get('/', getArticles);
router.get('/trending', getTrendingArticles);
router.get('/featured', getFeaturedArticles);
router.get('/tags/popular', getPopularTags);
router.get('/stats', getArticleStats);
router.get('/:id', getArticleById);
router.get('/:id/comments', getComments);
router.get('/user/:userId', getUserArticles);
router.get('/user/:userId/stats', getUserArticleStats);

// Protected routes (authentication required)
router.post('/', authenticate, createArticle);
router.put('/:id', authenticate, updateArticle);
router.delete('/:id', authenticate, deleteArticle);
router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/bookmark', authenticate, toggleBookmark);
router.post('/:id/comments', authenticate, addComment);

// Error handling middleware
router.use(errorHandler);

export { router as articlesRoutes };
