/** 簡易從 Tiptap JSON 抽出純文字摘要 */
export const tiptapToPlainText = (doc, maxLength = 280) => {
	if (!doc) return "";
	const chunks = [];

	const walk = (node) => {
		if (!node) return;
		if (node.type === "text" && node.text) {
			chunks.push(node.text);
			return;
		}
		if (Array.isArray(node.content)) {
			node.content.forEach(walk);
		}
	};

	walk(doc);
	const text = chunks.join("").replace(/\s+/g, " ").trim();
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}…`;
};
