import { Kafka, Producer, Consumer, Admin } from 'kafkajs';
export declare function getKafka(): Kafka;
export declare function getProducer(): Promise<Producer>;
export declare function getAdmin(): Promise<Admin>;
export declare function createConsumer(groupId: string): Promise<Consumer>;
export declare function disconnectKafka(): Promise<void>;
export declare const Topics: {
    USER_EVENTS: string;
    CONTENT_EVENTS: string;
    ARTICLES_EVENTS: string;
    COMMUNITY_EVENTS: string;
    PROGRESS_EVENTS: string;
    NOTIFICATION_EVENTS: string;
    ANALYTICS_EVENTS: string;
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
export declare function publish(topic: string, key: string, value: object): Promise<void>;
export declare function getConsumerLag(groupId: string, topic: string): Promise<any>;
//# sourceMappingURL=kafka.d.ts.map