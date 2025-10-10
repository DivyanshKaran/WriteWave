const express = require('express');
const { createClient } = require('redis');
const { Pool } = require('pg');
const amqp = require('amqplib');
const kafka = require('kafkajs');
const axios = require('axios');
const winston = require('winston');

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
    new winston.transports.File({ filename: 'health-check.log' })
  ]
});

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  timeout: 5000,
  retries: 3,
  interval: 30000,
  services: {
    databases: {
      postgres: {
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DATABASE || 'writewave_users'
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD
      }
    },
    messaging: {
      rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        username: process.env.RABBITMQ_USER || 'guest',
        password: process.env.RABBITMQ_PASSWORD || 'guest'
      },
      kafka: {
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        clientId: 'health-check-client'
      }
    },
    microservices: {
      userService: process.env.USER_SERVICE_URL || 'http://localhost:8001',
      contentService: process.env.CONTENT_SERVICE_URL || 'http://localhost:8002',
      progressService: process.env.PROGRESS_SERVICE_URL || 'http://localhost:8003',
      communityService: process.env.COMMUNITY_SERVICE_URL || 'http://localhost:8004',
      notificationService: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8005',
      analyticsService: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8006'
    },
    external: {
      sendgrid: process.env.SENDGRID_API_KEY ? 'https://api.sendgrid.com/v3/user/profile' : null,
      twilio: process.env.TWILIO_ACCOUNT_SID ? 'https://api.twilio.com/2010-04-01/Accounts' : null
    }
  }
};

// Health check results storage
let healthCheckResults = {
  databases: {},
  messaging: {},
  microservices: {},
  external: {},
  lastCheck: null,
  overallStatus: 'unknown'
};

// Database health checks
async function checkPostgreSQL(config) {
  try {
    const pool = new Pool({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      database: config.database,
      connectionTimeoutMillis: HEALTH_CHECK_CONFIG.timeout,
      idleTimeoutMillis: HEALTH_CHECK_CONFIG.timeout
    });

    const client = await pool.connect();
    const result = await client.query('SELECT 1 as health_check');
    client.release();
    await pool.end();

    return {
      status: 'healthy',
      responseTime: Date.now(),
      details: {
        version: result.rows[0] ? 'connected' : 'unknown',
        connectionCount: pool.totalCount
      }
    };
  } catch (error) {
    logger.error('PostgreSQL health check failed', { error: error.message });
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: Date.now()
    };
  }
}

async function checkRedis(config) {
  try {
    const client = createClient({
      url: config.url,
      password: config.password,
      socket: {
        connectTimeout: HEALTH_CHECK_CONFIG.timeout,
        commandTimeout: HEALTH_CHECK_CONFIG.timeout
      }
    });

    await client.connect();
    const startTime = Date.now();
    await client.ping();
    const responseTime = Date.now() - startTime;
    
    const info = await client.info('server');
    await client.disconnect();

    return {
      status: 'healthy',
      responseTime,
      details: {
        version: info.match(/redis_version:([^\r\n]+)/)?.[1] || 'unknown',
        uptime: info.match(/uptime_in_seconds:([^\r\n]+)/)?.[1] || 'unknown'
      }
    };
  } catch (error) {
    logger.error('Redis health check failed', { error: error.message });
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: Date.now()
    };
  }
}

// Messaging health checks
async function checkRabbitMQ(config) {
  try {
    const connection = await amqp.connect(config.url, {
      timeout: HEALTH_CHECK_CONFIG.timeout
    });
    
    const startTime = Date.now();
    const channel = await connection.createChannel();
    const responseTime = Date.now() - startTime;
    
    await channel.close();
    await connection.close();

    return {
      status: 'healthy',
      responseTime,
      details: {
        protocol: 'AMQP 0-9-1',
        connectionState: 'connected'
      }
    };
  } catch (error) {
    logger.error('RabbitMQ health check failed', { error: error.message });
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: Date.now()
    };
  }
}

async function checkKafka(config) {
  try {
    const kafkaClient = kafka.kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      connectionTimeout: HEALTH_CHECK_CONFIG.timeout,
      requestTimeout: HEALTH_CHECK_CONFIG.timeout
    });

    const admin = kafkaClient.admin();
    const startTime = Date.now();
    await admin.connect();
    const metadata = await admin.describeCluster();
    const responseTime = Date.now() - startTime;
    await admin.disconnect();

    return {
      status: 'healthy',
      responseTime,
      details: {
        clusterId: metadata.clusterId,
        brokerCount: metadata.brokers.length,
        controllerId: metadata.controller
      }
    };
  } catch (error) {
    logger.error('Kafka health check failed', { error: error.message });
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: Date.now()
    };
  }
}

// Microservice health checks
async function checkMicroservice(url, serviceName) {
  try {
    const startTime = Date.now();
    const response = await axios.get(`${url}/health`, {
      timeout: HEALTH_CHECK_CONFIG.timeout,
      headers: {
        'User-Agent': 'WriteWave-Health-Check/1.0'
      }
    });
    const responseTime = Date.now() - startTime;

    return {
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      responseTime,
      details: {
        statusCode: response.status,
        version: response.data.version || 'unknown',
        uptime: response.data.uptime || 'unknown',
        memory: response.data.memory || 'unknown'
      }
    };
  } catch (error) {
    logger.error(`${serviceName} health check failed`, { error: error.message });
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: Date.now()
    };
  }
}

// External service health checks
async function checkExternalService(url, serviceName, headers = {}) {
  try {
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: HEALTH_CHECK_CONFIG.timeout,
      headers: {
        'User-Agent': 'WriteWave-Health-Check/1.0',
        ...headers
      }
    });
    const responseTime = Date.now() - startTime;

    return {
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      responseTime,
      details: {
        statusCode: response.status,
        service: serviceName
      }
    };
  } catch (error) {
    logger.error(`${serviceName} health check failed`, { error: error.message });
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: Date.now()
    };
  }
}

// Perform all health checks
async function performHealthChecks() {
  logger.info('Starting health checks');
  const startTime = Date.now();

  try {
    // Database health checks
    healthCheckResults.databases.postgres = await checkPostgreSQL(HEALTH_CHECK_CONFIG.services.databases.postgres);
    healthCheckResults.databases.redis = await checkRedis(HEALTH_CHECK_CONFIG.services.databases.redis);

    // Messaging health checks
    healthCheckResults.messaging.rabbitmq = await checkRabbitMQ(HEALTH_CHECK_CONFIG.services.messaging.rabbitmq);
    healthCheckResults.messaging.kafka = await checkKafka(HEALTH_CHECK_CONFIG.services.messaging.kafka);

    // Microservice health checks
    const microserviceChecks = await Promise.allSettled([
      checkMicroservice(HEALTH_CHECK_CONFIG.services.microservices.userService, 'user-service'),
      checkMicroservice(HEALTH_CHECK_CONFIG.services.microservices.contentService, 'content-service'),
      checkMicroservice(HEALTH_CHECK_CONFIG.services.microservices.progressService, 'progress-service'),
      checkMicroservice(HEALTH_CHECK_CONFIG.services.microservices.communityService, 'community-service'),
      checkMicroservice(HEALTH_CHECK_CONFIG.services.microservices.notificationService, 'notification-service'),
      checkMicroservice(HEALTH_CHECK_CONFIG.services.microservices.analyticsService, 'analytics-service')
    ]);

    healthCheckResults.microservices = {
      userService: microserviceChecks[0].status === 'fulfilled' ? microserviceChecks[0].value : { status: 'unhealthy', error: microserviceChecks[0].reason?.message },
      contentService: microserviceChecks[1].status === 'fulfilled' ? microserviceChecks[1].value : { status: 'unhealthy', error: microserviceChecks[1].reason?.message },
      progressService: microserviceChecks[2].status === 'fulfilled' ? microserviceChecks[2].value : { status: 'unhealthy', error: microserviceChecks[2].reason?.message },
      communityService: microserviceChecks[3].status === 'fulfilled' ? microserviceChecks[3].value : { status: 'unhealthy', error: microserviceChecks[3].reason?.message },
      notificationService: microserviceChecks[4].status === 'fulfilled' ? microserviceChecks[4].value : { status: 'unhealthy', error: microserviceChecks[4].reason?.message },
      analyticsService: microserviceChecks[5].status === 'fulfilled' ? microserviceChecks[5].value : { status: 'unhealthy', error: microserviceChecks[5].reason?.message }
    };

    // External service health checks
    if (HEALTH_CHECK_CONFIG.services.external.sendgrid) {
      healthCheckResults.external.sendgrid = await checkExternalService(
        HEALTH_CHECK_CONFIG.services.external.sendgrid,
        'sendgrid',
        { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` }
      );
    }

    if (HEALTH_CHECK_CONFIG.services.external.twilio) {
      healthCheckResults.external.twilio = await checkExternalService(
        `${HEALTH_CHECK_CONFIG.services.external.twilio}/${process.env.TWILIO_ACCOUNT_SID}.json`,
        'twilio',
        { 
          Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}` 
        }
      );
    }

    // Calculate overall status
    const allResults = [
      ...Object.values(healthCheckResults.databases),
      ...Object.values(healthCheckResults.messaging),
      ...Object.values(healthCheckResults.microservices),
      ...Object.values(healthCheckResults.external)
    ];

    const unhealthyCount = allResults.filter(result => result.status === 'unhealthy').length;
    const totalCount = allResults.length;

    if (unhealthyCount === 0) {
      healthCheckResults.overallStatus = 'healthy';
    } else if (unhealthyCount <= totalCount * 0.2) {
      healthCheckResults.overallStatus = 'degraded';
    } else {
      healthCheckResults.overallStatus = 'unhealthy';
    }

    healthCheckResults.lastCheck = new Date().toISOString();
    healthCheckResults.checkDuration = Date.now() - startTime;

    logger.info('Health checks completed', {
      overallStatus: healthCheckResults.overallStatus,
      duration: healthCheckResults.checkDuration,
      unhealthyServices: unhealthyCount,
      totalServices: totalCount
    });

  } catch (error) {
    logger.error('Health check process failed', { error: error.message });
    healthCheckResults.overallStatus = 'error';
    healthCheckResults.lastCheck = new Date().toISOString();
    healthCheckResults.checkDuration = Date.now() - startTime;
  }
}

// Express routes
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: healthCheckResults.overallStatus,
    timestamp: healthCheckResults.lastCheck,
    duration: healthCheckResults.checkDuration,
    services: healthCheckResults
  });
});

// Detailed health check endpoint
app.get('/health/detailed', (req, res) => {
  res.json(healthCheckResults);
});

// Individual service health check
app.get('/health/:service', (req, res) => {
  const { service } = req.params;
  const serviceResult = healthCheckResults[service];
  
  if (!serviceResult) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  res.json(serviceResult);
});

// Start health check interval
setInterval(performHealthChecks, HEALTH_CHECK_CONFIG.interval);

// Perform initial health check
performHealthChecks();

// Start server
app.listen(port, () => {
  logger.info(`Health check service running on port ${port}`);
});

module.exports = app;
