import { Request, Response, NextFunction } from 'express';
import { ArticlesService } from '../services/articles.service';
import { 
  CreateArticleRequest, 
  UpdateArticleRequest, 
  ArticleQuery, 
  CommentRequest,
  SuccessResponse,
  ErrorResponse
} from '../types';
import { AppError } from '../utils';
import Joi from 'joi';

const articlesService = new ArticlesService();

// Validation schemas
const createArticleSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  excerpt: Joi.string().max(500).optional(),
  content: Joi.string().min(1).max(50000).required(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  published: Joi.boolean().optional()
});

const updateArticleSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  excerpt: Joi.string().max(500).optional(),
  content: Joi.string().min(1).max(50000).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  published: Joi.boolean().optional(),
  featured: Joi.boolean().optional(),
  trending: Joi.boolean().optional()
});

const commentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
  parentId: Joi.string().optional()
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  author: Joi.string().max(100).optional(),
  featured: Joi.boolean().optional(),
  trending: Joi.boolean().optional(),
  published: Joi.boolean().default(true),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'views', 'likes', 'publishedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Create article
export const createArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = createArticleSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        }
      } as ErrorResponse);
      return;
    }

    const data = value as CreateArticleRequest;
    const user = req.user!;

    const article = await articlesService.createArticle(
      data,
      user.id,
      (user as any).name,
      (user as any).username
    );

    res.status(201).json({
      success: true,
      data: article,
      message: 'Article created successfully'
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Get articles
export const getArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        }
      } as ErrorResponse);
      return;
    }

    const query = value as ArticleQuery;
    const user = req.user;

    const result = await articlesService.getArticles(query, user?.id);

    res.json({
      success: true,
      data: result
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Get article by ID or slug
export const getArticleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: { message: 'Article ID is required' } } as ErrorResponse);
      return;
    }
    const user = req.user;

    const article = await articlesService.getArticleById(id, user?.id);

    res.json({
      success: true,
      data: article
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Update article
export const updateArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: { message: 'Article ID is required' } } as ErrorResponse);
      return;
    }
    const { error, value } = updateArticleSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        }
      } as ErrorResponse);
      return;
    }

    const data = value as UpdateArticleRequest;
    const user = req.user!;

    const article = await articlesService.updateArticle(id, data, user.id);

    res.json({
      success: true,
      data: article,
      message: 'Article updated successfully'
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Delete article
export const deleteArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: { message: 'Article ID is required' } } as ErrorResponse);
      return;
    }
    const user = req.user!;

    await articlesService.deleteArticle(id, user.id);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Like/Unlike article
export const toggleLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: { message: 'Article ID is required' } } as ErrorResponse);
      return;
    }
    const user = req.user!;

    const result = await articlesService.toggleLike(id, user.id);

    res.json({
      success: true,
      data: result
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// DELETE like (idempotent): ensure article is unliked
export const deleteLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: { message: 'Article ID is required' } } as ErrorResponse);
      return;
    }
    const user = req.user!;

    const result = await articlesService.toggleLike(id, user.id);

    // If toggle returned liked=true, it means it just liked (which is not desired for DELETE),
    // so toggle again to unlike; otherwise it's already unliked.
    const finalResult = result.liked ? await articlesService.toggleLike(id, user.id) : result;

    res.json({ success: true, data: finalResult } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Bookmark/Unbookmark article
export const toggleBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: { message: 'Article ID is required' } } as ErrorResponse);
      return;
    }
    const user = req.user!;

    const result = await articlesService.toggleBookmark(id, user.id);

    res.json({
      success: true,
      data: result
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Add comment
export const addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: { message: 'Article ID is required' } } as ErrorResponse);
      return;
    }
    const { error, value } = commentSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        }
      } as ErrorResponse);
      return;
    }

    const data = value as CommentRequest;
    const user = req.user!;

    const comment = await articlesService.addComment(id, data, user.id, (user as any).name);

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Get comments
export const getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;

    const result = await articlesService.getComments(id, page, limit);

    res.json({
      success: true,
      data: result
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Get trending articles
export const getTrendingArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query['limit'] as string) || 10;
    const articles = await articlesService.getTrendingArticles(limit);

    res.json({
      success: true,
      data: articles
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Get featured articles
export const getFeaturedArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query['limit'] as string) || 10;
    const articles = await articlesService.getFeaturedArticles(limit);

    res.json({
      success: true,
      data: articles
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Get user articles
export const getUserArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const published = req.query['published'] === 'true' ? true : 
                     req.query['published'] === 'false' ? false : undefined;

    const articles = await articlesService.getUserArticles(userId, published);

    res.json({
      success: true,
      data: articles
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Get popular tags
export const getPopularTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query['limit'] as string) || 20;
    const tags = await articlesService.getPopularTags(limit);

    res.json({
      success: true,
      data: tags
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Get article statistics
export const getArticleStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await articlesService.getArticleStats();

    res.json({
      success: true,
      data: stats
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Get user article statistics
export const getUserArticleStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const stats = await articlesService.getUserArticleStats(userId);

    res.json({
      success: true,
      data: stats
    } as SuccessResponse);
  } catch (error) {
    next(error);
  }
};

// Error handling middleware
export const errorHandler = (error: any, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Articles Controller Error:', error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.statusCode.toString()
      }
    } as ErrorResponse);
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: error.details?.map((d: any) => ({
          field: d.path?.join('.'),
          message: d.message
        })) || []
      }
    } as ErrorResponse);
    return;
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: {
        message: 'Resource already exists',
        code: 'DUPLICATE_ENTRY'
      }
    } as ErrorResponse);
    return;
  }

  if (error.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: {
        message: 'Resource not found',
        code: 'NOT_FOUND'
      }
    } as ErrorResponse);
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  } as ErrorResponse);
};
