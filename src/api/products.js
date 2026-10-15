import { cachedFetch } from "@/utils/apiCache";
import { hubHttp, publicHttp, resolveApiUrl, unwrapResult } from "./http";

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

const encodeStoragePath = (storagePath) =>
	String(storagePath || "")
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");

/** LINE idToken 換證；需已完成 LIFF Login（不需 CRM 綁定）。路徑正規化由 server toStoragePath 處理。 */
export const buildSignedDocumentUrl = async ({ productId, documentUrl }) => {
	const { data } = await hubHttp.get("/api/documents/specifications/liff-presign", {
		params: { productId, documentUrl: String(documentUrl || "").trim() }
	});
	const { storagePath, token } = unwrapResult(data) || {};
	if (!storagePath || !token) throw new Error("無法取得開啟連結");
	return resolveApiUrl(`/storage/${encodeStoragePath(storagePath)}?dl=${encodeURIComponent(token)}`);
};
