type UserProfile = {
    id: string;
    email: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    roles?: string[];
};
export declare function getUserProfileCached(cacheKey: string, fetcher: () => Promise<UserProfile>, opts?: {
    ttlMs?: number;
    backgroundRefresh?: boolean;
}): Promise<UserProfile>;
export {};
//# sourceMappingURL=profile-cache.d.ts.map