type UserProfile = {
	id: string;
	email: string;
	username?: string;
	displayName?: string;
	avatarUrl?: string;
	roles?: string[];
};

const DEFAULT_TTL_MS = parseInt(process.env.PROFILE_CACHE_TTL_MS || '300000');

type CacheEntry<T> = {
	value: T;
	expiresAt: number;
	refreshing: boolean;
};

class TTLCache<K, V> {
	private store = new Map<K, CacheEntry<V>>();

	get(key: K): V | undefined {
		const entry = this.store.get(key);
		if (!entry) return undefined;
		if (Date.now() > entry.expiresAt) return undefined;
		return entry.value;
	}

	set(key: K, value: V, ttlMs: number): void {
		this.store.set(key, {
			value,
			expiresAt: Date.now() + ttlMs,
			refreshing: false,
		});
	}

	markRefreshing(key: K): boolean {
		const entry = this.store.get(key);
		if (!entry) return false;
		if (entry.refreshing) return false;
		entry.refreshing = true;
		return true;
	}

	finishRefreshing(key: K, value?: V, ttlMs: number = DEFAULT_TTL_MS): void {
		const entry = this.store.get(key);
		if (!entry) return;
		entry.refreshing = false;
		if (value) {
			entry.value = value;
			entry.expiresAt = Date.now() + ttlMs;
		}
	}
}

const cache = new TTLCache<string, UserProfile>();

export async function getUserProfileCached(
	cacheKey: string,
	fetcher: () => Promise<UserProfile>,
	opts: { ttlMs?: number; backgroundRefresh?: boolean } = {}
): Promise<UserProfile> {
	const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;
	const backgroundRefresh = opts.backgroundRefresh ?? true;

	const current = cache.get(cacheKey);
	if (current) {
		// Schedule background refresh if near expiry
		if (backgroundRefresh && cache.markRefreshing(cacheKey)) {
			setTimeout(async () => {
				try {
					const fresh = await fetcher();
					cache.finishRefreshing(cacheKey, fresh, ttlMs);
				} catch {
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
