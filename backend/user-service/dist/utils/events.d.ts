export declare const Topics: {
    USER_EVENTS: string;
    CONTENT_EVENTS: string;
    ARTICLES_EVENTS: string;
    COMMUNITY_EVENTS: string;
    PROGRESS_EVENTS: string;
    NOTIFICATION_EVENTS: string;
    ANALYTICS_EVENTS: string;
};
export declare function publish(topic: string, key: string, value: object): Promise<void>;
export declare function getProducer(): Promise<unknown>;
export declare function disconnectKafka(): Promise<void>;
//# sourceMappingURL=events.d.ts.map