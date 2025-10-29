import { logger } from '../config/logger';

export const Topics = {
  USER_EVENTS: 'user.events',
  CONTENT_EVENTS: 'content.events',
  ARTICLES_EVENTS: 'articles.events',
  COMMUNITY_EVENTS: 'community.events',
  PROGRESS_EVENTS: 'progress.events',
  NOTIFICATION_EVENTS: 'notification.events',
  ANALYTICS_EVENTS: 'analytics.events',
};

export async function publish(topic: string, key: string, value: object): Promise<void> {
  if (process.env.ENABLE_KAFKA === 'true') {
    logger.warn('Kafka not configured in user-service build context; skipping publish', {
      topic,
      key,
      value,
    });
  }
}

export async function getProducer(): Promise<unknown> {
  logger.warn('Kafka producer not available in user-service build context');
  return {};
}

export async function disconnectKafka(): Promise<void> {
  // No-op for local build context
}


