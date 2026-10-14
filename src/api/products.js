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

const normalizeDocumentUrl = (documentUrl) => {
	let url = String(documentUrl || "").trim();
	for (let i = 0; i < 5; i++) {
		try {
			const next = decodeURIComponent(url.replace(/\+/g, "%20"));
			if (next === url) break;
			url = next;
		} catch {
			break;
		}
	}
	if (/^https?:\/\//i.test(url)) {
		try {
			url = new URL(url).pathname;
		} catch {
			/* keep */
		}
	}
	if (!url.startsWith("/")) url = `/${url}`;
	return url;
};

const encodeStoragePath = (storagePath) =>
	String(storagePath || "")
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");

/** 活躍產品免登入換證；僅供 LIFF 開啟頁使用 */
export const buildPublicDocumentUrl = async ({ productId, documentUrl }) => {
	const { data } = await publicHttp.get("/api/documents/specifications/public-url", {
		params: { productId, documentUrl: normalizeDocumentUrl(documentUrl) }
	});
	const { storagePath, token } = unwrapResult(data) || {};
	if (!storagePath || !token) throw new Error("無法取得開啟連結");
	return resolveApiUrl(`/storage/${encodeStoragePath(storagePath)}?dl=${encodeURIComponent(token)}`);
};
