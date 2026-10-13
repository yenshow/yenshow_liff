import axios from "axios";
import { useLiff } from "@/composables/useLiff";

export const apiBase = () => (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

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
