import { AppConfig } from '../types';
export declare const config: AppConfig;
export declare const isDevelopment: boolean;
export declare const isProduction: boolean;
export declare const isTest: boolean;
export declare const securityConfig: {
    password: {
        minLength: number;
        maxLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
    };
    username: {
        minLength: number;
        maxLength: number;
        allowedChars: RegExp;
    };
    email: {
        maxLength: number;
        pattern: RegExp;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        skipSuccessfulRequests: boolean;
        skipFailedRequests: boolean;
    };
    session: {
        secure: boolean;
        httpOnly: boolean;
        sameSite: "strict";
        maxAge: number;
    };
    cors: {
        origin: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    };
    jwt: {
        algorithm: "HS256";
        issuer: string;
        audience: string;
    };
    oauth: {
        stateLength: number;
        codeVerifierLength: number;
        codeChallengeMethod: "S256";
    };
    fileUpload: {
        maxSize: number;
        allowedTypes: string[];
        scanForMalware: boolean;
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
    userRegistration: {
        email: {
            required: boolean;
            type: string;
            pattern: RegExp;
            maxLength: number;
        };
        password: {
            required: boolean;
            type: string;
            minLength: number;
            maxLength: number;
        };
        firstName: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        lastName: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        username: {
            required: boolean;
            type: string;
            minLength: number;
            maxLength: number;
            pattern: RegExp;
        };
    };
    userLogin: {
        email: {
            required: boolean;
            type: string;
            pattern: RegExp;
        };
        password: {
            required: boolean;
            type: string;
        };
    };
    passwordReset: {
        email: {
            required: boolean;
            type: string;
            pattern: RegExp;
        };
    };
    passwordResetConfirm: {
        token: {
            required: boolean;
            type: string;
            minLength: number;
        };
        newPassword: {
            required: boolean;
            type: string;
            minLength: number;
            maxLength: number;
        };
    };
    emailVerification: {
        token: {
            required: boolean;
            type: string;
            minLength: number;
        };
    };
    refreshToken: {
        refreshToken: {
            required: boolean;
            type: string;
            minLength: number;
        };
    };
    userProfileUpdate: {
        firstName: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        lastName: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        bio: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        dateOfBirth: {
            required: boolean;
            type: string;
        };
        country: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        timezone: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        language: {
            required: boolean;
            type: string;
            maxLength: number;
        };
        learningGoals: {
            required: boolean;
            type: string;
            items: {
                type: string;
                maxLength: number;
            };
        };
        difficultyLevel: {
            required: boolean;
            type: string;
            enum: string[];
        };
        studyTime: {
            required: boolean;
            type: string;
            min: number;
            max: number;
        };
        interests: {
            required: boolean;
            type: string;
            items: {
                type: string;
                maxLength: number;
            };
        };
    };
    userSettingsUpdate: {
        emailNotifications: {
            required: boolean;
            type: string;
        };
        pushNotifications: {
            required: boolean;
            type: string;
        };
        dailyReminders: {
            required: boolean;
            type: string;
        };
        weeklyReports: {
            required: boolean;
            type: string;
        };
        achievementAlerts: {
            required: boolean;
            type: string;
        };
        profileVisibility: {
            required: boolean;
            type: string;
            enum: string[];
        };
        showProgress: {
            required: boolean;
            type: string;
        };
        showAchievements: {
            required: boolean;
            type: string;
        };
        autoAdvance: {
            required: boolean;
            type: string;
        };
        showHints: {
            required: boolean;
            type: string;
        };
        soundEnabled: {
            required: boolean;
            type: string;
        };
        vibrationEnabled: {
            required: boolean;
            type: string;
        };
        theme: {
            required: boolean;
            type: string;
            enum: string[];
        };
        fontSize: {
            required: boolean;
            type: string;
            enum: string[];
        };
        animations: {
            required: boolean;
            type: string;
        };
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map