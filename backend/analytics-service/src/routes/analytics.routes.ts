import { Router } from 'express';
import { Request, Response } from 'express';
import { AnalyticsQuery, TimeGranularity, AggregationType } from '../types';
import { learningAnalyticsService } from '../services/learning-analytics.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get dashboard data by type
router.get('/dashboard/:type', authenticate, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { 
      startDate, 
      endDate, 
      granularity = 'day',
      userId,
      groupBy
    } = req.query;

    const dashboardData = await learningAnalyticsService.getDashboardData({
      type: type as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      granularity: granularity as TimeGranularity,
      userId: userId as string,
      groupBy: groupBy as string
    });
    
    res.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user insights
router.get('/user/:userId/insights', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { 
      startDate, 
      endDate,
      includeRecommendations = true
    } = req.query;

    const insights = await learningAnalyticsService.getUserInsights({
      userId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      includeRecommendations: includeRecommendations === 'true'
    });
    
    res.json({
      success: true,
      data: insights,
      message: 'User insights retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get performance summary
router.get('/performance/summary', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      startDate, 
      endDate,
      service,
      endpoint,
      groupBy = 'hour'
    } = req.query;

    const summary = await learningAnalyticsService.getPerformanceSummary({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      service: service as string,
      endpoint: endpoint as string,
      groupBy: groupBy as string
    });
    
    res.json({
      success: true,
      data: summary,
      message: 'Performance summary retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get performance summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Execute custom analytics query
router.post('/query', authenticate, async (req: Request, res: Response) => {
  try {
    const query: AnalyticsQuery = req.body;
    
    const results = await learningAnalyticsService.executeQuery(query);
    
    res.json({
      success: true,
      data: results,
      message: 'Query executed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to execute query',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get system metrics
router.get('/metrics', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      startDate, 
      endDate,
      metricType,
      service,
      groupBy = 'minute'
    } = req.query;

    const metrics = await learningAnalyticsService.getSystemMetrics({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      metricType: metricType as string,
      service: service as string,
      groupBy: groupBy as string
    });
    
    res.json({
      success: true,
      data: metrics,
      message: 'System metrics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get system metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get cohort analysis
router.get('/cohorts', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      startDate, 
      endDate,
      cohortType = 'user',
      metric = 'retention'
    } = req.query;

    const cohorts = await learningAnalyticsService.getCohortAnalysis({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      cohortType: cohortType as string,
      metric: metric as string
    });
    
    res.json({
      success: true,
      data: cohorts,
      message: 'Cohort analysis retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cohort analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get funnel analysis
router.get('/funnels', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      startDate, 
      endDate,
      funnelName,
      steps
    } = req.query;

    const funnels = await learningAnalyticsService.getFunnelAnalysis({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      funnelName: funnelName as string,
      steps: steps ? (steps as string).split(',') : undefined
    });
    
    res.json({
      success: true,
      data: funnels,
      message: 'Funnel analysis retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get funnel analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
