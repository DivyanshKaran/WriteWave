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
export declare const softDelete: (model: string, id: string) => Promise<void>;
export declare const restoreSoftDelete: (model: string, id: string) => Promise<void>;
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
export declare const cleanupExpiredRecords: () => Promise<void>;
export declare const getDatabaseStats: () => Promise<{
    users: number;
    activeUsers: number;
    verifiedUsers: number;
    sessions: number;
    activeSessions: number;
}>;
//# sourceMappingURL=database.d.ts.map