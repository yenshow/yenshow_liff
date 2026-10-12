import axios from "axios";

const apiBase = () => import.meta.env.VITE_API_BASE_URL || "";
const fileBase = () => (import.meta.env.VITE_FILE_SERVICE_BASE_URL || apiBase()).replace(/\/$/, "");

const api = axios.create();

api.interceptors.request.use((config) => {
	config.baseURL = apiBase();
	return config;
});

export const useApi = () => {
	const searchProducts = async (q) => {
		const { data } = await api.get("/api/products/search", {
			params: { keyword: q || undefined, limit: 20 }
		});
		const result = data?.result || data;
		return result?.productsList || result?.products || [];
	};

	const buildPublicDocumentUrl = async ({ productId, documentUrl }) => {
		const { data } = await api.get("/api/documents/specifications/public-url", {
			params: { productId, documentUrl }
		});
		const { storagePath, token } = data?.result || {};
		if (!storagePath || !token) throw new Error("無法取得下載連結");
		return `${fileBase()}/storage/${storagePath}?dl=${encodeURIComponent(token)}`;
	};

	return { searchProducts, buildPublicDocumentUrl };
};
