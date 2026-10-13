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

export const productDocumentUrls = (product) => {
	if (!product) return [];
	const byLang = [...(product.documentsByLang?.TW || []), ...(product.documentsByLang?.EN || [])];
	const legacy = product.documents || [];
	return [...new Set([...byLang, ...legacy].filter(Boolean))];
};

export const fileNameFromUrl = (documentUrl) => {
	const parts = String(documentUrl).split("/");
	return parts[parts.length - 1] || "規格書.pdf";
};
