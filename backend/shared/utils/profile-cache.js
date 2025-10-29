"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfileCached = getUserProfileCached;
const DEFAULT_TTL_MS = parseInt(process.env.PROFILE_CACHE_TTL_MS || '300000');
class TTLCache {
    constructor() {
        this.store = new Map();
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return undefined;
        if (Date.now() > entry.expiresAt)
            return undefined;
        return entry.value;
    }
    set(key, value, ttlMs) {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
            refreshing: false,
        });
    }
    markRefreshing(key) {
        const entry = this.store.get(key);
        if (!entry)
            return false;
        if (entry.refreshing)
            return false;
        entry.refreshing = true;
        return true;
    }
    finishRefreshing(key, value, ttlMs = DEFAULT_TTL_MS) {
        const entry = this.store.get(key);
        if (!entry)
            return;
        entry.refreshing = false;
        if (value) {
            entry.value = value;
            entry.expiresAt = Date.now() + ttlMs;
        }
    }
}
const cache = new TTLCache();
async function getUserProfileCached(cacheKey, fetcher, opts = {}) {
    const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;
    const backgroundRefresh = opts.backgroundRefresh ?? true;
    const current = cache.get(cacheKey);
    if (current) {
        if (backgroundRefresh && cache.markRefreshing(cacheKey)) {
            setTimeout(async () => {
                try {
                    const fresh = await fetcher();
                    cache.finishRefreshing(cacheKey, fresh, ttlMs);
                }
                catch {
                    cache.finishRefreshing(cacheKey);
                }
            }, 0);
        }
        return current;
    }
    const fresh = await fetcher();
    cache.set(cacheKey, fresh, ttlMs);
    return fresh;
}
//# sourceMappingURL=profile-cache.js.map