"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topics = void 0;
exports.getKafka = getKafka;
exports.getProducer = getProducer;
exports.getAdmin = getAdmin;
exports.createConsumer = createConsumer;
exports.disconnectKafka = disconnectKafka;
exports.publish = publish;
exports.getConsumerLag = getConsumerLag;
const kafkajs_1 = require("kafkajs");
const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const clientId = process.env.KAFKA_CLIENT_ID || process.env.SERVICE_NAME || 'writewave-service';
let kafkaSingleton = null;
let producerSingleton = null;
let adminSingleton = null;
function getKafka() {
    if (!kafkaSingleton) {
        kafkaSingleton = new kafkajs_1.Kafka({
            clientId,
            brokers,
            logLevel: kafkajs_1.logLevel.NOTHING,
            retry: {
                initialRetryTime: 300,
                retries: 8,
            },
            ssl: process.env.KAFKA_SSL === 'true' ? {} : undefined,
            sasl: process.env.KAFKA_SASL_MECHANISM
                ? {
                    mechanism: process.env.KAFKA_SASL_MECHANISM,
                    username: process.env.KAFKA_SASL_USERNAME || '',
                    password: process.env.KAFKA_SASL_PASSWORD || '',
                }
                : undefined,
        });
    }
    return kafkaSingleton;
}
async function getProducer() {
    if (!producerSingleton) {
        producerSingleton = getKafka().producer({ allowAutoTopicCreation: true });
        await producerSingleton.connect();
    }
    return producerSingleton;
}
async function getAdmin() {
    if (!adminSingleton) {
        adminSingleton = getKafka().admin();
        await adminSingleton.connect();
    }
    return adminSingleton;
}
async function createConsumer(groupId) {
    const consumer = getKafka().consumer({ groupId });
    await consumer.connect();
    return consumer;
}
async function disconnectKafka() {
    try {
        if (producerSingleton)
            await producerSingleton.disconnect();
    }
    catch { }
    try {
        if (adminSingleton)
            await adminSingleton.disconnect();
    }
    catch { }
}
exports.Topics = {
    USER_EVENTS: 'user.events',
    CONTENT_EVENTS: 'content.events',
    ARTICLES_EVENTS: 'articles.events',
    COMMUNITY_EVENTS: 'community.events',
    PROGRESS_EVENTS: 'progress.events',
    NOTIFICATION_EVENTS: 'notification.events',
    ANALYTICS_EVENTS: 'analytics.events',
};
async function publish(topic, key, value) {
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
async function getConsumerLag(groupId, topic) {
    const admin = await getAdmin();
    const topicOffsets = await admin.fetchTopicOffsets(topic);
    const groupOffsets = await admin.fetchOffsets({ groupId, topics: [topic] });
    const partitions = topicOffsets.map((p) => p.partition);
    const report = partitions.map((partition) => {
        const topicOffset = topicOffsets.find((p) => p.partition === partition);
        const groupOffsetData = Array.isArray(groupOffsets) ? groupOffsets.find((g) => g.topic === topic) : groupOffsets;
        const partitionOffset = groupOffsetData?.partitions?.find((p) => p.partition === partition);
        const end = Number(topicOffset?.offset || 0);
        const committed = Number(partitionOffset?.offset || 0);
        const lag = Math.max(0, end - committed);
        return { partition, end, committed, lag };
    });
    const totalLag = report.reduce((a, b) => a + b.lag, 0);
    return { groupId, topic, totalLag, partitions: report };
}
//# sourceMappingURL=kafka.js.map