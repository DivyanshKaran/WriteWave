// @ts-ignore - kafkajs types may not be available
import { Kafka, logLevel, Producer, Consumer, Admin } from 'kafkajs';

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const clientId = process.env.KAFKA_CLIENT_ID || process.env.SERVICE_NAME || 'writewave-service';

let kafkaSingleton: Kafka | null = null;
let producerSingleton: Producer | null = null;
let adminSingleton: Admin | null = null;

export function getKafka(): Kafka {
  if (!kafkaSingleton) {
    kafkaSingleton = new Kafka({
      clientId,
      brokers,
      logLevel: logLevel.NOTHING,
      retry: {
        initialRetryTime: 300,
        retries: 8,
      },
      ssl: process.env.KAFKA_SSL === 'true' ? ({} as any) : undefined,
      sasl: process.env.KAFKA_SASL_MECHANISM
        ? {
            mechanism: process.env.KAFKA_SASL_MECHANISM as any,
            username: process.env.KAFKA_SASL_USERNAME || '',
            password: process.env.KAFKA_SASL_PASSWORD || '',
          }
        : undefined,
    });
  }
  return kafkaSingleton;
}

export async function getProducer(): Promise<Producer> {
  if (!producerSingleton) {
    producerSingleton = getKafka().producer({ allowAutoTopicCreation: true });
    await producerSingleton.connect();
  }
  return producerSingleton;
}

export async function getAdmin(): Promise<Admin> {
  if (!adminSingleton) {
    adminSingleton = getKafka().admin();
    await adminSingleton.connect();
  }
  return adminSingleton;
}

export async function createConsumer(groupId: string): Promise<Consumer> {
  const consumer = getKafka().consumer({ groupId });
  await consumer.connect();
  return consumer;
}

export async function disconnectKafka(): Promise<void> {
  try {
    if (producerSingleton) await producerSingleton.disconnect();
  } catch {}
  try {
    if (adminSingleton) await adminSingleton.disconnect();
  } catch {}
}

export const Topics = {
  USER_EVENTS: 'user.events',
  CONTENT_EVENTS: 'content.events',
  ARTICLES_EVENTS: 'articles.events',
  COMMUNITY_EVENTS: 'community.events',
  PROGRESS_EVENTS: 'progress.events',
  NOTIFICATION_EVENTS: 'notification.events',
  ANALYTICS_EVENTS: 'analytics.events',
};

export type UserCreatedEvent = {
  type: 'user.created';
  id: string;
  email: string;
  username?: string;
  occurredAt: string;
};

export type UserUpdatedEvent = {
  type: 'user.updated';
  id: string;
  changes: Record<string, any>;
  occurredAt: string;
};

export async function publish(topic: string, key: string, value: object): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic,
    messages: [
      {
        key,
        value: JSON.stringify(value),
        headers: {
          'x-trace-id': (Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 24),
          'content-type': 'application/json',
        },
      },
    ],
  });
}

export async function getConsumerLag(groupId: string, topic: string): Promise<any> {
  const admin = await getAdmin();
  const topicOffsets = await admin.fetchTopicOffsets(topic);
  const groupOffsets = await admin.fetchOffsets({ groupId, topics: [topic] });
  const partitions = topicOffsets.map((p: any) => p.partition);
  const report = partitions.map((partition: number) => {
    const topicOffset = topicOffsets.find((p: any) => p.partition === partition);
    // fetchOffsets returns { topic: string, partitions: FetchOffsetsPartition[] }
    const groupOffsetData = Array.isArray(groupOffsets) ? groupOffsets.find((g: any) => g.topic === topic) : (groupOffsets as any);
    const partitionOffset = groupOffsetData?.partitions?.find((p: any) => p.partition === partition);
    const end = Number(topicOffset?.offset || 0);
    const committed = Number(partitionOffset?.offset || 0);
    const lag = Math.max(0, end - committed);
    return { partition, end, committed, lag };
  });
  const totalLag = report.reduce((a: any, b: any) => a + b.lag, 0);
  return { groupId, topic, totalLag, partitions: report };
}


