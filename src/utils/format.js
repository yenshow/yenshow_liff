import { apiBase } from "@/api/http";

export const localizedText = (value, fallback = "") => {
	if (!value) return fallback;
	if (typeof value === "string") return value;
	return value.TW || value.EN || fallback;
};

export const mediaUrl = (path) => {
	if (!path) return "";
	const raw = String(path);
	if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
	const base = apiBase();
	return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
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
