import { Request, Response } from 'express';
import { socialService } from '../services/social.service';
import { ApiResponse } from '../types';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

export class SocialController {
  // Friend Requests
  async getFriendRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const type = req.query.type as 'sent' | 'received' || 'received';
      
      const friendRequests = await socialService.getFriendRequests(userId, type);
      
      const response: ApiResponse = {
        success: true,
        data: friendRequests,
        message: 'Friend requests retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async createFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const requestData = req.body;
      
      const friendRequest = await socialService.createFriendRequest(requestData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: friendRequest,
        message: 'Friend request sent successfully'
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

  async updateFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;
      
      const friendRequest = await socialService.updateFriendRequest(requestId, updateData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: friendRequest,
        message: 'Friend request updated successfully'
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

  async cancelFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const userId = req.user!.id;
      
      await socialService.cancelFriendRequest(requestId, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Friend request cancelled successfully'
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

  // Friendships
  async getFriends(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const { friends, total } = await socialService.getFriends(userId, pagination);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: friends,
        message: 'Friends retrieved successfully',
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

  async removeFriend(req: Request, res: Response): Promise<void> {
    try {
      const { friendId } = req.params;
      const userId = req.user!.id;
      
      await socialService.removeFriend(friendId, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Friend removed successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Follow System
  async followUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId: followingId } = req.params;
      const followerId = req.user!.id;
      
      const follow = await socialService.followUser(followingId, followerId);
      
      const response: ApiResponse = {
        success: true,
        data: follow,
        message: 'Successfully followed user'
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

  async unfollowUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId: followingId } = req.params;
      const followerId = req.user!.id;
      
      await socialService.unfollowUser(followingId, followerId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Successfully unfollowed user'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const { followers, total } = await socialService.getFollowers(userId, pagination);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: followers,
        message: 'Followers retrieved successfully',
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

  async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const pagination = {
        page: parseInt(req.query.page as string) || 20,
        limit: parseInt(req.query.limit as string) || 20
      };

      const { following, total } = await socialService.getFollowing(userId, pagination);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: following,
        message: 'Following retrieved successfully',
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

  // Activities
  async getUserActivity(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const { activities, total } = await socialService.getUserActivity(userId, pagination);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: activities,
        message: 'User activity retrieved successfully',
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

  async getFriendActivity(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const { activities, total } = await socialService.getFriendActivity(userId, pagination);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: activities,
        message: 'Friend activity retrieved successfully',
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

  // Achievements
  async getUserAchievements(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const { achievements, total } = await socialService.getUserAchievements(userId, pagination);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: achievements,
        message: 'User achievements retrieved successfully',
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

  // Mentorship
  async getMentorshipRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const type = req.query.type as 'sent' | 'received' || 'received';
      
      const mentorshipRequests = await socialService.getMentorshipRequests(userId, type);
      
      const response: ApiResponse = {
        success: true,
        data: mentorshipRequests,
        message: 'Mentorship requests retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async createMentorshipRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const requestData = req.body;
      
      const mentorshipRequest = await socialService.createMentorshipRequest(requestData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: mentorshipRequest,
        message: 'Mentorship request sent successfully'
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

  async updateMentorshipRequest(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const userId = req.user!.id;
      const { status } = req.body;
      
      const mentorshipRequest = await socialService.updateMentorshipRequest(requestId, status, userId);
      
      const response: ApiResponse = {
        success: true,
        data: mentorshipRequest,
        message: 'Mentorship request updated successfully'
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

  // User Stats
  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const stats = await socialService.getUserStats(userId);
      
      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'User stats retrieved successfully'
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

export const socialController = new SocialController();
