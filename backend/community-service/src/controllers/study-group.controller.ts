import { Request, Response } from 'express';
import { studyGroupService } from '../services/study-group.service';
import { ApiResponse } from '../types';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

export class StudyGroupController {
  // Study Groups
  async getStudyGroups(req: Request, res: Response): Promise<void> {
    try {
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const userId = req.user?.id;
      const { groups, total } = await studyGroupService.getStudyGroups(pagination, userId);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: groups,
        message: 'Study groups retrieved successfully',
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

  async getStudyGroup(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const userId = req.user?.id;
      
      const group = await studyGroupService.getStudyGroup(groupId, userId);
      
      if (!group) {
        res.status(404).json({
          success: false,
          error: 'Study group not found'
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: group,
        message: 'Study group retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async createStudyGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const groupData = req.body;
      
      const group = await studyGroupService.createStudyGroup(groupData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: group,
        message: 'Study group created successfully'
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

  async updateStudyGroup(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;
      
      const group = await studyGroupService.updateStudyGroup(groupId, updateData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: group,
        message: 'Study group updated successfully'
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

  async deleteStudyGroup(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const userId = req.user!.id;
      
      await studyGroupService.deleteStudyGroup(groupId, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Study group deleted successfully'
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

  // Member Management
  async joinStudyGroup(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const userId = req.user!.id;
      
      await studyGroupService.joinStudyGroup(groupId, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Successfully joined study group'
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

  async leaveStudyGroup(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const userId = req.user!.id;
      
      await studyGroupService.leaveStudyGroup(groupId, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Successfully left study group'
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

  async updateMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const { groupId, memberId } = req.params;
      const userId = req.user!.id;
      const { newRole } = req.body;
      
      await studyGroupService.updateMemberRole(groupId, memberId, newRole, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Member role updated successfully'
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

  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const { groupId, memberId } = req.params;
      const userId = req.user!.id;
      
      await studyGroupService.removeMember(groupId, memberId, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Member removed successfully'
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

  // Challenges
  async getChallenges(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const { challenges, total } = await studyGroupService.getChallenges(groupId, pagination);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: challenges,
        message: 'Challenges retrieved successfully',
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

  async createChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const userId = req.user!.id;
      const challengeData = req.body;
      
      const challenge = await studyGroupService.createChallenge(groupId, challengeData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: challenge,
        message: 'Challenge created successfully'
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

  async updateChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { challengeId } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;
      
      const challenge = await studyGroupService.updateChallenge(challengeId, updateData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: challenge,
        message: 'Challenge updated successfully'
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

  async deleteChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { challengeId } = req.params;
      const userId = req.user!.id;
      
      await studyGroupService.deleteChallenge(challengeId, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Challenge deleted successfully'
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

  // User's Study Groups
  async getUserStudyGroups(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const { groups, total } = await studyGroupService.getUserStudyGroups(userId, pagination);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: groups,
        message: 'User study groups retrieved successfully',
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
}

export const studyGroupController = new StudyGroupController();
