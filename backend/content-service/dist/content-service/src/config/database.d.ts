import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<{
    log: ({
        emit: "event";
        level: "query";
    } | {
        emit: "event";
        level: "error";
    } | {
        emit: "event";
        level: "info";
    } | {
        emit: "event";
        level: "warn";
    })[];
}, "error" | "warn" | "info" | "query", import("@prisma/client/runtime/library").DefaultArgs>;
export declare const connectDatabase: () => Promise<void>;
export declare const disconnectDatabase: () => Promise<void>;
export declare const checkDatabaseHealth: () => Promise<{
    status: "connected" | "disconnected";
    responseTime?: number;
}>;
export declare const withTransaction: <T>(callback: (tx: PrismaClient) => Promise<T>) => Promise<T>;
export declare const paginate: <T>(model: any, page?: number, limit?: number, where?: any, orderBy?: any) => Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}>;
export declare const search: <T>(model: any, searchTerm: string, searchFields: string[], page?: number, limit?: number, orderBy?: any) => Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}>;
export declare const searchCharacters: (searchTerm: string, filters?: {
    type?: string;
    jlptLevel?: string;
    difficultyLevel?: string;
}, page?: number, limit?: number) => Promise<{
    data: ({
        mediaAssets: {
            id: string;
            type: import(".prisma/client").$Enums.MediaType;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            filename: string;
            originalName: string;
            mimeType: string;
            size: number;
            url: string;
            thumbnailUrl: string | null;
            altText: string | null;
            description: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            characterId: string | null;
            vocabularyWordId: string | null;
            lessonId: string | null;
        }[];
        characterRelations: ({
            relatedCharacter: {
                character: string;
                id: string;
                type: import(".prisma/client").$Enums.CharacterType;
                jlptLevel: import(".prisma/client").$Enums.JLPTLevel | null;
                difficultyLevel: import(".prisma/client").$Enums.DifficultyLevel;
                meaning: string | null;
                pronunciation: string | null;
                romanization: string | null;
                strokeCount: number | null;
                strokeOrder: import("@prisma/client/runtime/library").JsonValue | null;
                strokePatterns: import("@prisma/client/runtime/library").JsonValue | null;
                kunyomi: string[];
                onyomi: string[];
                radical: string | null;
                radicalMeaning: string | null;
                examples: import("@prisma/client/runtime/library").JsonValue | null;
                usageNotes: string | null;
                learningOrder: number | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            characterId: string;
            relatedCharacterId: string;
            relationType: string;
        })[];
    } & {
        character: string;
        id: string;
        type: import(".prisma/client").$Enums.CharacterType;
        jlptLevel: import(".prisma/client").$Enums.JLPTLevel | null;
        difficultyLevel: import(".prisma/client").$Enums.DifficultyLevel;
        meaning: string | null;
        pronunciation: string | null;
        romanization: string | null;
        strokeCount: number | null;
        strokeOrder: import("@prisma/client/runtime/library").JsonValue | null;
        strokePatterns: import("@prisma/client/runtime/library").JsonValue | null;
        kunyomi: string[];
        onyomi: string[];
        radical: string | null;
        radicalMeaning: string | null;
        examples: import("@prisma/client/runtime/library").JsonValue | null;
        usageNotes: string | null;
        learningOrder: number | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}>;
export declare const searchVocabulary: (searchTerm: string, filters?: {
    category?: string;
    jlptLevel?: string;
    difficultyLevel?: string;
}, page?: number, limit?: number) => Promise<{
    data: ({
        mediaAssets: {
            id: string;
            type: import(".prisma/client").$Enums.MediaType;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            filename: string;
            originalName: string;
            mimeType: string;
            size: number;
            url: string;
            thumbnailUrl: string | null;
            altText: string | null;
            description: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            characterId: string | null;
            vocabularyWordId: string | null;
            lessonId: string | null;
        }[];
        characters: {
            character: string;
            id: string;
            type: import(".prisma/client").$Enums.CharacterType;
            jlptLevel: import(".prisma/client").$Enums.JLPTLevel | null;
            difficultyLevel: import(".prisma/client").$Enums.DifficultyLevel;
            meaning: string | null;
            pronunciation: string | null;
            romanization: string | null;
            strokeCount: number | null;
            strokeOrder: import("@prisma/client/runtime/library").JsonValue | null;
            strokePatterns: import("@prisma/client/runtime/library").JsonValue | null;
            kunyomi: string[];
            onyomi: string[];
            radical: string | null;
            radicalMeaning: string | null;
            examples: import("@prisma/client/runtime/library").JsonValue | null;
            usageNotes: string | null;
            learningOrder: number | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        jlptLevel: import(".prisma/client").$Enums.JLPTLevel | null;
        difficultyLevel: import(".prisma/client").$Enums.DifficultyLevel;
        pronunciation: string | null;
        romanization: string | null;
        usageNotes: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        japanese: string;
        english: string;
        category: import(".prisma/client").$Enums.VocabularyCategory;
        partOfSpeech: string | null;
        audioUrl: string | null;
        exampleSentences: import("@prisma/client/runtime/library").JsonValue | null;
        culturalNotes: string | null;
        frequency: number | null;
    })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}>;
export declare const getContentStatistics: () => Promise<{
    characters: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.CharacterGroupByOutputType, ("type" | "jlptLevel" | "difficultyLevel")[]> & {
        _count: {
            id: number;
        };
    })[];
    vocabulary: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.VocabularyWordGroupByOutputType, ("jlptLevel" | "difficultyLevel" | "category")[]> & {
        _count: {
            id: number;
        };
    })[];
    lessons: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.LessonGroupByOutputType, ("type" | "jlptLevel" | "difficultyLevel")[]> & {
        _count: {
            id: number;
        };
    })[];
    media: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.MediaAssetGroupByOutputType, "type"[]> & {
        _count: {
            id: number;
        };
        _sum: {
            size: number;
        };
    })[];
}>;
export declare const cleanupExpiredData: () => Promise<void>;
export declare const optimizeDatabase: () => Promise<void>;
//# sourceMappingURL=database.d.ts.map