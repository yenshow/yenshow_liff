export { resolveApiUrl as mediaUrl } from "@/api/http";

const PO_DUMP_RE = /_PO\d+|PO\d{6,}/i;

const isPoDumpName = (value) => {
	const text = String(value || "").trim();
	if (!text) return true;
	if (PO_DUMP_RE.test(text) && (text.includes(",") || /^S?\d*_?PO/i.test(text.replace(/\s/g, "")))) {
		return true;
	}
	return false;
};

/** 列表／詳情標題：可讀專案名 → 內部單號 → id。PO 清單不當標題。 */
export const orderTitle = (order, fallback = "訂單") => {
	const projectName = String(order?.projectName || "").trim();
	if (projectName && !isPoDumpName(projectName)) return projectName;

	const orderNo = String(order?.orderNo || order?.internalOrderNo || "").trim();
	if (orderNo && !isPoDumpName(orderNo)) return orderNo;

	const id = String(order?.id || "").trim();
	if (id && !isPoDumpName(id)) return id;

	return fallback;
};

export const localizedText = (value, fallback = "") => {
	if (!value) return fallback;
	if (typeof value === "string") return value;
	return value.TW || value.EN || fallback;
};

/** 規格書按鈕：依語系標示，不暴露原檔名 */
export const productSpecDocuments = (product) => {
	if (!product) return [];
	const docs = [];
	const tw = (product.documentsByLang?.TW || []).find(Boolean);
	const en = (product.documentsByLang?.EN || []).find(Boolean);
	if (tw) docs.push({ lang: "TW", label: "中文規格書", url: tw });
	if (en) docs.push({ lang: "EN", label: "英文規格書", url: en });
	if (docs.length) return docs;

	const legacy = (product.documents || []).filter(Boolean);
	if (legacy[0]) docs.push({ lang: "LEGACY", label: "規格書", url: legacy[0] });
	return docs;
};
