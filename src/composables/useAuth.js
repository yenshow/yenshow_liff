import { computed, ref } from "vue";
import { getHubMe, verifyOrderBind } from "@/api/hub";
import { useLiff } from "@/composables/useLiff";

const booting = ref(true);
const bound = ref(false);
const customer = ref(null);
const lineProfile = ref(null);
const authError = ref("");
let bootPromise = null;

const applyMe = (me) => {
	bound.value = Boolean(me?.bound);
	customer.value = me?.customer || null;
};

export const useAuth = () => {
	const { ensureInit, getProfile } = useLiff();
	const companyName = computed(() => customer.value?.companyName || "");

	const refreshMe = async () => {
		try {
			const me = await getHubMe();
			applyMe(me);
			return me;
		} catch (err) {
			const status = err?.response?.status;
			if (status === 401 || status === 403) {
				applyMe({ bound: false, customer: null });
				return { bound: false, customer: null };
			}
			throw err;
		}
	};

	const boot = async () => {
		if (bootPromise) return bootPromise;
		bootPromise = (async () => {
			booting.value = true;
			authError.value = "";
			try {
				const instance = await ensureInit();
				if (!instance) return { redirectedToLogin: true };
				lineProfile.value = await getProfile();
				try {
					await refreshMe();
				} catch (err) {
					applyMe({ bound: false, customer: null });
					console.warn("Hub /me 失敗:", err?.message || err);
				}
				return { redirectedToLogin: false };
			} catch (err) {
				authError.value = err?.response?.data?.message || err?.message || "載入失敗";
				throw err;
			} finally {
				booting.value = false;
				bootPromise = null;
			}
		})();
		return bootPromise;
	};

	const bindWithOrder = async ({ orderNo, taxId }) => {
		const result = await verifyOrderBind({ orderNo, taxId });
		applyMe(result);
		return result;
	};

	return {
		booting,
		bound,
		customer,
		companyName,
		lineProfile,
		authError,
		boot,
		refreshMe,
		bindWithOrder
	};
};
