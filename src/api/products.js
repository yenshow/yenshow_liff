import { publicHttp, apiBase, unwrapResult } from "./http";

export const searchProducts = async (q) => {
	const { data } = await publicHttp.get("/api/products/search", {
		params: { keyword: q || undefined, limit: 20 }
	});
	const result = unwrapResult(data);
	return result?.productsList || result?.products || [];
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
	if (!storagePath || !token) throw new Error("無法取得下載連結");
	return `${apiBase()}/storage/${storagePath}?dl=${encodeURIComponent(token)}`;
};
