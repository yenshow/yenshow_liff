import { cachedFetch } from "@/utils/apiCache";
import { publicHttp, resolveApiUrl, unwrapResult } from "./http";

export const searchProducts = async (q) => {
	const keyword = (q || "").trim();
	const fetchSearch = async () => {
		const { data } = await publicHttp.get("/api/products/search", {
			params: {
				keyword: keyword || undefined,
				limit: 10,
				searchBy: "code",
				sort: "createdAt",
				sortDirection: "desc"
			}
		});
		const result = unwrapResult(data);
		return result?.productsList || result?.products || [];
	};

	// 空關鍵字供首頁與規格頁共用
	return keyword ? fetchSearch() : cachedFetch("products:search:", fetchSearch);
};

export const getProduct = async (id) => {
	const { data } = await publicHttp.get(`/api/products/${encodeURIComponent(id)}`);
	const result = unwrapResult(data);
	const product = result?.products ?? result?.product ?? result?.productsList ?? result;
	return Array.isArray(product) ? product[0] : product;
};

export const buildPublicDocumentUrl = async ({ productId, documentUrl }) => {
	const { data } = await publicHttp.get("/api/documents/specifications/public-url", {
		params: { productId, documentUrl }
	});
	const { storagePath, token } = unwrapResult(data) || {};
	if (!storagePath || !token) throw new Error("無法取得開啟連結");
	return resolveApiUrl(`/storage/${storagePath}?dl=${encodeURIComponent(token)}`);
};
