import { Router } from 'express';
import { Request, Response } from 'express';
import { Report, ReportType, ReportFormat } from '../types';
import { learningAnalyticsService } from '../services/learning-analytics.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// List reports
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      type,
      format,
      isActive,
      createdBy,
      page = 1,
      limit = 20
    } = req.query;

    const reports = await learningAnalyticsService.getReports({
      type: type as ReportType,
      format: format as ReportFormat,
      isActive: isActive ? isActive === 'true' : undefined,
      createdBy: createdBy as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
    
    res.json({
      success: true,
      data: reports.reports,
      pagination: reports.pagination,
      message: 'Reports retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get reports',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create report
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const reportData: Partial<Report> = {
      ...req.body,
      createdBy: req.user?.userId || 'system'
    };

    const report = await learningAnalyticsService.createReport(reportData);
    
    res.status(201).json({
      success: true,
      data: report,
      message: 'Report created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get report by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await learningAnalyticsService.getReportById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
        message: `Report with ID ${id} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: report,
      message: 'Report retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update report
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const report = await learningAnalyticsService.updateReport(id, updateData);
    
    res.json({
      success: true,
      data: report,
      message: 'Report updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete report
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await learningAnalyticsService.deleteReport(id);
    
    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate report
router.post('/:id/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      startDate, 
      endDate,
      format,
      parameters
    } = req.body;

    const generatedReport = await learningAnalyticsService.generateReport({
      reportId: id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      format: format || ReportFormat.JSON,
      parameters: parameters || {}
    });
    
    res.json({
      success: true,
      data: generatedReport,
      message: 'Report generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Export report
router.get('/:id/export', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      format = 'json',
      download = false
    } = req.query;

    const exportData = await learningAnalyticsService.exportReport({
      reportId: id,
      format: format as ReportFormat,
      download: download === 'true'
    });
    
    if (download === 'true') {
      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="report-${id}-${Date.now()}.${format}"`);
      res.send(exportData);
    } else {
      res.json({
        success: true,
        data: exportData,
        message: 'Report exported successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get report templates
router.get('/templates/list', authenticate, async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    const templates = await learningAnalyticsService.getReportTemplates({
      type: type as ReportType
    });
    
    res.json({
      success: true,
      data: templates,
      message: 'Report templates retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get report templates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Schedule report
router.post('/:id/schedule', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;

    const scheduledReport = await learningAnalyticsService.scheduleReport({
      reportId: id,
      schedule
    });
    
    res.json({
      success: true,
      data: scheduledReport,
      message: 'Report scheduled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to schedule report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
