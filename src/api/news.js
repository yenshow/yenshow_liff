import { publicHttp, unwrapResult } from "./http";

export const listNews = async (params = {}) => {
	const { data } = await publicHttp.get("/api/news", {
		params: {
			limit: 10,
			page: 1,
			sort: "createdAt",
			sortDirection: "desc",
			...params
		}
	});
	const result = unwrapResult(data);
	return result?.news || result?.items || (Array.isArray(result) ? result : []);
};

export const getNewsBySlug = async (slug) => {
	const { data } = await publicHttp.get(`/api/news/${encodeURIComponent(slug)}`);
	const result = unwrapResult(data);
	return result?.news || result;
};
