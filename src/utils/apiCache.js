const DEFAULT_TTL_MS = 45_000;
const store = new Map();
const inflight = new Map();

const getFresh = (key) => {
	const entry = store.get(key);
	if (!entry) return undefined;
	if (entry.expiresAt <= Date.now()) {
		store.delete(key);
		return undefined;
	}
	return entry.value;
};

export const cacheInvalidate = (prefixOrKey) => {
	if (!prefixOrKey) {
		store.clear();
		return;
	}
	for (const key of store.keys()) {
		if (key === prefixOrKey || key.startsWith(prefixOrKey)) store.delete(key);
	}
};

/** 新鮮快取直接回傳；同 key 進行中共用同一個 promise */
export const cachedFetch = async (key, fetcher, ttlMs = DEFAULT_TTL_MS) => {
	const hit = getFresh(key);
	if (hit !== undefined) return hit;
	if (inflight.has(key)) return inflight.get(key);

	const promise = Promise.resolve()
		.then(fetcher)
		.then((value) => {
			store.set(key, { value, expiresAt: Date.now() + ttlMs });
			return value;
		})
		.finally(() => inflight.delete(key));

	inflight.set(key, promise);
	return promise;
};
