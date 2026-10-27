let initPromise = null;
let liffModule = null;

const mockLineUserId = () => String(import.meta.env.VITE_MOCK_LINE_USER_ID || "").trim();

/** 本機開發：跳過 LINE OAuth（localhost 通常未登錄為 redirect URI） */
const shouldSkipLiffLogin = () => {
	if (import.meta.env.VITE_SKIP_LIFF_LOGIN === "true") return true;
	if (mockLineUserId()) return true;
	return false;
};

const lineOaBasicId = () => String(import.meta.env.VITE_LINE_OA_ID || "").trim().replace(/^@/, "");

const trimSlash = (value) => String(value || "").replace(/\/+$/, "");

const officialSiteBase = () =>
	trimSlash(import.meta.env.VITE_OFFICIAL_SITE_URL || "https://www.yenshow.com");

const createMockLiff = () => {
	const userId = mockLineUserId() || "U_local_dev_user";
	return {
		isLoggedIn: () => true,
		isInClient: () => false,
		getIDToken: () => null,
		getProfile: async () => ({
			userId,
			displayName: "本機開發使用者",
			pictureUrl: ""
		}),
		openWindow: ({ url }) => {
			window.open(url, "_blank", "noopener,noreferrer");
		},
		sendMessages: async () => {
			throw new Error("本機環境無法傳送 LINE 訊息");
		},
		closeWindow: () => {}
	};
};

const loadLiff = async () => {
	if (liffModule) return liffModule;
	const mod = await import("@line/liff");
	liffModule = mod.default;
	return liffModule;
};

export const useLiff = () => {
	const ensureInit = async () => {
		if (!initPromise) {
			initPromise = (async () => {
				if (shouldSkipLiffLogin()) {
					const mock = createMockLiff();
					liffModule = mock;
					console.info("[LIFF] 已跳過 LINE 登入（本機 mock）", mockLineUserId() || "U_local_dev_user");
					return mock;
				}

				const liff = await loadLiff();
				const liffId = import.meta.env.VITE_LIFF_ID;
				if (!liffId) throw new Error("尚未設定 VITE_LIFF_ID");

				await liff.init({ liffId });
				if (!liff.isLoggedIn()) {
					liff.login({ redirectUri: window.location.href });
					return null;
				}
				return liff;
			})().catch((err) => {
				initPromise = null;
				throw err;
			});
		}
		return initPromise;
	};

	const getProfile = async () => {
		const instance = await ensureInit();
		if (!instance) return null;
		try {
			return await instance.getProfile();
		} catch {
			return null;
		}
	};

	const getIdToken = async () => {
		if (shouldSkipLiffLogin()) return null;
		const instance = await ensureInit();
		if (!instance) return null;
		try {
			return instance.getIDToken?.() || null;
		} catch {
			return null;
		}
	};

	/**
	 * 詢問業務：優先在 LINE App 內傳訊息給 OA，再關閉 LIFF 回到聊天室；
	 * 否則開啟 line.me 預填訊息（需設定 VITE_LINE_OA_ID）。
	 */
	const askSalesViaLine = async (text) => {
		const message = String(text || "").trim();
		if (!message) throw new Error("訊息內容為空");

		await ensureInit();
		const inClient = Boolean(liffModule?.isInClient?.());

		if (inClient && typeof liffModule.sendMessages === "function") {
			try {
				await liffModule.sendMessages([{ type: "text", text: message }]);
				liffModule.closeWindow?.();
				return { method: "sendMessages" };
			} catch {
				// 非聊天室開啟、或未開 chat_message.write 時改走 OA 連結
			}
		}

		const oaId = lineOaBasicId();
		if (oaId) {
			const url = `https://line.me/R/oaMessage/@${oaId}/?text=${encodeURIComponent(message)}`;
			if (inClient) {
				liffModule.openWindow({ url, external: false });
			} else {
				window.open(url, "_blank", "noopener,noreferrer");
			}
			return { method: "oaMessage" };
		}

		throw new Error("請從 LINE 官方帳號開啟此頁，或設定 VITE_LINE_OA_ID 後再試");
	};

	/** LINE 內用系統瀏覽器開 HTTPS；其他環境開新分頁。勿傳 blob: */
	const openExternalUrl = async (url) => {
		const target = String(url || "").trim();
		if (!/^https?:\/\//i.test(target)) throw new Error("網址無效");

		await ensureInit();
		if (liffModule?.isInClient?.() && typeof liffModule.openWindow === "function") {
			liffModule.openWindow({ url: target, external: true });
			return;
		}
		window.open(target, "_blank", "noopener,noreferrer");
	};

	/** 開啟官網最新消息全文（LINE Client 用 external 瀏覽器） */
	const openOfficialNews = async (slug) => {
		const cleanSlug = String(slug || "")
			.trim()
			.toLowerCase();
		if (!cleanSlug) throw new Error("消息 slug 為空");

		await openExternalUrl(`${officialSiteBase()}/news/${encodeURIComponent(cleanSlug)}`);
	};

	return { ensureInit, getProfile, getIdToken, askSalesViaLine, openOfficialNews, openExternalUrl };
};
