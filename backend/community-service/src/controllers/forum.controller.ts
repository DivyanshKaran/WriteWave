import { Request, Response } from 'express';
import { forumService } from '../services/forum.service';
import { ApiResponse } from '../types';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { 
  createPostSchema, 
  updatePostSchema, 
  createCommentSchema, 
  updateCommentSchema,
  voteSchema,
  searchSchema 
} from '../middleware/validation';

export class ForumController {
  // Categories
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await forumService.getCategories();
      
      const response: ApiResponse = {
        success: true,
        data: categories,
        message: 'Categories retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getCategory(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const category = await forumService.getCategory(slug);
      
      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found'
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: category,
        message: 'Category retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Posts
  async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.query;
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string || 'lastActivityAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const { posts, total } = await forumService.getPosts(
        categoryId as string, 
        pagination
      );

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: posts,
        message: 'Posts retrieved successfully',
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1
        }
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;
      
      const post = await forumService.getPost(postId, userId);
      
      if (!post) {
        res.status(404).json({
          success: false,
          error: 'Post not found'
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: post,
        message: 'Post retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const postData = req.body;
      
      const post = await forumService.createPost(postData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: post,
        message: 'Post created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;
      
      const post = await forumService.updatePost(postId, updateData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: post,
        message: 'Post updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;
      
      await forumService.deletePost(postId, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Post deleted successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async pinPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;
      
      const post = await forumService.pinPost(postId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: post,
        message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Comments
  async getComments(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const { comments, total } = await forumService.getComments(postId, pagination);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: comments,
        message: 'Comments retrieved successfully',
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1
        }
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async createComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const commentData = req.body;
      
      const comment = await forumService.createComment(commentData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: comment,
        message: 'Comment created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async updateComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;
      
      const comment = await forumService.updateComment(commentId, updateData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: comment,
        message: 'Comment updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;
      
      await forumService.deleteComment(commentId, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Comment deleted successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Voting
  async votePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;
      const { voteType } = req.body;
      
      await forumService.votePost(postId, userId, voteType);
      
      const response: ApiResponse = {
        success: true,
        message: 'Vote recorded successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async voteComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;
      const { voteType } = req.body;
      
      await forumService.voteComment(commentId, userId, voteType);
      
      const response: ApiResponse = {
        success: true,
        message: 'Vote recorded successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Search
  async searchPosts(req: Request, res: Response): Promise<void> {
    try {
      const searchQuery = req.query;
      
      const { posts, total } = await forumService.searchPosts(searchQuery as any);

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const totalPages = Math.ceil(total / limit);
      
      const response: ApiResponse = {
        success: true,
        data: posts,
        message: 'Search completed successfully',
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}

export const forumController = new ForumController();
