import { AppConfig } from '../types';
export declare const config: AppConfig;
export declare const isDevelopment: boolean;
export declare const isProduction: boolean;
export declare const isTest: boolean;
export declare const contentConfig: {
    characterCounts: {
        hiragana: number;
        katakana: number;
    };
    jlptLevels: string[];
    vocabularyCategories: string[];
    lessonTypes: string[];
    difficultyLevels: string[];
    mediaTypes: string[];
};
export declare const securityConfig: {
    fileUpload: {
        maxSize: number;
        allowedTypes: {
            images: string[];
            audio: string[];
            video: string[];
        };
        scanForMalware: boolean;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        skipSuccessfulRequests: boolean;
        skipFailedRequests: boolean;
    };
    cors: {
        origin: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    };
    database: {
        connectionLimit: number;
        acquireTimeoutMillis: number;
        timeout: number;
        ssl: boolean;
    };
    redis: {
        retryDelayOnFailover: number;
        maxRetriesPerRequest: number;
        lazyConnect: boolean;
        keepAlive: number;
    };
};
export declare const validationSchemas: {
    character: {
        character: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        type: {
            required: boolean;
            type: string;
            enum: string[];
        };
        jlptLevel: {
            required: boolean;
            type: string;
            enum: string[];
        };
        difficultyLevel: {
            required: boolean;
            type: string;
            enum: string[];
        };
        meaning: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        pronunciation: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        romanization: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        strokeCount: {
            required: boolean;
            type: string;
            min: number;
            max: number;
        };
    };
    vocabulary: {
        japanese: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        english: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        category: {
            required: boolean;
            type: string;
            enum: string[];
        };
        jlptLevel: {
            required: boolean;
            type: string;
            enum: string[];
        };
        difficultyLevel: {
            required: boolean;
            type: string;
            enum: string[];
        };
        partOfSpeech: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        pronunciation: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        frequency: {
            required: boolean;
            type: string;
            min: number;
            max: number;
        };
    };
    lesson: {
        title: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        description: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        type: {
            required: boolean;
            type: string;
            enum: string[];
        };
        jlptLevel: {
            required: boolean;
            type: string;
            enum: string[];
        };
        difficultyLevel: {
            required: boolean;
            type: string;
            enum: string[];
        };
        estimatedTime: {
            required: boolean;
            type: string;
            min: number;
            max: number;
        };
        learningOrder: {
            required: boolean;
            type: string;
            min: number;
            max: number;
        };
    };
    media: {
        filename: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        originalName: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        mimeType: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        size: {
            required: boolean;
            type: string;
            min: number;
            max: number;
        };
        type: {
            required: boolean;
            type: string;
            enum: string[];
        };
        altText: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        description: {
            required: boolean;
            type: string;
            maxLength: number;
        };
    };
    search: {
        query: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        type: {
            required: boolean;
            type: string;
            enum: string[];
        };
        jlptLevel: {
            required: boolean;
            type: string;
            enum: string[];
        };
        difficultyLevel: {
            required: boolean;
            type: string;
            enum: string[];
        };
        category: {
            required: boolean;
            type: string;
            enum: string[];
        };
        page: {
            required: boolean;
            type: string;
            min: number;
            max: number;
        };
        limit: {
            required: boolean;
            type: string;
            min: number;
            max: number;
        };
    };
    pagination: {
        page: {
            required: boolean;
            type: string;
            min: number;
            max: number;
        };
        limit: {
            required: boolean;
            type: string;
            min: number;
            max: number;
        };
        sortBy: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        sortOrder: {
            required: boolean;
            type: string;
            enum: string[];
        };
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map