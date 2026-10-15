<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { buildSignedDocumentUrl, getProduct } from "@/api/products";
import { useLiff } from "@/composables/useLiff";
import { productSpecDocuments } from "@/utils/format";

/** 以 productId+lang 取檔，避免中文路徑經 query 損壞 */
const route = useRoute();
const router = useRouter();
const { ensureInit } = useLiff();

const loading = ref(true);
const error = ref("");

const handleOpen = async () => {
	loading.value = true;
	error.value = "";

	const productId = String(route.query.productId || "").trim();
	const lang = String(route.query.lang || "").trim();
	if (!productId || !lang) {
		loading.value = false;
		error.value = "缺少規格書參數";
		return;
	}

	try {
		const liff = await ensureInit();
		// 尚未完成 LINE Login 時會導向授權頁，此輪先中止
		if (!liff) return;

		const product = await getProduct(productId);
		const doc = productSpecDocuments(product).find((item) => item.lang === lang);
		if (!doc?.url) throw new Error("找不到對應規格書");

		const signedUrl = await buildSignedDocumentUrl({ productId, documentUrl: doc.url });
		const res = await fetch(signedUrl, {
			credentials: "omit",
			redirect: "manual",
			headers: { Accept: "application/json" }
		});
		if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) {
			throw new Error("下載被重新導向，請重試");
		}
		if (!res.ok) {
			let message = "";
			try {
				message = (await res.json())?.message || "";
			} catch {
				/* ignore */
			}
			throw new Error(message || (res.status === 403 ? "下載憑證無效或已過期" : `無法下載規格書（${res.status}）`));
		}

		window.location.replace(URL.createObjectURL(await res.blob()));
	} catch (err) {
		loading.value = false;
		error.value = err?.response?.data?.message || err?.message || "無法開啟規格書";
	}
};

const handleBack = () => {
	if (window.history.length > 1) {
		router.back();
		return;
	}
	router.replace({ name: "products" });
};

onMounted(handleOpen);
</script>

<template>
	<div class="space-y-4 py-6">
		<button
			type="button"
			class="cursor-pointer text-sm text-ys-mid"
			aria-label="返回"
			tabindex="0"
			@click="handleBack"
		>
			← 返回
		</button>

		<p v-if="loading" class="text-sm text-ys-muted" aria-live="polite">正在開啟規格書…</p>

		<template v-else>
			<p class="text-sm text-red-600" role="alert">{{ error }}</p>
			<button
				type="button"
				class="cursor-pointer rounded-xl bg-ys-mid px-4 py-2.5 text-sm font-semibold text-white"
				aria-label="重試開啟規格書"
				tabindex="0"
				@click="handleOpen"
			>
				重試
			</button>
		</template>
	</div>
</template>
