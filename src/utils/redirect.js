/** 僅允許站內相對路徑，避免 open redirect */
export const resolveSafeRedirect = (value) => {
	if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
	if (value.startsWith("/bind")) return "/";
	return value;
};
