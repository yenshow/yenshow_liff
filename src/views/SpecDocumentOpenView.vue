<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { buildPublicDocumentUrl } from "@/api/products";

/** LIFF 專屬開啟頁：fetch→blob，避免 API /storage 失敗時 302 到官網登入 */
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref("");

const handleOpen = async () => {
	loading.value = true;
	error.value = "";

	const productId = String(route.query.productId || "").trim();
	const documentUrl = String(route.query.documentUrl || "").trim();
	if (!productId || !documentUrl) {
		loading.value = false;
		error.value = "缺少規格書參數";
		return;
	}

	try {
		const signedUrl = await buildPublicDocumentUrl({ productId, documentUrl });
		const res = await fetch(signedUrl, {
			credentials: "omit",
			redirect: "manual",
			headers: { Accept: "application/json" }
		});
		if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) {
			throw new Error("下載被重新導向，請重試");
		}
		if (!res.ok) {
			throw new Error(res.status === 403 ? "下載憑證無效或已過期" : `無法下載規格書（${res.status}）`);
		}

		window.location.replace(URL.createObjectURL(await res.blob()));
	} catch (err) {
		loading.value = false;
		error.value = err?.message || "無法開啟規格書";
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
