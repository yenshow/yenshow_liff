import { computed, ref } from "vue";
import { getHubMe, unbindCompany as unbindCompanyRequest, verifyOrderBind } from "@/api/hub";
import { useLiff } from "@/composables/useLiff";
import { cacheInvalidate } from "@/utils/apiCache";

const booted = ref(false);
const bound = ref(false);
const customer = ref(null);
const lineProfile = ref(null);
const authError = ref("");
const hubUnavailable = ref(false);
const hubError = ref("");
let bootPromise = null;

const MAINTENANCE_MESSAGE = "服務暫時無法連線，系統維護中，請稍後再試。";

const applyMe = (me) => {
	bound.value = Boolean(me?.bound);
	customer.value = me?.customer || null;
};

const clearHubUnavailable = () => {
	hubUnavailable.value = false;
	hubError.value = "";
};

const markHubUnavailable = (err) => {
	hubUnavailable.value = true;
	hubError.value = err?.response?.data?.message || MAINTENANCE_MESSAGE;
};

export const useAuth = () => {
	const { ensureInit, getProfile } = useLiff();
	const companyName = computed(() => customer.value?.companyName || "");

	const refreshMe = async () => {
		try {
			const me = await getHubMe();
			applyMe(me);
			clearHubUnavailable();
			return me;
		} catch (err) {
			const status = err?.response?.status;
			if (status === 401 || status === 403) {
				applyMe({ bound: false, customer: null });
				clearHubUnavailable();
				return { bound: false, customer: null };
			}
			markHubUnavailable(err);
			throw err;
		}
	};

	const boot = async ({ force = false } = {}) => {
		if (!force && booted.value) return { redirectedToLogin: false };
		if (bootPromise) return bootPromise;

		if (force) cacheInvalidate("hub:me");

		bootPromise = (async () => {
			authError.value = "";
			try {
				const instance = await ensureInit();
				if (!instance) return { redirectedToLogin: true };

				lineProfile.value = await getProfile();
				try {
					await refreshMe();
				} catch (err) {
					// 非 401/403：保留既有綁定狀態，交給 App 顯示維護錯誤
					console.warn("Hub /me 失敗:", err?.message || err);
				}
				booted.value = true;
				return { redirectedToLogin: false };
			} catch (err) {
				authError.value = err?.response?.data?.message || err?.message || "載入失敗";
				booted.value = false;
				throw err;
			} finally {
				bootPromise = null;
			}
		})();

		return bootPromise;
	};

	const bindWithOrder = async ({ orderNo, taxId }) => {
		const result = await verifyOrderBind({ orderNo, taxId });
		applyMe(result);
		clearHubUnavailable();
		return result;
	};

	const unbindCompany = async () => {
		const result = await unbindCompanyRequest();
		applyMe({ bound: false, customer: null });
		clearHubUnavailable();
		return result;
	};

	return {
		booted,
		bound,
		companyName,
		lineProfile,
		authError,
		hubUnavailable,
		hubError,
		boot,
		bindWithOrder,
		unbindCompany
	};
};
