"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topics = void 0;
exports.publish = publish;
exports.getProducer = getProducer;
exports.disconnectKafka = disconnectKafka;
const logger_1 = require("../config/logger");
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
    if (process.env.ENABLE_KAFKA === 'true') {
        logger_1.logger.warn('Kafka not configured in user-service build context; skipping publish', {
            topic,
            key,
            value,
        });
    }
}
async function getProducer() {
    logger_1.logger.warn('Kafka producer not available in user-service build context');
    return {};
}
async function disconnectKafka() {
}
//# sourceMappingURL=events.js.map