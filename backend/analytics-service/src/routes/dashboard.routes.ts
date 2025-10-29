import { Router } from 'express';
import { Request, Response } from 'express';
import { Dashboard, DashboardType, WidgetType } from '../types';
import { learningAnalyticsService } from '../services/learning-analytics.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// List dashboards
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      type,
      isPublic,
      createdBy,
      page = 1,
      limit = 20
    } = req.query;

    const dashboards = await learningAnalyticsService.getDashboards({
      type: type as DashboardType,
      isPublic: isPublic ? isPublic === 'true' : undefined,
      createdBy: createdBy as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
    
    res.json({
      success: true,
      data: dashboards.dashboards,
      pagination: dashboards.pagination,
      message: 'Dashboards retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboards',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create dashboard
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const dashboardData: Partial<Dashboard> = {
      ...req.body,
      createdBy: req.user?.userId || 'system'
    };

    const dashboard = await learningAnalyticsService.createDashboard(dashboardData);
    
    res.status(201).json({
      success: true,
      data: dashboard,
      message: 'Dashboard created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create dashboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get dashboard by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dashboard = await learningAnalyticsService.getDashboardById(id);
    
    if (!dashboard) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
        message: `Dashboard with ID ${id} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: dashboard,
      message: 'Dashboard retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update dashboard
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const dashboard = await learningAnalyticsService.updateDashboard(id, updateData);
    
    res.json({
      success: true,
      data: dashboard,
      message: 'Dashboard updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update dashboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete dashboard
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await learningAnalyticsService.deleteDashboard(id);
    
    res.json({
      success: true,
      message: 'Dashboard deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete dashboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get dashboard data
router.get('/:id/data', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      startDate, 
      endDate,
      refresh = false
    } = req.query;

    const data = await learningAnalyticsService.getDashboardData({
      dashboardId: id,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      refresh: refresh === 'true'
    });
    
    res.json({
      success: true,
      data: data,
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

// Clone dashboard
router.post('/:id/clone', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const clonedDashboard = await learningAnalyticsService.cloneDashboard({
      dashboardId: id,
      name: name || `Copy of Dashboard ${id}`,
      description: description || '',
      createdBy: req.user?.userId || 'system'
    });
    
    res.status(201).json({
      success: true,
      data: clonedDashboard,
      message: 'Dashboard cloned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clone dashboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get dashboard templates
router.get('/templates/list', authenticate, async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    const templates = await learningAnalyticsService.getDashboardTemplates({
      type: type as DashboardType
    });
    
    res.json({
      success: true,
      data: templates,
      message: 'Dashboard templates retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard templates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
