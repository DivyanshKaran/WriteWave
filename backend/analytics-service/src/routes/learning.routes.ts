import { Router } from 'express';
import { Request, Response } from 'express';
import { LearningMetrics, DifficultyLevel, LearningMethod } from '../types';
import { learningAnalyticsService } from '../services/learning-analytics.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// Track learning session
router.post('/session', authenticate, async (req: Request, res: Response) => {
  try {
    const sessionData: LearningMetrics = {
      userId: req.user?.userId || req.body.userId || '',
      sessionId: req.body.sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      startTime: req.body.startTime ? new Date(req.body.startTime) : new Date(),
      endTime: req.body.endTime ? new Date(req.body.endTime) : new Date(),
      duration: req.body.duration || 0,
      charactersPracticed: req.body.charactersPracticed || 0,
      charactersCorrect: req.body.charactersCorrect || 0,
      charactersIncorrect: req.body.charactersIncorrect || 0,
      accuracy: req.body.accuracy || 0,
      xpGained: req.body.xpGained || 0,
      streakUpdated: req.body.streakUpdated || false,
      difficulty: req.body.difficulty || 'BEGINNER',
      method: req.body.method || 'FLASHCARDS',
      device: req.body.device || 'unknown',
      platform: req.body.platform || 'WEB',
      characterId: req.body.characterId,
      ...req.body
    };

    const session = await learningAnalyticsService.trackLearningSession(sessionData);
    
    res.status(201).json({
      success: true,
      data: session,
      message: 'Learning session tracked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to track learning session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get learning progress for user
router.get('/progress/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { 
      startDate, 
      endDate,
      characterId,
      method,
      difficulty
    } = req.query;

    const progress = await learningAnalyticsService.getLearningProgress({
      userId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      characterId: characterId as string,
      method: method as LearningMethod,
      difficulty: difficulty as DifficultyLevel
    });
    
    res.json({
      success: true,
      data: progress,
      message: 'Learning progress retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get learning progress',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get learning insights for user
router.get('/insights/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { 
      startDate, 
      endDate,
      includeRecommendations = true,
      includeComparisons = false
    } = req.query;

    const insights = await learningAnalyticsService.getLearningInsights({
      userId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      includeRecommendations: includeRecommendations === 'true',
      includeComparisons: includeComparisons === 'true'
    });
    
    res.json({
      success: true,
      data: insights,
      message: 'Learning insights retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get learning insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get learning analytics for user
router.get('/analytics/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { 
      startDate, 
      endDate,
      granularity = 'day',
      groupBy
    } = req.query;

    const analytics = await learningAnalyticsService.getLearningAnalytics({
      userId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      granularity: granularity as string,
      groupBy: groupBy as string
    });
    
    res.json({
      success: true,
      data: analytics,
      message: 'Learning analytics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get learning analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Track learning metrics
router.post('/metrics', authenticate, async (req: Request, res: Response) => {
  try {
    const metricsData = {
      ...req.body,
      userId: req.user?.userId || req.body.userId,
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date()
    };

    const metrics = await learningAnalyticsService.trackLearningMetrics(metricsData);
    
    res.status(201).json({
      success: true,
      data: metrics,
      message: 'Learning metrics tracked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to track learning metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get character learning statistics
router.get('/characters/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      userId,
      characterId,
      startDate, 
      endDate,
      method,
      difficulty
    } = req.query;

    const stats = await learningAnalyticsService.getCharacterLearningStats({
      userId: userId as string,
      characterId: characterId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      method: method as LearningMethod,
      difficulty: difficulty as DifficultyLevel
    });
    
    res.json({
      success: true,
      data: stats,
      message: 'Character learning statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get character learning statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get learning streaks
router.get('/streaks/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { 
      startDate, 
      endDate,
      includeHistory = true
    } = req.query;

    const streaks = await learningAnalyticsService.getLearningStreaks({
      userId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      includeHistory: includeHistory === 'true'
    });
    
    res.json({
      success: true,
      data: streaks,
      message: 'Learning streaks retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get learning streaks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get learning achievements
router.get('/achievements/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { 
      startDate, 
      endDate,
      includeProgress = true
    } = req.query;

    const achievements = await learningAnalyticsService.getLearningAchievements({
      userId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      includeProgress: includeProgress === 'true'
    });
    
    res.json({
      success: true,
      data: achievements,
      message: 'Learning achievements retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get learning achievements',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
