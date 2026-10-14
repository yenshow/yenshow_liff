import { cachedFetch } from "@/utils/apiCache";
import { publicHttp, unwrapResult } from "./http";

export const listNews = async (params = {}) => {
	const merged = {
		limit: 10,
		page: 1,
		sort: "createdAt",
		sortDirection: "desc",
		...params
	};
	return cachedFetch(`news:list:${JSON.stringify(merged)}`, async () => {
		const { data } = await publicHttp.get("/api/news", { params: merged });
		const result = unwrapResult(data);
		return result?.news || result?.items || (Array.isArray(result) ? result : []);
	});
};

export const getNewsBySlug = async (slug) => {
	const { data } = await publicHttp.get(`/api/news/${encodeURIComponent(slug)}`);
	const result = unwrapResult(data);
	return result?.news || result;
};
