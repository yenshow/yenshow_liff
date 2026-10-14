import axios from "axios";
import { useLiff } from "@/composables/useLiff";

const trimSlash = (value) => String(value || "").replace(/\/$/, "");
const isLoopback = (hostname) =>
	hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

/**
 * API 根網址。
 * - 正式／build：用 VITE_API_BASE_URL（如 https://api.yenshow.com）
 * - npm run dev + 區網 IP 開頁：若設定為 localhost，改打目前頁面 host:port
 */
export const apiBase = () => {
	const configured = trimSlash(import.meta.env.VITE_API_BASE_URL);
	if (!configured || !import.meta.env.DEV || typeof window === "undefined") return configured;

	try {
		const conf = new URL(configured);
		const pageHost = window.location.hostname;
		if (!isLoopback(conf.hostname) || !pageHost || isLoopback(pageHost)) return configured;
		conf.hostname = pageHost;
		return trimSlash(conf.origin);
	} catch {
		return configured;
	}
};

/** 相對路徑補上 apiBase；絕對網址若為 localhost 則改寫到目前 apiBase */
export const resolveApiUrl = (pathOrUrl) => {
	if (!pathOrUrl) return "";
	const raw = String(pathOrUrl);
	const base = apiBase();

	if (/^https?:\/\//i.test(raw)) {
		try {
			const url = new URL(raw);
			if (!isLoopback(url.hostname) || !base) return raw;
			const b = new URL(base);
			url.protocol = b.protocol;
			url.host = b.host;
			return url.href;
		} catch {
			return raw;
		}
	}

	const path = raw.startsWith("/") ? raw : `/${raw}`;
	return base ? `${base}${path}` : path;
};

const attachBase = (config) => {
	config.baseURL = apiBase();
	return config;
};

export const publicHttp = axios.create();
publicHttp.interceptors.request.use(attachBase);

export const hubHttp = axios.create();
hubHttp.interceptors.request.use(async (config) => {
	attachBase(config);
	const { getIdToken } = useLiff();
	const idToken = await getIdToken();
	if (idToken) config.headers.Authorization = `Bearer ${idToken}`;

	const mockLineUserId = import.meta.env.VITE_MOCK_LINE_USER_ID;
	if (mockLineUserId) config.headers["X-Line-User-Id"] = mockLineUserId;

	return config;
});

export const unwrapResult = (data) => data?.result ?? data?.data ?? data;
