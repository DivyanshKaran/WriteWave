import { Router } from 'express';
import eventRoutes from './event.routes';
import analyticsRoutes from './analytics.routes';
import communityAnalyticsRoutes from './community.routes';
import dashboardRoutes from './dashboard.routes';
import reportRoutes from './report.routes';
import abTestRoutes from './ab-test.routes';
import learningRoutes from './learning.routes';
// Kafka imports - optional
let getKafka: any, getConsumerLag: any;
try {
  const kafkaModule = require('../../../shared/utils/kafka');
  getKafka = kafkaModule.getKafka;
  getConsumerLag = kafkaModule.getConsumerLag;
} catch (e) {
  getKafka = null;
  getConsumerLag = null;
}

const router = Router();

// Mount route modules
router.use('/events', eventRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/community', communityAnalyticsRoutes);
router.use('/dashboards', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/ab-tests', abTestRoutes);
router.use('/learning', learningRoutes);

// Kafka health
router.get('/health/kafka', async (_req, res) => {
  if (process.env.ENABLE_KAFKA !== 'true' || !getKafka) {
    return res.json({ success: true, enabled: false, status: 'disabled' });
  }
  const admin = getKafka().admin();
  const start = Date.now();
  try {
    await admin.connect();
    const clusters = await admin.describeCluster();
    await admin.disconnect();
    return res.json({ success: true, enabled: true, status: 'healthy', latencyMs: Date.now() - start, cluster: clusters.clusterId });
  } catch (e: any) {
    try { await admin.disconnect(); } catch {}
    return res.status(503).json({ success: false, enabled: true, status: 'unhealthy', error: e.message });
  }
});

router.get('/health/kafka/lag', async (req, res) => {
  if (process.env.ENABLE_KAFKA !== 'true' || !getConsumerLag) {
    return res.json({ success: true, enabled: false, status: 'disabled' });
  }
  try {
    const group = (req.query['group'] as string) || 'analytics-service';
    const topic = (req.query['topic'] as string) || 'user.events';
    const lag = await getConsumerLag(group, topic);
    res.json({ success: true, ...lag });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'WriteWave Analytics Service API Documentation',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      events: {
        'POST /events': 'Track analytics event',
        'POST /events/batch': 'Track multiple events',
        'GET /events/stats': 'Get event statistics',
        'GET /events/search': 'Search events',
        'GET /events/export': 'Export events data'
      },
      analytics: {
        'GET /analytics/dashboard/:type': 'Get dashboard data',
        'GET /analytics/user/:userId/insights': 'Get user insights',
        'GET /analytics/performance/summary': 'Get performance metrics',
        'POST /analytics/query': 'Execute custom queries',
        'GET /analytics/metrics': 'Get system metrics',
        'GET /analytics/cohorts': 'Get cohort analysis'
      },
      dashboards: {
        'GET /dashboards': 'List dashboards',
        'POST /dashboards': 'Create dashboard',
        'GET /dashboards/:id': 'Get dashboard',
        'PUT /dashboards/:id': 'Update dashboard',
        'DELETE /dashboards/:id': 'Delete dashboard',
        'GET /dashboards/:id/data': 'Get dashboard data'
      },
      reports: {
        'GET /reports': 'List reports',
        'POST /reports': 'Create report',
        'GET /reports/:id': 'Get report',
        'PUT /reports/:id': 'Update report',
        'DELETE /reports/:id': 'Delete report',
        'POST /reports/:id/generate': 'Generate report',
        'GET /reports/:id/export': 'Export report'
      },
      abTests: {
        'GET /ab-tests': 'List A/B tests',
        'POST /ab-tests': 'Create A/B test',
        'GET /ab-tests/:id': 'Get A/B test',
        'PUT /ab-tests/:id': 'Update A/B test',
        'DELETE /ab-tests/:id': 'Delete A/B test',
        'POST /ab-tests/:id/assign': 'Assign user to variant',
        'GET /ab-tests/:id/results': 'Get test results'
      },
      learning: {
        'POST /learning/session': 'Track learning session',
        'GET /learning/progress/:userId': 'Get learning progress',
        'GET /learning/insights/:userId': 'Get learning insights',
        'GET /learning/analytics/:userId': 'Get learning analytics',
        'POST /learning/metrics': 'Track learning metrics'
      }
    }
  });
});

export default router;
