const express = require('express');
const { createClient } = require('redis');
const { Pool } = require('pg');
const amqp = require('amqplib');
const kafka = require('kafkajs');
const winston = require('winston');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 8080;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'business-metrics.log' })
  ]
});

// Prometheus metrics
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Business metrics
const userRegistrations = new client.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['source', 'country', 'device_type'],
  registers: [register]
});

const userChurn = new client.Counter({
  name: 'user_churn_total',
  help: 'Total number of user churn events',
  labelNames: ['reason', 'user_type', 'retention_days'],
  registers: [register]
});

const contentCreations = new client.Counter({
  name: 'content_creations_total',
  help: 'Total number of content creations',
  labelNames: ['content_type', 'user_type', 'category'],
  registers: [register]
});

const progressUpdates = new client.Counter({
  name: 'progress_updates_total',
  help: 'Total number of progress updates',
  labelNames: ['update_type', 'difficulty_level', 'completion_status'],
  registers: [register]
});

const communityInteractions = new client.Counter({
  name: 'community_interactions_total',
  help: 'Total number of community interactions',
  labelNames: ['interaction_type', 'content_type', 'user_type'],
  registers: [register]
});

const notificationDeliveries = new client.Counter({
  name: 'notification_deliveries_total',
  help: 'Total number of notification deliveries',
  labelNames: ['notification_type', 'delivery_method', 'status'],
  registers: [register]
});

const analyticsEvents = new client.Counter({
  name: 'analytics_events_total',
  help: 'Total number of analytics events',
  labelNames: ['event_type', 'source', 'user_segment'],
  registers: [register]
});

const activeUsers = new client.Gauge({
  name: 'active_users_total',
  help: 'Total number of active users',
  labelNames: ['user_type', 'activity_level'],
  registers: [register]
});

const userSessions = new client.Counter({
  name: 'user_sessions_total',
  help: 'Total number of user sessions',
  labelNames: ['session_type', 'duration_bucket', 'device_type'],
  registers: [register]
});

const userActions = new client.Counter({
  name: 'user_actions_total',
  help: 'Total number of user actions',
  labelNames: ['action_type', 'feature', 'success'],
  registers: [register]
});

const featureUsage = new client.Counter({
  name: 'feature_usage_total',
  help: 'Total number of feature usage events',
  labelNames: ['feature_name', 'user_type', 'usage_context'],
  registers: [register]
});

const revenue = new client.Counter({
  name: 'revenue_total',
  help: 'Total revenue in USD',
  labelNames: ['revenue_type', 'payment_method', 'currency'],
  registers: [register]
});

const subscriptionUpgrades = new client.Counter({
  name: 'subscription_upgrades_total',
  help: 'Total number of subscription upgrades',
  labelNames: ['from_plan', 'to_plan', 'upgrade_reason'],
  registers: [register]
});

const customerSatisfaction = new client.Gauge({
  name: 'customer_satisfaction_score',
  help: 'Customer satisfaction score (1-5)',
  labelNames: ['survey_type', 'user_segment'],
  registers: [register]
});

const userRetention = new client.Counter({
  name: 'user_retention_total',
  help: 'Total number of user retention events',
  labelNames: ['retention_period', 'user_type', 'retention_type'],
  registers: [register]
});

const funnelVisitors = new client.Counter({
  name: 'funnel_visitors_total',
  help: 'Total number of funnel visitors',
  labelNames: ['funnel_stage', 'traffic_source'],
  registers: [register]
});

const funnelSignups = new client.Counter({
  name: 'funnel_signups_total',
  help: 'Total number of funnel signups',
  labelNames: ['signup_method', 'user_type'],
  registers: [register]
});

const funnelActiveUsers = new client.Counter({
  name: 'funnel_active_users_total',
  help: 'Total number of funnel active users',
  labelNames: ['activation_method', 'user_type'],
  registers: [register]
});

const funnelPayingUsers = new client.Counter({
  name: 'funnel_paying_users_total',
  help: 'Total number of funnel paying users',
  labelNames: ['payment_plan', 'user_type'],
  registers: [register]
});

const authFailedLogins = new client.Counter({
  name: 'auth_failed_logins_total',
  help: 'Total number of failed login attempts',
  labelNames: ['failure_reason', 'ip_country', 'user_agent'],
  registers: [register]
});

const suspiciousRequests = new client.Counter({
  name: 'suspicious_requests_total',
  help: 'Total number of suspicious requests',
  labelNames: ['request_type', 'risk_level', 'source_ip'],
  registers: [register]
});

const analyticsErrors = new client.Counter({
  name: 'analytics_errors_total',
  help: 'Total number of analytics errors',
  labelNames: ['error_type', 'component', 'severity'],
  registers: [register]
});

// Database connections
let redisClient;
let postgresPool;
let rabbitmqConnection;
let kafkaProducer;

// Initialize connections
async function initializeConnections() {
  try {
    // Redis connection
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD
    });
    await redisClient.connect();

    // PostgreSQL connection
    postgresPool = new Pool({
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DATABASE || 'writewave_analytics'
    });

    // RabbitMQ connection
    rabbitmqConnection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');

    // Kafka producer
    const kafkaClient = kafka.kafka({
      clientId: 'business-metrics-collector',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
    });
    kafkaProducer = kafkaClient.producer();

    logger.info('All connections initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize connections', { error: error.message });
    throw error;
  }
}

// Event handlers
async function handleUserRegistration(event) {
  try {
    const { userId, source, country, deviceType } = event;
    
    // Increment counter
    userRegistrations.inc({ source, country, device_type: deviceType });
    
    // Store in Redis for real-time tracking
    await redisClient.hIncrBy('user_registrations', 'total', 1);
    await redisClient.hIncrBy(`user_registrations:${source}`, 'count', 1);
    
    // Store in PostgreSQL for historical analysis
    await postgresPool.query(
      'INSERT INTO user_registrations (user_id, source, country, device_type, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [userId, source, country, deviceType]
    );
    
    // Publish to message queue
    const channel = await rabbitmqConnection.createChannel();
    await channel.publish('writewave.events', 'user.registration', Buffer.from(JSON.stringify(event)));
    await channel.close();
    
    logger.info('User registration event processed', { userId, source, country, deviceType });
  } catch (error) {
    logger.error('Failed to process user registration event', { error: error.message, event });
  }
}

async function handleContentCreation(event) {
  try {
    const { contentId, contentType, userId, category } = event;
    
    // Increment counter
    contentCreations.inc({ content_type: contentType, user_type: 'premium', category });
    
    // Store in Redis
    await redisClient.hIncrBy('content_creations', 'total', 1);
    await redisClient.hIncrBy(`content_creations:${contentType}`, 'count', 1);
    
    // Store in PostgreSQL
    await postgresPool.query(
      'INSERT INTO content_creations (content_id, content_type, user_id, category, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [contentId, contentType, userId, category]
    );
    
    logger.info('Content creation event processed', { contentId, contentType, userId, category });
  } catch (error) {
    logger.error('Failed to process content creation event', { error: error.message, event });
  }
}

async function handleProgressUpdate(event) {
  try {
    const { userId, updateType, difficultyLevel, completionStatus } = event;
    
    // Increment counter
    progressUpdates.inc({ update_type: updateType, difficulty_level: difficultyLevel, completion_status: completionStatus });
    
    // Store in Redis
    await redisClient.hIncrBy('progress_updates', 'total', 1);
    await redisClient.hIncrBy(`progress_updates:${updateType}`, 'count', 1);
    
    // Store in PostgreSQL
    await postgresPool.query(
      'INSERT INTO progress_updates (user_id, update_type, difficulty_level, completion_status, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [userId, updateType, difficultyLevel, completionStatus]
    );
    
    logger.info('Progress update event processed', { userId, updateType, difficultyLevel, completionStatus });
  } catch (error) {
    logger.error('Failed to process progress update event', { error: error.message, event });
  }
}

async function handleCommunityInteraction(event) {
  try {
    const { interactionId, interactionType, contentType, userId } = event;
    
    // Increment counter
    communityInteractions.inc({ interaction_type: interactionType, content_type: contentType, user_type: 'active' });
    
    // Store in Redis
    await redisClient.hIncrBy('community_interactions', 'total', 1);
    await redisClient.hIncrBy(`community_interactions:${interactionType}`, 'count', 1);
    
    // Store in PostgreSQL
    await postgresPool.query(
      'INSERT INTO community_interactions (interaction_id, interaction_type, content_type, user_id, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [interactionId, interactionType, contentType, userId]
    );
    
    logger.info('Community interaction event processed', { interactionId, interactionType, contentType, userId });
  } catch (error) {
    logger.error('Failed to process community interaction event', { error: error.message, event });
  }
}

async function handleNotificationDelivery(event) {
  try {
    const { notificationId, notificationType, deliveryMethod, status, userId } = event;
    
    // Increment counter
    notificationDeliveries.inc({ notification_type: notificationType, delivery_method: deliveryMethod, status });
    
    // Store in Redis
    await redisClient.hIncrBy('notification_deliveries', 'total', 1);
    await redisClient.hIncrBy(`notification_deliveries:${status}`, 'count', 1);
    
    // Store in PostgreSQL
    await postgresPool.query(
      'INSERT INTO notification_deliveries (notification_id, notification_type, delivery_method, status, user_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [notificationId, notificationType, deliveryMethod, status, userId]
    );
    
    logger.info('Notification delivery event processed', { notificationId, notificationType, deliveryMethod, status, userId });
  } catch (error) {
    logger.error('Failed to process notification delivery event', { error: error.message, event });
  }
}

async function handleAnalyticsEvent(event) {
  try {
    const { eventId, eventType, source, userSegment } = event;
    
    // Increment counter
    analyticsEvents.inc({ event_type: eventType, source, user_segment: userSegment });
    
    // Store in Redis
    await redisClient.hIncrBy('analytics_events', 'total', 1);
    await redisClient.hIncrBy(`analytics_events:${eventType}`, 'count', 1);
    
    // Store in PostgreSQL
    await postgresPool.query(
      'INSERT INTO analytics_events (event_id, event_type, source, user_segment, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [eventId, eventType, source, userSegment]
    );
    
    logger.info('Analytics event processed', { eventId, eventType, source, userSegment });
  } catch (error) {
    logger.error('Failed to process analytics event', { error: error.message, event });
    analyticsErrors.inc({ error_type: 'processing_error', component: 'metrics_collector', severity: 'warning' });
  }
}

// Express routes
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connections: {
      redis: redisClient?.isReady || false,
      postgres: postgresPool ? 'connected' : 'disconnected',
      rabbitmq: rabbitmqConnection ? 'connected' : 'disconnected',
      kafka: kafkaProducer ? 'connected' : 'disconnected'
    }
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Failed to get metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Event ingestion endpoints
app.post('/events/user-registration', async (req, res) => {
  try {
    await handleUserRegistration(req.body);
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Failed to handle user registration event', { error: error.message });
    res.status(500).json({ error: 'Failed to process event' });
  }
});

app.post('/events/content-creation', async (req, res) => {
  try {
    await handleContentCreation(req.body);
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Failed to handle content creation event', { error: error.message });
    res.status(500).json({ error: 'Failed to process event' });
  }
});

app.post('/events/progress-update', async (req, res) => {
  try {
    await handleProgressUpdate(req.body);
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Failed to handle progress update event', { error: error.message });
    res.status(500).json({ error: 'Failed to process event' });
  }
});

app.post('/events/community-interaction', async (req, res) => {
  try {
    await handleCommunityInteraction(req.body);
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Failed to handle community interaction event', { error: error.message });
    res.status(500).json({ error: 'Failed to process event' });
  }
});

app.post('/events/notification-delivery', async (req, res) => {
  try {
    await handleNotificationDelivery(req.body);
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Failed to handle notification delivery event', { error: error.message });
    res.status(500).json({ error: 'Failed to process event' });
  }
});

app.post('/events/analytics', async (req, res) => {
  try {
    await handleAnalyticsEvent(req.body);
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Failed to handle analytics event', { error: error.message });
    res.status(500).json({ error: 'Failed to process event' });
  }
});

// Business metrics endpoints
app.get('/metrics/business', async (req, res) => {
  try {
    const metrics = {
      userRegistrations: await redisClient.hGetAll('user_registrations'),
      contentCreations: await redisClient.hGetAll('content_creations'),
      progressUpdates: await redisClient.hGetAll('progress_updates'),
      communityInteractions: await redisClient.hGetAll('community_interactions'),
      notificationDeliveries: await redisClient.hGetAll('notification_deliveries'),
      analyticsEvents: await redisClient.hGetAll('analytics_events')
    };
    
    res.json(metrics);
  } catch (error) {
    logger.error('Failed to get business metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get business metrics' });
  }
});

// Initialize and start server
async function startServer() {
  try {
    await initializeConnections();
    
    app.listen(port, () => {
      logger.info(`Business metrics collector running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  
  if (redisClient) await redisClient.quit();
  if (postgresPool) await postgresPool.end();
  if (rabbitmqConnection) await rabbitmqConnection.close();
  if (kafkaProducer) await kafkaProducer.disconnect();
  
  process.exit(0);
});

startServer();

module.exports = app;
