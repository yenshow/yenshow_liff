<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const router = useRouter();
const { bindWithOrder, authError, boot } = useAuth();

const orderNo = ref("");
const taxId = ref("");
const loading = ref(false);
const error = ref("");

const handleRetry = () => boot({ force: true });

const handleSubmit = async () => {
	loading.value = true;
	error.value = "";
	try {
		await bindWithOrder({
			orderNo: orderNo.value.trim(),
			taxId: taxId.value.trim()
		});
		const redirect = typeof route.query.redirect === "string" && route.query.redirect.startsWith("/") ? route.query.redirect : "/";
		await router.replace(redirect.startsWith("//") || redirect.startsWith("/bind") ? "/" : redirect);
	} catch (err) {
		const status = err?.response?.status;
		const apiMessage = err?.response?.data?.message || err?.message;
		if (status === 409) {
			error.value = apiMessage || "同一客戶有多筆符合訂單，請改輸入完整內部單號";
		} else {
			error.value = apiMessage || "綁定失敗";
		}
	} finally {
		loading.value = false;
	}
};
</script>

<template>
	<div class="space-y-4">
		<section>
			<h1 class="text-xl font-semibold text-ys-deep">帳號綁定</h1>
			<p class="mt-1 text-sm text-ys-muted">
				請輸入完整內部訂單編號（例如 ORD-2026-0130）與 8 位統一編號。完整 PO 請整段貼上；合併清單中的單一 PO 無法查詢。
			</p>
		</section>

		<div v-if="authError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
			{{ authError }}
			<button type="button" class="mt-3 block w-full rounded-xl bg-red-600 px-3 py-2 text-white" aria-label="重試" @click="handleRetry">重試</button>
		</div>

		<form class="space-y-3 rounded-2xl border border-ys-line bg-white p-4 shadow-sm" @submit.prevent="handleSubmit">
			<label class="block">
				<span class="mb-1 block text-sm font-medium">訂單編號</span>
				<input
					v-model="orderNo"
					type="text"
					required
					placeholder="例如 ORD-2026-0130"
					class="w-full rounded-xl border border-ys-line px-3 py-2.5"
					aria-label="訂單編號"
				/>
			</label>
			<label class="block">
				<span class="mb-1 block text-sm font-medium">統一編號</span>
				<input
					v-model="taxId"
					type="text"
					required
					inputmode="numeric"
					placeholder="例如 83124007"
					class="w-full rounded-xl border border-ys-line px-3 py-2.5"
					aria-label="統一編號"
				/>
			</label>
			<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
			<button
				type="submit"
				class="w-full rounded-xl bg-ys-mid px-4 py-3 font-semibold text-white disabled:opacity-60"
				:disabled="loading"
				aria-label="確認綁定"
			>
				{{ loading ? "驗證中…" : "確認綁定" }}
			</button>
		</form>
	</div>
</template>
