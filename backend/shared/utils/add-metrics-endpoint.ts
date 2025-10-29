/**
 * Helper to add /metrics endpoint to Express app
 * Usage: addMetricsEndpoint(app, 'user-service')
 */
import express, { Request, Response } from 'express';
import { metricsCollector, metricsMiddleware } from './metrics';
import { logger } from './logger';

export function addMetricsEndpoint(app: express.Application, serviceName: string): void {
  // Add metrics middleware to collect HTTP metrics
  app.use(metricsMiddleware(serviceName));

  // Add /metrics endpoint (Prometheus format)
  app.get('/metrics', (req: Request, res: Response) => {
    try {
      const format = req.query.format || req.headers.accept;
      const isPrometheusFormat = format === 'text/plain' || format?.includes('text/plain');
      
      if (isPrometheusFormat || format === undefined) {
        res.set('Content-Type', 'text/plain');
        res.send(metricsCollector.getPrometheusFormat());
      } else {
        res.json(metricsCollector.getJSONFormat());
      }
    } catch (error: any) {
      logger.error('Error generating metrics', { error: error.message });
      res.status(500).json({ error: 'Failed to generate metrics' });
    }
  });

  logger.info('Metrics endpoint added', { service: serviceName, path: '/metrics' });
}

