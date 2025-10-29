import { Router } from 'express';
import { Request, Response } from 'express';
import { ABTest, ABTestStatus, ABTestMetricType } from '../types';
import { learningAnalyticsService } from '../services/learning-analytics.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// List A/B tests
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      status,
      page = 1,
      limit = 20
    } = req.query;

    const tests = await learningAnalyticsService.getABTests({
      status: status as ABTestStatus,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
    
    res.json({
      success: true,
      data: tests.tests,
      pagination: tests.pagination,
      message: 'A/B tests retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get A/B tests',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create A/B test
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const testData: Partial<ABTest> = {
      ...req.body,
      createdBy: req.user?.userId || 'system'
    };

    const test = await learningAnalyticsService.createABTest(testData);
    
    res.status(201).json({
      success: true,
      data: test,
      message: 'A/B test created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create A/B test',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get A/B test by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const test = await learningAnalyticsService.getABTestById(id);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'A/B test not found',
        message: `A/B test with ID ${id} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: test,
      message: 'A/B test retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get A/B test',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update A/B test
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const test = await learningAnalyticsService.updateABTest(id, updateData);
    
    res.json({
      success: true,
      data: test,
      message: 'A/B test updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update A/B test',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete A/B test
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await learningAnalyticsService.deleteABTest(id);
    
    res.json({
      success: true,
      message: 'A/B test deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete A/B test',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Assign user to variant
router.post('/:id/assign', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, variantId, forceAssignment } = req.body;

    const assignment = await learningAnalyticsService.assignUserToVariant({
      testId: id,
      userId: userId || req.user?.userId,
      variantId,
      forceAssignment: forceAssignment || false
    });
    
    res.json({
      success: true,
      data: assignment,
      message: 'User assigned to variant successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to assign user to variant',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get test results
router.get('/:id/results', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      startDate, 
      endDate,
      includeSignificance = true
    } = req.query;

    const results = await learningAnalyticsService.getABTestResults({
      testId: id,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      includeSignificance: includeSignificance === 'true'
    });
    
    res.json({
      success: true,
      data: results,
      message: 'A/B test results retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get A/B test results',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start A/B test
router.post('/:id/start', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const test = await learningAnalyticsService.startABTest(id);
    
    res.json({
      success: true,
      data: test,
      message: 'A/B test started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start A/B test',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stop A/B test
router.post('/:id/stop', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const test = await learningAnalyticsService.stopABTest(id);
    
    res.json({
      success: true,
      data: test,
      message: 'A/B test stopped successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to stop A/B test',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's variant assignment
router.get('/:id/assignment/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    
    const assignment = await learningAnalyticsService.getUserAssignment({
      testId: id,
      userId
    });
    
    res.json({
      success: true,
      data: assignment,
      message: 'User assignment retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user assignment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
